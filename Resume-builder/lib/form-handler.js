/**
 * Refactored Resume Form Handler
 * Production-Ready, Modular, Secure
 * 
 * Features:
 * - Data validation & sanitization
 * - Google Sheets integration
 * - Email delivery
 * - ATS score calculation
 * - Resume preview generation
 * - Error handling
 */

// ============================================
// 1. CONFIGURATION & ENVIRONMENT
// ============================================

const CONFIG = {
  SHEET_SCRIPT_URL: process.env.VITE_SHEET_SCRIPT_URL || '',
  SMTP_EMAIL: process.env.VITE_SMTP_EMAIL || '',
  SMTP_PASS: process.env.VITE_SMTP_PASS || '',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX: 5, // Max 5 submissions per minute
  VALIDATION_RULES: {
    fullName: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, type: 'email' },
    phone: { required: false, pattern: /^\+?[\d\s\-()]{10,}$/ },
    degree: { required: false, maxLength: 200 },
    institution: { required: false, maxLength: 200 },
  }
};

// ============================================
// 2. RATE LIMITING
// ============================================

class RateLimiter {
  constructor(windowMs = CONFIG.RATE_LIMIT_WINDOW, maxRequests = CONFIG.RATE_LIMIT_MAX) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const times = this.requests.get(key);
    const validTimes = times.filter(time => now - time < this.windowMs);
    
    if (validTimes.length < this.maxRequests) {
      validTimes.push(now);
      this.requests.set(key, validTimes);
      return true;
    }

    return false;
  }
}

const rateLimiter = new RateLimiter();

// ============================================
// 3. DATA VALIDATION & SANITIZATION
// ============================================

class FormValidator {
  /**
   * Validate individual field
   */
  static validateField(fieldName, value, rule) {
    // Check required
    if (rule.required && (!value || value.trim() === '')) {
      return { valid: false, error: `${fieldName} is required` };
    }

    // Skip further validation if not required and empty
    if (!rule.required && (!value || value.trim() === '')) {
      return { valid: true };
    }

    // Check type
    if (rule.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      return { valid: false, error: `${fieldName} format is invalid` };
    }

    // Check length
    if (rule.minLength && value.length < rule.minLength) {
      return { valid: false, error: `${fieldName} too short` };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return { valid: false, error: `${fieldName} too long` };
    }

    return { valid: true };
  }

