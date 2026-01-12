/**
 * ATS-OPTIMIZED RESUME BUILDER
 * Single-source-of-truth resume renderer
 * Preview === PDF === Print === Export
 * Google Sheets integration only (no SMTP)
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbyQp0XmC9uQdebn8cMe0LccuFMyvGAytOlFclP6X3-TNev5UGrf2YJ-5lGEBOaVGXE2cQ/exec',
  MIN_NAME_LENGTH: 2,
  FONT_FAMILY: 'Arial, sans-serif',
  LINE_HEIGHT: 1.5,
  COLOR_TEXT: '#000',
  COLOR_BG: '#fff',
};

// ============================================
// STATE MANAGEMENT
// ============================================

const formState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  url: '',
  objective: '',
  
  education: [],
  experience: [],
  skills: { programming: '', soft: '', other: '' },
  projects: [],
  certifications: [],
  additional: { languages: [], achievements: [], hobbies: [] },
  customSections: [],
  
  save() {
    localStorage.setItem('resumeState', JSON.stringify(this));
  },
  
  load() {
    const saved = localStorage.getItem('resumeState');
    if (saved) Object.assign(this, JSON.parse(saved));
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text || '').replace(/[&<>"']/g, m => map[m]);
};

const showNotification = (msg, type = 'info') => {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
    color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
    border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
    border-radius: 4px; z-index: 9999; font-size: 14px; max-width: 400px;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
};

// ============================================
// RESUME RENDERER (SINGLE SOURCE OF TRUTH)
// ============================================

class ResumeRenderer {
  constructor(data) {
    this.data = data;
  }

  /**
   * Renders complete ATS-safe resume HTML
   * Used for: preview, PDF, print, export
   */
  render() {
    return `
<div style="
  font-family: ${CONFIG.FONT_FAMILY};
  line-height: ${CONFIG.LINE_HEIGHT};
  color: ${CONFIG.COLOR_TEXT};
  background: ${CONFIG.COLOR_BG};
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0.5in;
">

${this.renderHeader()}
${this.renderSummary()}
${this.renderEducation()}
${this.renderExperience()}
${this.renderSkills()}
${this.renderProjects()}
${this.renderCertifications()}
${this.renderAdditional()}
${this.renderCustomSections()}

</div>
    `;
  }

  renderHeader() {
    if (!this.data.fullName) return '';
    
    const contact = [
      this.data.email,
      this.data.phone,
      this.data.address,
      this.data.url ? `<a href="${escapeHtml(this.data.url)}" style="color: ${CONFIG.COLOR_TEXT}; text-decoration: none;">${escapeHtml(this.data.url)}</a>` : ''
    ].filter(Boolean).join(' | ');

    return `
<div style="margin-bottom: 0.3in; border-bottom: 1px solid ${CONFIG.COLOR_TEXT}; padding-bottom: 0.1in;">
  <div style="font-size: 16pt; font-weight: bold; margin-bottom: 0.05in;">
    ${escapeHtml(this.data.fullName)}
  </div>
  <div style="font-size: 10pt;">
    ${contact}
  </div>
</div>
    `;
  }

  renderSummary() {
    if (!this.data.objective) return '';
    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">PROFESSIONAL SUMMARY</div>
  <div style="font-size: 10pt;">${escapeHtml(this.data.objective)}</div>
</div>
    `;
  }

  renderEducation() {
    if (!this.data.education || this.data.education.length === 0) return '';
    
    const items = this.data.education.map(edu => `
<div style="margin-bottom: 0.1in;">
  <div style="font-weight: bold; font-size: 10pt;">
    ${escapeHtml(edu.degree || '')}
  </div>
  <div style="font-size: 10pt;">
    ${escapeHtml(edu.institution || '')} | ${escapeHtml(edu.duration || '')}
  </div>
  ${edu.cgpa ? `<div style="font-size: 10pt;">CGPA: ${escapeHtml(edu.cgpa)}</div>` : ''}
</div>
    `).join('');

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">EDUCATION</div>
  ${items}
</div>
    `;
  }

  renderExperience() {
    if (!this.data.experience || this.data.experience.length === 0) return '';
    
    const items = this.data.experience.map(exp => `
<div style="margin-bottom: 0.1in;">
  <div style="font-weight: bold; font-size: 10pt;">
    ${escapeHtml(exp.jobTitle || '')} - ${escapeHtml(exp.company || '')}
  </div>
  <div style="font-size: 10pt; margin-bottom: 0.05in;">
    ${escapeHtml(exp.duration || '')}
  </div>
  ${exp.responsibilities ? `<div style="font-size: 10pt;">• ${escapeHtml(exp.responsibilities)}</div>` : ''}
</div>
    `).join('');

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">PROFESSIONAL EXPERIENCE</div>
  ${items}
</div>
    `;
  }

  renderSkills() {
    const hasSkills = this.data.skills.programming || this.data.skills.soft || this.data.skills.other;
    if (!hasSkills) return '';

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">SKILLS</div>
  ${this.data.skills.programming ? `<div style="font-size: 10pt;"><strong>Technical:</strong> ${escapeHtml(this.data.skills.programming)}</div>` : ''}
  ${this.data.skills.soft ? `<div style="font-size: 10pt;"><strong>Soft Skills:</strong> ${escapeHtml(this.data.skills.soft)}</div>` : ''}
  ${this.data.skills.other ? `<div style="font-size: 10pt;"><strong>Other:</strong> ${escapeHtml(this.data.skills.other)}</div>` : ''}
</div>
    `;
  }

  renderProjects() {
    if (!this.data.projects || this.data.projects.length === 0) return '';
    
    const items = this.data.projects.map(proj => `
<div style="margin-bottom: 0.1in;">
  <div style="font-weight: bold; font-size: 10pt;">
    ${escapeHtml(proj.name || '')}${proj.tech ? ` (${escapeHtml(proj.tech)})` : ''}
  </div>
  ${proj.description ? `<div style="font-size: 10pt;">• ${escapeHtml(proj.description)}</div>` : ''}
  ${proj.link ? `<div style="font-size: 10pt;">• ${escapeHtml(proj.link)}</div>` : ''}
</div>
    `).join('');

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">PROJECTS</div>
  ${items}
</div>
    `;
  }

  renderCertifications() {
    if (!this.data.certifications || this.data.certifications.length === 0) return '';
    
    const items = this.data.certifications.map(cert => `
<div style="margin-bottom: 0.1in;">
  <div style="font-weight: bold; font-size: 10pt;">
    ${escapeHtml(cert.name || '')} - ${escapeHtml(cert.authority || '')}
  </div>
  ${cert.year ? `<div style="font-size: 10pt;">${escapeHtml(cert.year)}</div>` : ''}
</div>
    `).join('');

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">CERTIFICATIONS</div>
  ${items}
</div>
    `;
  }

  renderAdditional() {
    const hasContent = (this.data.additional.languages && this.data.additional.languages.length > 0) ||
                       (this.data.additional.achievements && this.data.additional.achievements.length > 0) ||
                       (this.data.additional.hobbies && this.data.additional.hobbies.length > 0);
    
    if (!hasContent) return '';

    return `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">ADDITIONAL INFORMATION</div>
  ${this.data.additional.languages && this.data.additional.languages.length > 0 ? 
    `<div style="font-size: 10pt;"><strong>Languages:</strong> ${escapeHtml(this.data.additional.languages.join(', '))}</div>` : ''}
  ${this.data.additional.achievements && this.data.additional.achievements.length > 0 ? 
    `<div style="font-size: 10pt;"><strong>Achievements:</strong> ${escapeHtml(this.data.additional.achievements.join(', '))}</div>` : ''}
  ${this.data.additional.hobbies && this.data.additional.hobbies.length > 0 ? 
    `<div style="font-size: 10pt;"><strong>Hobbies:</strong> ${escapeHtml(this.data.additional.hobbies.join(', '))}</div>` : ''}
</div>
    `;
  }

  renderCustomSections() {
    if (!this.data.customSections || this.data.customSections.length === 0) return '';
    
    return this.data.customSections.map(section => `
<div style="margin-bottom: 0.2in;">
  <div style="font-size: 11pt; font-weight: bold; margin-bottom: 0.05in;">
    ${escapeHtml(section.title || 'SECTION')}
  </div>
  <div style="font-size: 10pt;">
    ${escapeHtml(section.content || '').replace(/\n/g, '<br>')}
  </div>
</div>
    `).join('');
  }
}

