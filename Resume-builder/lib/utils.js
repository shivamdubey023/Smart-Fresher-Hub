/**
 * Utility Functions for Resume Builder
 * Reusable, production-ready utilities
 */

// ============================================
// 1. STRING & TEXT UTILITIES
// ============================================

class StringUtils {
  /**
   * Capitalize first letter
   */
  static capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Title case
   */
  static titleCase(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Slug for URLs/filenames
   */
  static slug(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Truncate with ellipsis
   */
  static truncate(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length - 3) + '...';
  }

  /**
   * Word count
   */
  static wordCount(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Calculate reading time (roughly 200 words per minute)
   */
  static readingTime(text) {
    const minutes = Math.ceil(this.wordCount(text) / 200);
    return `${minutes} min read`;
  }
}

// ============================================
// 2. DATE & TIME UTILITIES
// ============================================

class DateUtils {
  /**
   * Format date for resume
   */
  static formatResumeDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  }

  /**
   * Month year format (Jan 2024)
   */
  static formatMonthYear(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  }

  /**
   * Calculate duration between two dates
   */
  static calculateDuration(startDate, endDate = new Date()) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      
      if (diffMonths < 12) {
        return `${diffMonths} months`;
      }
      
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      
      if (months === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      }
      
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    } catch {
      return '';
    }
  }

  /**
   * Check if date is in future
   */
  static isFuture(dateString) {
    try {
      return new Date(dateString) > new Date();
    } catch {
      return false;
    }
  }
}

// ============================================
// 3. VALIDATION UTILITIES
// ============================================

class ValidationUtils {
  /**
   * Email validation
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Phone validation
   */
  static isValidPhone(phone) {
    const regex = /^\+?[\d\s\-()]{10,}$/;
    return regex.test(phone);
  }

  /**
   * URL validation
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * LinkedIn URL validation
   */
  static isValidLinkedIn(url) {
    return /linkedin\.com\/in\/[a-z0-9\-]+/i.test(url);
  }

  /**
   * GitHub URL validation
   */
  static isValidGitHub(url) {
    return /github\.com\/[a-z0-9\-]+/i.test(url);
  }

  /**
   * Portfolio URL validation
   */
  static isValidPortfolio(url) {
    return this.isValidUrl(url) && !url.includes('linkedin') && !url.includes('github');
  }

  /**
   * Password strength (0-100)
   */
  static passwordStrength(password) {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Check if string is strong password
   */
  static isStrongPassword(password) {
    return this.passwordStrength(password) >= 60;
  }
}

// ============================================
// 4. ARRAY & OBJECT UTILITIES
// ============================================

class ArrayUtils {
  /**
   * Remove duplicates
   */
  static unique(array) {
    return [...new Set(array)];
  }

  /**
   * Remove empty strings
   */
  static compact(array) {
    return array.filter(item => item && item.toString().trim() !== '');
  }

  /**
   * Flatten nested array
   */
  static flatten(array) {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  /**
   * Group by property
   */
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Sum numeric property
   */
  static sum(array, key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0);
  }

  /**
   * Average numeric property
   */
  static average(array, key) {
    if (array.length === 0) return 0;
    return this.sum(array, key) / array.length;
  }

  /**
   * Sort by property
   */
  static sortBy(array, key, ascending = true) {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return ascending ? -1 : 1;
      if (a[key] > b[key]) return ascending ? 1 : -1;
      return 0;
    });
  }
}

class ObjectUtils {
  /**
   * Deep clone
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   */
  static merge(target, source) {
    return { ...target, ...source };
  }

  /**
   * Pick specific keys
   */
  static pick(obj, keys) {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }

  /**
   * Omit specific keys
   */
  static omit(obj, keys) {
    return Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Get nested value
   */
  static getDeep(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// ============================================
// 5. STORAGE UTILITIES
// ============================================

class StorageUtils {
  /**
   * Save to localStorage with expiry
   */
  static setWithExpiry(key, value, expiryMinutes = 60) {
    const item = {
      value: value,
      expiry: Date.now() + expiryMinutes * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Get from localStorage with expiry check
   */
  static getWithExpiry(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  }

  /**
   * Save draft locally
   */
  static saveDraft(key, formData) {
    this.setWithExpiry(`draft_${key}`, formData, 1440); // 24 hours
  }

  /**
   * Load draft
   */
  static loadDraft(key) {
    return this.getWithExpiry(`draft_${key}`);
  }

  /**
   * Clear draft
   */
  static clearDraft(key) {
    localStorage.removeItem(`draft_${key}`);
  }
}

// ============================================
// 6. API & HTTP UTILITIES
// ============================================

class APIUtils {
  /**
   * Retry fetch with exponential backoff
   */
  static async fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Parse JSON response
   */
  static async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  /**
   * Create query string from object
   */
  static queryString(params) {
    return new URLSearchParams(params).toString();
  }

  /**
   * Append query params to URL
   */
  static appendQueryParams(url, params) {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });
    return urlObj.toString();
  }
}

// ============================================
// 7. FILE UTILITIES
// ============================================

class FileUtils {
  /**
   * Download file from blob
   */
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export as JSON file
   */
  static exportJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  /**
   * Export as CSV file
   */
  static exportCSV(data, filename) {
    let csv = '';
    
    // Headers
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';
    
    // Rows
    data.forEach(row => {
      csv += headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// ============================================
// 8. PERFORMANCE UTILITIES
// ============================================

class PerformanceUtils {
  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure function execution time
   */
  static measureTime(func, label = 'Function') {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  /**
   * Lazy load image
   */
  static lazyLoadImage(element) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      observer.observe(element);
    } else {
      element.src = element.dataset.src;
    }
  }
}

// ============================================
// 9. LOGGING & DEBUGGING
// ============================================

class Logger {
  static log(message, data = null) {
    console.log(`[LOG] ${message}`, data);
  }

  static error(message, error = null) {
    console.error(`[ERROR] ${message}`, error);
  }

  static warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data);
  }

  static info(message, data = null) {
    console.info(`[INFO] ${message}`, data);
  }

  static group(label) {
    console.group(label);
  }

  static groupEnd() {
    console.groupEnd();
  }

  static table(data) {
    console.table(data);
  }
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StringUtils,
    DateUtils,
    ValidationUtils,
    ArrayUtils,
    ObjectUtils,
    StorageUtils,
    APIUtils,
    FileUtils,
    PerformanceUtils,
    Logger
  };
}