  /**
   * Validate entire form data
   */
  static validateFormData(data) {
    const errors = {};

    for (const [field, rule] of Object.entries(CONFIG.VALIDATION_RULES)) {
      const value = data[field];
      const validation = this.validateField(field, value, rule);
      
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// ============================================
// 4. INPUT SANITIZATION
// ============================================

class InputSanitizer {
  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHtml(text) {
    if (!text) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email) {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize phone
   */
  static sanitizePhone(phone) {
    return phone.replace(/[^\d+\-()]/g, '').trim();
  }

  /**
   * Sanitize all form data
   */
  static sanitizeFormData(data) {
    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (key === 'email') {
          sanitized[key] = this.sanitizeEmail(value);
        } else if (key === 'phone') {
          sanitized[key] = this.sanitizePhone(value);
        } else {
          sanitized[key] = this.sanitizeHtml(value);
        }
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => 
          typeof v === 'string' ? this.sanitizeHtml(v) : v
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// ============================================
// 5. DATA COLLECTION
// ============================================

class FormDataCollector {
  /**
   * Collect values from multiple input fields
   */
  static getMultipleValues(fieldName) {
    return Array.from(document.getElementsByName(fieldName))
      .map(input => input.value)
      .filter(value => value.trim() !== '');
  }

  /**
   * Collect all form data
   */
  static collectFormData() {
    return {
      // Personal Info
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      portfolio: document.getElementById('portfolio').value,

      // Professional Summary
      objective: document.getElementById('objective').value,

      // Education
      degrees: this.getMultipleValues('degree[]'),
      institutions: this.getMultipleValues('institution[]'),
      durations: this.getMultipleValues('duration[]'),
      cgpas: this.getMultipleValues('cgpa[]'),

      // Experience
      jobTitles: this.getMultipleValues('jobTitle[]'),
      companies: this.getMultipleValues('company[]'),
      expDurations: this.getMultipleValues('expDuration[]'),
      responsibilities: this.getMultipleValues('responsibilities[]'),

      // Projects
      projectNames: this.getMultipleValues('projectName[]'),
      techUsed: this.getMultipleValues('techUsed[]'),
      projectDesc: this.getMultipleValues('projectDesc[]'),
      projectLinks: this.getMultipleValues('projectLinks[]'),

      // Skills
      techSkills: (document.querySelector('textarea[name="programmingLanguages"]').value || '')
        .split(',').map(s => s.trim()).filter(s => s),
      softSkills: (document.querySelector('textarea[name="toolsFrameworks"]').value || '')
        .split(',').map(s => s.trim()).filter(s => s),

      // Certifications
      certNames: this.getMultipleValues('certName[]'),
      certAuthorities: this.getMultipleValues('certAuthority[]'),
      certYears: this.getMultipleValues('certYear[]'),

      // Languages
      languages: (document.querySelector('input[name="languages"]').value || '')
        .split(',').map(s => s.trim()).filter(s => s),

      // Custom Sections
      customSectionTitles: this.getMultipleValues('customSectionTitle[]'),
      customSectionIcons: this.getMultipleValues('customSectionIcon[]'),
      customSectionContents: this.getMultipleValues('customSectionContent[]'),

      // Metadata
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

// ============================================
// 6. GOOGLE SHEETS INTEGRATION
// ============================================

class GoogleSheetsHandler {
  /**
   * Save form data to Google Sheets
   */
  static async saveToSheet(data) {
    if (!CONFIG.SHEET_SCRIPT_URL) {
      console.warn('Google Sheets URL not configured');
      return { success: false, error: 'Sheet not configured' };
    }

    let lastError = null;

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(CONFIG.SHEET_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            action: 'save',
            data: data
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };

      } catch (error) {
        lastError = error;
        if (attempt < CONFIG.MAX_RETRIES) {
          await new Promise(resolve => 
            setTimeout(resolve, CONFIG.RETRY_DELAY * attempt)
          );
        }
      }
    }

    return { 
      success: false, 
      error: `Failed after ${CONFIG.MAX_RETRIES} attempts: ${lastError.message}` 
    };
  }

  /**
   * Retrieve submissions from Google Sheets (optional)
   */
  static async getSubmissions(email) {
    // Implementation depends on your Apps Script setup
    // This is a template for future use
    try {
      const response = await fetch(CONFIG.SHEET_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'get',
          email: email
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to retrieve submissions:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// 7. EMAIL DELIVERY
// ============================================

class EmailHandler {
  /**
   * Send confirmation email
   */
  static async sendConfirmationEmail(data, atsScore) {
    // Option 1: Using Email.js
    if (typeof emailjs !== 'undefined') {
      return this.sendViaEmailJS(data, atsScore);
    }

    // Option 2: Using backend API
    return this.sendViaBackend(data, atsScore);
  }

  static async sendViaEmailJS(data, atsScore) {
    try {
      const templateParams = {
        to_email: data.email,
        user_name: data.fullName,
        ats_score: atsScore,
        submission_time: new Date().toLocaleString(),
        resume_link: `${window.location.origin}/resume/${data.email}`
      };

      const result = await emailjs.send(
        'service_xxxxx',      // Replace with your service ID
        'template_xxxxx',     // Replace with your template ID
        templateParams,
        'user_xxxxx'          // Replace with your user ID
      );

      return { success: true, messageId: result.status };

    } catch (error) {
      console.error('Email.js error:', error);
      return { success: false, error: error.text };
    }
  }

  static async sendViaBackend(data, atsScore) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          fullName: data.fullName,
          atsScore: atsScore,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      return { success: true };

    } catch (error) {
      console.error('Backend email error:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// 8. ATS SCORE CALCULATOR
// ============================================

class ATSScoreCalculator {
  /**
   * Calculate ATS compatibility score
   */
  static calculateScore(data) {
    let score = 0;

    // Structure (30 points)
    const structure = this.scoreStructure(data);
    score += structure;

    // Content (40 points)
    const content = this.scoreContent(data);
    score += content;

    // Technical (20 points)
    const technical = this.scoreTechnical(data);
    score += technical;

    // Optimization (10 points)
    const optimization = this.scoreOptimization(data);
    score += optimization;

    return Math.min(100, score);
  }

  static scoreStructure(data) {
    let points = 0;

    // Has all sections
    if (data.degrees && data.degrees.length > 0) points += 5;
    if (data.jobTitles && data.jobTitles.length > 0) points += 5;
    if (data.techSkills && data.techSkills.length > 0) points += 5;
    if (data.projectNames && data.projectNames.length > 0) points += 5;
    if (data.certNames && data.certNames.length > 0) points += 5;
    if (data.objective) points += 5;

    return Math.min(points, 30);
  }

  static scoreContent(data) {
    let points = 0;

    // Keywords & content quality
    const allText = JSON.stringify(data).toLowerCase();
    const keywordCategories = {
      technical: ['python', 'javascript', 'java', 'react', 'node', 'sql', 'api'],
      actionVerbs: ['developed', 'implemented', 'designed', 'optimized', 'managed', 'created'],
      achievements: ['improved', 'increased', 'reduced', 'achieved', 'delivered']
    };

    // Score for keywords
    for (const keywords of Object.values(keywordCategories)) {
      const found = keywords.filter(kw => allText.includes(kw)).length;
      points += Math.min(found, 5);
    }

    // Score for responsibilities details
    if (data.responsibilities && data.responsibilities.length > 0) {
      const avgLength = data.responsibilities.reduce((sum, r) => sum + r.length, 0) / data.responsibilities.length;
      if (avgLength > 30) points += 5;
    }

    // Score for projects description
    if (data.projectDesc && data.projectDesc.length > 0) {
      const avgLength = data.projectDesc.reduce((sum, d) => sum + d.length, 0) / data.projectDesc.length;
      if (avgLength > 20) points += 5;
    }

    return Math.min(points, 40);
  }

  static scoreTechnical(data) {
    let points = 20; // Start with full points

    // Deduct for potential issues
    // Check for URLs (good for ATS)
    if (!data.portfolio) points -= 2;
    
    // Check for consistent date format
    const dateIssues = this.checkDateFormats(data);
    if (dateIssues > 0) points -= Math.min(dateIssues, 5);

    return Math.max(0, Math.min(points, 20));
  }

  static scoreOptimization(data) {
    let points = 0;

    if (data.fullName) points += 2;
    if (data.email) points += 2;
    if (data.phone) points += 2;
    if (data.address) points += 2;
    if (data.portfolio) points += 2;

    return Math.min(points, 10);
  }

  static checkDateFormats(data) {
    const datePattern = /(\d{4})|([A-Z][a-z]{2} \d{4})/;
    let issues = 0;

    if (data.durations) {
      data.durations.forEach(duration => {
        if (!datePattern.test(duration)) issues++;
      });
    }

    return issues;
  }
}

// ============================================
// 9. FORM SUBMISSION HANDLER
// ============================================

class ResumeFormSubmitter {
  /**
   * Handle complete form submission
   */
  static async handleSubmit(event) {
    event.preventDefault();

    // Rate limiting check
    if (!rateLimiter.isAllowed(this.getUserId())) {
      this.showError('Too many submissions. Please wait before submitting again.');
      return;
    }

    try {
      // Show loading state
      this.setLoadingState(true);

      // Collect form data
      const rawData = FormDataCollector.collectFormData();

      // Validate
      const validation = FormValidator.validateFormData(rawData);
      if (!validation.isValid) {
        this.showValidationErrors(validation.errors);
        this.setLoadingState(false);
        return;
      }

      // Sanitize
      const cleanData = InputSanitizer.sanitizeFormData(rawData);

      // Calculate ATS score
      const atsScore = ATSScoreCalculator.calculateScore(cleanData);

      // Save to Google Sheets
      const sheetResult = await GoogleSheetsHandler.saveToSheet({
        ...cleanData,
        atsScore: atsScore
      });

      if (!sheetResult.success) {
        console.warn('Sheet save failed:', sheetResult.error);
      }

      // Send confirmation email
      const emailResult = await EmailHandler.sendConfirmationEmail(cleanData, atsScore);

      if (!emailResult.success) {
        console.warn('Email send failed:', emailResult.error);
      }

      // Generate resume preview
      this.updateResumePreview(cleanData, atsScore);

      // Show success
      this.showSuccess({
        message: 'Resume generated successfully!',
        atsScore: atsScore,
        sheetSaved: sheetResult.success,
        emailSent: emailResult.success
      });

      // Hide loading
      this.setLoadingState(false);

    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(`Error: ${error.message}`);
      this.setLoadingState(false);
    }
  }

  static updateResumePreview(data, atsScore) {
    // Delegate to resume generator (see resume-generator.js)
    if (typeof ResumeGenerator !== 'undefined') {
      ResumeGenerator.generateATS(data, atsScore);
    }
  }

  static setLoadingState(isLoading) {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = isLoading;
      btn.textContent = isLoading ? '⏳ Generating...' : '✨ Generate Resume';
    }
  }

  static getUserId() {
    // Use email if available, otherwise use session
    const email = document.getElementById('email').value;
    return email || session.getId();
  }

  static showValidationErrors(errors) {
    const message = Object.values(errors).join('\n');
    alert('❌ Please fix these errors:\n' + message);
  }

  static showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.cssText = `
      background: #fee;
      color: #c33;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    `;
    document.querySelector('form').insertAdjacentElement('afterend', errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  static showSuccess(info) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.innerHTML = `
      <strong>✅ Success!</strong><br>
      ATS Score: <strong>${info.atsScore}/100</strong><br>
      ${info.sheetSaved ? '✓ Saved to database' : ''}<br>
      ${info.emailSent ? '✓ Email sent' : '⚠ Email not sent'}
    `;
    successDiv.style.cssText = `
      background: #efe;
      color: #3c3;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      border-left: 4px solid #3c3;
    `;
    document.querySelector('form').insertAdjacentElement('afterend', successDiv);
    setTimeout(() => successDiv.remove(), 10000);
  }
}

// ============================================
// 10. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('resumeForm');
  if (form) {
    form.addEventListener('submit', (e) => ResumeFormSubmitter.handleSubmit(e));
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormValidator,
    InputSanitizer,
    FormDataCollector,
    GoogleSheetsHandler,
    EmailHandler,
    ATSScoreCalculator,
    ResumeFormSubmitter
  };
}