// ============================================
// DATA NORMALIZATION (SINGLE SOURCE OF TRUTH)
// ============================================

/**
 * Collect form data into normalized state
 */
function normalizeFormData() {
  const data = {
    fullName: document.getElementById('fullName')?.value?.trim() || '',
    email: document.getElementById('email')?.value?.trim() || '',
    phone: document.getElementById('phone')?.value?.trim() || '',
    address: document.getElementById('address')?.value?.trim() || '',
    url: document.getElementById('url')?.value?.trim() || '',
    objective: document.getElementById('objective')?.value?.trim() || '',
    
    education: [],
    experience: [],
    skills: {
      programming: document.getElementById('programmingLanguages')?.value?.trim() || '',
      soft: document.getElementById('toolsFrameworks')?.value?.trim() || '',
      other: document.getElementById('otherSkills')?.value?.trim() || ''
    },
    projects: [],
    certifications: [],
    additional: {
      languages: Array.from(document.querySelectorAll('input[name="language[]"]')).map(el => el.value?.trim()).filter(v => v),
      achievements: Array.from(document.querySelectorAll('textarea[name="achievement[]"]')).map(el => el.value?.trim()).filter(v => v),
      hobbies: Array.from(document.querySelectorAll('textarea[name="hobby[]"]')).map(el => el.value?.trim()).filter(v => v)
    },
    customSections: []
  };

  // Education entries
  const degrees = Array.from(document.querySelectorAll('input[name="degree[]"]')).map(el => el.value?.trim()).filter(v => v);
  const institutions = Array.from(document.querySelectorAll('input[name="institution[]"]')).map(el => el.value?.trim()).filter(v => v);
  const durations = Array.from(document.querySelectorAll('input[name="duration[]"]')).map(el => el.value?.trim()).filter(v => v);
  const cgpas = Array.from(document.querySelectorAll('input[name="cgpa[]"]')).map(el => el.value?.trim()).filter(v => v);

  for (let i = 0; i < Math.max(degrees.length, institutions.length, durations.length); i++) {
    data.education.push({
      degree: degrees[i] || '',
      institution: institutions[i] || '',
      duration: durations[i] || '',
      cgpa: cgpas[i] || ''
    });
  }

  // Experience entries
  const jobTitles = Array.from(document.querySelectorAll('input[name="jobTitle[]"]')).map(el => el.value?.trim()).filter(v => v);
  const companies = Array.from(document.querySelectorAll('input[name="company[]"]')).map(el => el.value?.trim()).filter(v => v);
  const expDurations = Array.from(document.querySelectorAll('input[name="expDuration[]"]')).map(el => el.value?.trim()).filter(v => v);
  const responsibilities = Array.from(document.querySelectorAll('textarea[name="responsibilities[]"]')).map(el => el.value?.trim()).filter(v => v);

  for (let i = 0; i < Math.max(jobTitles.length, companies.length, expDurations.length); i++) {
    data.experience.push({
      jobTitle: jobTitles[i] || '',
      company: companies[i] || '',
      duration: expDurations[i] || '',
      responsibilities: responsibilities[i] || ''
    });
  }

  // Projects
  const projectNames = Array.from(document.querySelectorAll('input[name="projectName[]"]')).map(el => el.value?.trim()).filter(v => v);
  const techUsed = Array.from(document.querySelectorAll('input[name="techUsed[]"]')).map(el => el.value?.trim()).filter(v => v);
  const projectDesc = Array.from(document.querySelectorAll('textarea[name="projectDesc[]"]')).map(el => el.value?.trim()).filter(v => v);
  const projectLinks = Array.from(document.querySelectorAll('input[name="projectLinks[]"]')).map(el => el.value?.trim()).filter(v => v);

  for (let i = 0; i < Math.max(projectNames.length, techUsed.length); i++) {
    data.projects.push({
      name: projectNames[i] || '',
      tech: techUsed[i] || '',
      description: projectDesc[i] || '',
      link: projectLinks[i] || ''
    });
  }

  // Certifications
  const certNames = Array.from(document.querySelectorAll('input[name="certName[]"]')).map(el => el.value?.trim()).filter(v => v);
  const certAuthorities = Array.from(document.querySelectorAll('input[name="certAuthority[]"]')).map(el => el.value?.trim()).filter(v => v);
  const certYears = Array.from(document.querySelectorAll('input[name="certYear[]"]')).map(el => el.value?.trim()).filter(v => v);

  for (let i = 0; i < Math.max(certNames.length, certAuthorities.length, certYears.length); i++) {
    data.certifications.push({
      name: certNames[i] || '',
      authority: certAuthorities[i] || '',
      year: certYears[i] || ''
    });
  }

  // Custom sections
  const customTitles = Array.from(document.querySelectorAll('input[name="customSectionTitle[]"]')).map(el => el.value?.trim()).filter(v => v);
  const customContents = Array.from(document.querySelectorAll('textarea[name="customSectionContent[]"]')).map(el => el.value?.trim()).filter(v => v);

  for (let i = 0; i < Math.max(customTitles.length, customContents.length); i++) {
    data.customSections.push({
      title: customTitles[i] || '',
      content: customContents[i] || ''
    });
  }

  return data;
}

/**
 * Validate required fields
 */
function validateResumeData(data) {
  const errors = [];
  
  if (!data.fullName || data.fullName.length < CONFIG.MIN_NAME_LENGTH) {
    errors.push('Full name is required');
  }
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
}

// ============================================
// GOOGLE SHEETS SUBMISSION
// ============================================

/**
 * Submit resume data to Google Sheets via Apps Script
 */
async function submitToGoogleSheets(data) {
  try {
    // Map formState to Apps Script parameter names
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      url: data.url || '',
      address: data.address,
      objective: data.objective,
      
      // Arrays (Apps Script joins with commas)
      degree: data.education.map(e => e.degree).join(', '),
      institution: data.education.map(e => e.institution).join(', '),
      duration: data.education.map(e => e.duration).join(', '),
      cgpa: data.education.map(e => e.cgpa).join(', '),
      
      jobTitle: data.experience.map(e => e.jobTitle).join(', '),
      company: data.experience.map(e => e.company).join(', '),
      expDuration: data.experience.map(e => e.duration).join(', '),
      responsibilities: data.experience.map(e => e.responsibilities).join(', '),
      
      projectName: data.projects.map(p => p.name).join(', '),
      techUsed: data.projects.map(p => p.tech).join(', '),
      projectLinks: data.projects.map(p => p.link).join(', '),
      
      programmingLanguages: data.skills.programming,
      toolsFrameworks: data.skills.soft,
      otherSkills: data.skills.other,
      
      certName: data.certifications.map(c => c.name).join(', '),
      certAuthority: data.certifications.map(c => c.authority).join(', '),
      
      achievement: data.additional.achievements.join(', '),
      hobby: data.additional.hobbies.join(', '),
      language: data.additional.languages.join(', '),
      
      customSectionTitle: data.customSections.map(s => s.title).join(', '),
      customSectionContent: data.customSections.map(s => s.content).join(', ')
    };

    // Submit to Google Apps Script
    const response = await fetch(CONFIG.SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload)
    });

    showNotification('Resume submitted successfully! Check your email for confirmation.', 'success');
    
    // Reset form after successful submission
    document.getElementById('resumeForm')?.reset();
    formState.load(); // Reload from localStorage if there was saved state
    
    return true;
  } catch (error) {
    console.error('Google Sheets submission error:', error);
    showNotification('Error submitting resume. Please try again.', 'error');
    return false;
  }
}

/**
 * Update live preview using ResumeRenderer (SINGLE SOURCE OF TRUTH)
 */
function updatePreview() {
  try {
    const data = normalizeFormData();
    const renderer = new ResumeRenderer(data);
    const previewContainer = document.getElementById('resumeContent');
    
    if (previewContainer) {
      previewContainer.innerHTML = renderer.render();
    }
  } catch (error) {
    console.error('Preview update error:', error);
  }
}

/**
 * Export resume as HTML file
 */
function exportAsHTML() {
  try {
    const data = normalizeFormData();
    validateResumeData(data);
    
    const renderer = new ResumeRenderer(data);
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.fullName)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${CONFIG.FONT_FAMILY};
      line-height: ${CONFIG.LINE_HEIGHT};
      color: ${CONFIG.COLOR_TEXT};
      background-color: ${CONFIG.COLOR_BG};
      padding: 0.5in;
    }
    a { color: #0066cc; text-decoration: underline; }
    h1, h2 { margin-top: 0.2in; margin-bottom: 0.05in; }
    h1 { font-size: 16pt; }
    h2 { font-size: 11pt; }
    p { margin-bottom: 0.05in; font-size: 10pt; }
    ul { margin-left: 0.2in; margin-bottom: 0.1in; }
    li { margin-bottom: 0.03in; font-size: 10pt; }
  </style>
</head>
<body>
${renderer.render()}
</body>
</html>
`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.fullName.replace(/\s+/g, '_')}_resume.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Resume exported as HTML', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

/**
 * Export resume as PDF using browser print functionality
 * The preview and PDF use the SAME ResumeRenderer, so they are identical
 */
function exportAsPDF() {
  try {
    const data = normalizeFormData();
    validateResumeData(data);
    
    const renderer = new ResumeRenderer(data);
    const printWindow = window.open('', '', 'width=900,height=1200');
    
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.fullName)} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${CONFIG.FONT_FAMILY};
      line-height: ${CONFIG.LINE_HEIGHT};
      color: ${CONFIG.COLOR_TEXT};
      background-color: ${CONFIG.COLOR_BG};
      padding: 0.5in;
      font-size: 10pt;
    }
    a { color: #0066cc; text-decoration: underline; }
    h1, h2 { margin-top: 0.2in; margin-bottom: 0.05in; }
    h1 { font-size: 16pt; font-weight: bold; }
    h2 { font-size: 11pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 0.05in; }
    p { margin-bottom: 0.05in; }
    ul { margin-left: 0.2in; margin-bottom: 0.1in; }
    li { margin-bottom: 0.03in; }
    @media print {
      body { margin: 0; padding: 0.5in; }
    }
  </style>
</head>
<body>
${renderer.render()}
</body>
</html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    showNotification('Opening print dialog. Select "Save as PDF" to export.', 'info');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// ============================================
// FORM HANDLERS & INITIALIZATION
// ============================================

/**
 * Add new education block
 */
function addEducation() {
  const container = document.getElementById('educationBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-row">
        <div class="form-group">
          <label>Degree</label>
          <input type="text" name="degree[]" placeholder="B.Tech in Information Technology">
        </div>
        <div class="form-group">
          <label>Institution</label>
          <input type="text" name="institution[]" placeholder="Delhi University">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration</label>
          <input type="text" name="duration[]" placeholder="2021-2025">
        </div>
        <div class="form-group">
          <label>CGPA / Percentage</label>
          <input type="text" name="cgpa[]" placeholder="8.5 / 10">
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new experience block
 */
function addExperience() {
  const container = document.getElementById('experienceBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-row">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" name="jobTitle[]" placeholder="Software Developer Intern">
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" name="company[]" placeholder="Tech Company Name">
        </div>
      </div>
      <div class="form-group">
        <label>Duration</label>
        <input type="text" name="expDuration[]" placeholder="Jan 2024 – Mar 2024">
      </div>
      <div class="form-group">
        <label>Responsibilities</label>
        <textarea name="responsibilities[]" rows="2" placeholder="Built responsive UI, Fixed bugs, Collaborated with team"></textarea>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new project block
 */
function addProject() {
  const container = document.getElementById('projectBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-row">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" name="projectName[]" placeholder="E-Commerce Platform">
        </div>
        <div class="form-group">
          <label>Tech Stack</label>
          <input type="text" name="techUsed[]" placeholder="React, Node.js, MongoDB">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="projectDesc[]" rows="2" placeholder="Full-stack app, Payment gateway, Deployed on AWS"></textarea>
      </div>
      <div class="form-group">
        <label>GitHub / Live Link</label>
        <input type="url" name="projectLinks[]" placeholder="https://github.com/username/project">
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new certification block
 */
function addCertification() {
  const container = document.getElementById('certBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-row">
        <div class="form-group">
          <label>Certification Name</label>
          <input type="text" name="certName[]" placeholder="AWS Certified Solutions Architect">
        </div>
        <div class="form-group">
          <label>Issuing Authority</label>
          <input type="text" name="certAuthority[]" placeholder="Amazon Web Services">
        </div>
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" name="certYear[]" placeholder="2024">
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new language
 */
function addLanguage() {
  const container = document.getElementById('languageBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-group">
        <label>Language</label>
        <input type="text" name="language[]" placeholder="English, Hindi, Spanish">
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new achievement
 */
function addAchievement() {
  const container = document.getElementById('achievementBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-group">
        <label>Achievement</label>
        <textarea name="achievement[]" rows="2" placeholder="Awards, recognitions, achievements"></textarea>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Add new hobby
 */
function addHobby() {
  const container = document.getElementById('hobbyBlocks');
  if (!container) return;

  const blockHTML = `
    <div class="block">
      <div class="form-group">
        <label>Hobby</label>
        <textarea name="hobby[]" rows="2" placeholder="Your hobbies and interests"></textarea>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeBlock(this)">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', blockHTML);
  attachPreviewListeners(container.lastElementChild);
  updatePreview();
}

/**
 * Remove a block element
 */
function removeBlock(button) {
  button.parentElement.remove();
  updatePreview();
}

/**
 * Attach preview listeners to newly added elements
 */
function attachPreviewListeners(element) {
  const inputs = element.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });
}
function handleFormSubmit(event) {
  event.preventDefault();
  
  try {
    const data = normalizeFormData();
    validateResumeData(data);
    
    // Show submitting state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Submit to Google Sheets
    submitToGoogleSheets(data).then(success => {
      if (success) {
        submitBtn.textContent = 'Submitted!';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 2000);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

/**
 * Add event listeners to form inputs
 */
function setupFormListeners() {
  const form = document.getElementById('resumeForm');
  if (!form) return;

  // Add listeners to all inputs for live preview
  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);

  // Form submission
  form.addEventListener('submit', handleFormSubmit);

  // Export buttons
  const htmlExportBtn = document.getElementById('exportHTML');
  if (htmlExportBtn) htmlExportBtn.addEventListener('click', exportAsHTML);

  const pdfExportBtn = document.getElementById('exportPDF');
  if (pdfExportBtn) pdfExportBtn.addEventListener('click', exportAsPDF);

  const printBtn = document.getElementById('printResume');
  if (printBtn) printBtn.addEventListener('click', printResume);

  // Add/Remove buttons for array fields
  const addEducationBtn = document.getElementById('addEducationBtn');
  if (addEducationBtn) addEducationBtn.addEventListener('click', addEducation);

  const addExperienceBtn = document.getElementById('addExperienceBtn');
  if (addExperienceBtn) addExperienceBtn.addEventListener('click', addExperience);

  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) addProjectBtn.addEventListener('click', addProject);

  const addCertBtn = document.getElementById('addCertBtn');
  if (addCertBtn) addCertBtn.addEventListener('click', addCertification);

  const addLanguageBtn = document.getElementById('addLanguageBtn');
  if (addLanguageBtn) addLanguageBtn.addEventListener('click', addLanguage);

  const addAchievementBtn = document.getElementById('addAchievementBtn');
  if (addAchievementBtn) addAchievementBtn.addEventListener('click', addAchievement);

  const addHobbyBtn = document.getElementById('addHobbyBtn');
  if (addHobbyBtn) addHobbyBtn.addEventListener('click', addHobby);

  const addCustomSectionBtn = document.getElementById('addCustomSectionBtn');
  if (addCustomSectionBtn) addCustomSectionBtn.addEventListener('click', addCustomSection);

  // Initial preview
  updatePreview();
}

/**
 * Add custom section
 */
function addCustomSection() {
  const container = document.getElementById('customSectionsContainer');
  if (!container) return;

  const sectionCount = container.querySelectorAll('[data-section]').length;
  const sectionHTML = `
    <div data-section="${sectionCount}" class="custom-section">
      <input type="text" name="customSectionTitle[]" placeholder="Section Title (e.g., Publications, Languages)" class="form-control" />
      <textarea name="customSectionContent[]" placeholder="Section content..." class="form-control" rows="3"></textarea>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeCustomSection(${sectionCount})">Remove Section</button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', sectionHTML);

  // Add listeners to new inputs
  const newInputs = container.querySelectorAll(`[data-section="${sectionCount}"] input, [data-section="${sectionCount}"] textarea`);
  newInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });

  updatePreview();
}

/**
 * Remove custom section
 */
function removeCustomSection(index) {
  const section = document.querySelector(`[data-section="${index}"]`);
  if (section) {
    section.remove();
    updatePreview();
  }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
  setupFormListeners();
  
  // Restore saved data from localStorage if exists
  // (optional - can implement formState.load() if data was previously saved)
});
