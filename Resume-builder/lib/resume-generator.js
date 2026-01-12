/**
 * ATS-Friendly Resume Generator
 * Produces single-column, keyword-optimized resumes
 * 
 * Features:
 * - ATS-compliant HTML (no images, tables, complex styling)
 * - Keyword highlighting
 * - Consistent formatting
 * - Multiple export options (HTML, PDF, DOCX, JSON)
 * - SEO-friendly structure
 */

class ResumeGenerator {
  /**
   * Generate ATS-compliant resume HTML
   */
  static generateATS(data, atsScore) {
    const html = this.buildResumeHTML(data, atsScore);
    this.renderPreview(html);
    this.attachExportHandlers(data, html);
  }

  /**
   * Build the resume HTML structure
   */
  static buildResumeHTML(data, atsScore) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(data.fullName)} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 0.5in;
    }

    /* ATS-Safe Single Column */
    .container {
      max-width: 7.5in;
      margin: 0 auto;
    }

    /* Header Section */
    .header {
      text-align: center;
      margin-bottom: 12px;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }

    .name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .contact-info {
      font-size: 11px;
      margin-bottom: 4px;
    }

    .contact-info span {
      margin: 0 8px;
    }

    .ats-score {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 10px;
      margin-top: 4px;
      display: inline-block;
    }

    /* Section Styling */
    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #0077b6;
      margin-bottom: 6px;
      border-bottom: 1px solid #0077b6;
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Entry Styling */
    .entry {
      margin-bottom: 8px;
      page-break-inside: avoid;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .entry-title {
      font-weight: bold;
      font-size: 12px;
    }

    .entry-date {
      font-size: 11px;
      color: #333;
    }

    .entry-subtitle {
      font-size: 11px;
      color: #555;
      font-style: italic;
      margin-bottom: 2px;
    }

    .entry-description {
      font-size: 11px;
      line-height: 1.3;
      margin-left: 12px;
    }

    .entry-description ul {
      list-style: none;
      margin: 2px 0 0 0;
      padding-left: 16px;
    }

    .entry-description li {
      margin-bottom: 2px;
      position: relative;
      padding-left: 12px;
    }

    .entry-description li:before {
      content: "▪";
      position: absolute;
      left: 0;
      color: #0077b6;
    }

    /* Skills Section */
    .skills-group {
      margin-bottom: 6px;
    }

    .skill-category {
      font-weight: bold;
      font-size: 11px;
      display: inline-block;
      width: 80px;
    }

    .skill-items {
      display: inline-block;
      font-size: 11px;
      flex-wrap: wrap;
    }

    /* Keywords (for ATS optimization) */
    .keyword {
      font-weight: 600;
    }

    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0.5in;
        background: white;
        width: auto;
        height: auto;
      }

      .page-break {
        page-break-after: always;
      }

      .no-print {
        display: none !important;
      }
    }

    /* Responsive (for screen viewing) */
    @media screen and (max-width: 900px) {
      body {
        width: 100%;
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${this.buildHeader(data, atsScore)}
    ${this.buildSummary(data)}
    ${this.buildExperience(data)}
    ${this.buildEducation(data)}
    ${this.buildProjects(data)}
    ${this.buildSkills(data)}
    ${this.buildCertifications(data)}
    ${this.buildLanguages(data)}
    ${this.buildCustomSections(data)}
  </div>
</body>
</html>
    `.trim();
  }

  static buildHeader(data, atsScore) {
    const contact = [
      data.email,
      data.phone && `(${data.phone})`,
      data.address && data.address.split(',')[0], // City only
      data.portfolio && this.makeATS_SafeLink(data.portfolio)
    ].filter(Boolean).join(' | ');

    return `
      <div class="header">
        <div class="name">${this.escapeHtml(data.fullName)}</div>
        <div class="contact-info">${contact}</div>
        <div class="ats-score">ATS Score: ${atsScore}/100</div>
      </div>
    `;
  }

  static buildSummary(data) {
    if (!data.objective || !data.objective.trim()) return '';

    return `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div>${this.escapeHtml(data.objective)}</div>
      </div>
    `;
  }

  static buildExperience(data) {
    if (!data.jobTitles || data.jobTitles.length === 0) return '';

    let html = '<div class="section"><div class="section-title">Professional Experience</div>';

    for (let i = 0; i < data.jobTitles.length; i++) {
      if (!data.jobTitles[i]) continue;

      html += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${this.escapeHtml(data.jobTitles[i])}</span>
            <span class="entry-date">${this.escapeHtml(data.expDurations[i] || '')}</span>
          </div>
          <div class="entry-subtitle">${this.escapeHtml(data.companies[i] || '')}</div>
          <div class="entry-description">
            ${this.buildBulletList(data.responsibilities[i] || '')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  static buildEducation(data) {
    if (!data.degrees || data.degrees.length === 0) return '';

    let html = '<div class="section"><div class="section-title">Education</div>';

    for (let i = 0; i < data.degrees.length; i++) {
      if (!data.degrees[i]) continue;

      const cgpa = data.cgpas[i] ? ` | GPA: ${data.cgpas[i]}` : '';

      html += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${this.escapeHtml(data.degrees[i])}</span>
            <span class="entry-date">${this.escapeHtml(data.durations[i] || '')}</span>
          </div>
          <div class="entry-subtitle">${this.escapeHtml(data.institutions[i] || '')}${cgpa}</div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  static buildProjects(data) {
    if (!data.projectNames || data.projectNames.length === 0) return '';

    let html = '<div class="section"><div class="section-title">Projects</div>';

    for (let i = 0; i < data.projectNames.length; i++) {
      if (!data.projectNames[i]) continue;

      let projectTitle = this.escapeHtml(data.projectNames[i]);
      const link = data.projectLinks[i];
      if (link) {
        projectTitle = `<a href="${this.escapeHtml(link)}">${projectTitle}</a>`;
      }

      html += `
        <div class="entry">
          <div class="entry-title">${projectTitle}</div>
          ${data.techUsed[i] ? `<div class="entry-subtitle">Tech: ${this.escapeHtml(data.techUsed[i])}</div>` : ''}
          <div class="entry-description">
            ${this.buildBulletList(data.projectDesc[i] || '')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  static buildSkills(data) {
    const techSkills = data.techSkills || [];
    const softSkills = data.softSkills || [];

    if (techSkills.length === 0 && softSkills.length === 0) return '';

    let html = '<div class="section"><div class="section-title">Skills</div>';

    if (techSkills.length > 0) {
      html += `
        <div class="skills-group">
          <span class="skill-category">Technical:</span>
          <span class="skill-items">${this.escapeHtml(techSkills.join(', '))}</span>
        </div>
      `;
    }

    if (softSkills.length > 0) {
      html += `
        <div class="skills-group">
          <span class="skill-category">Tools:</span>
          <span class="skill-items">${this.escapeHtml(softSkills.join(', '))}</span>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  static buildCertifications(data) {
    if (!data.certNames || data.certNames.length === 0) return '';

    let html = '<div class="section"><div class="section-title">Certifications</div>';

    for (let i = 0; i < data.certNames.length; i++) {
      if (!data.certNames[i]) continue;

      html += `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${this.escapeHtml(data.certNames[i])}</span>
            <span class="entry-date">${this.escapeHtml(data.certYears[i] || '')}</span>
          </div>
          ${data.certAuthorities[i] ? `<div class="entry-subtitle">${this.escapeHtml(data.certAuthorities[i])}</div>` : ''}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  static buildLanguages(data) {
    if (!data.languages || data.languages.length === 0) return '';

    return `
      <div class="section">
        <div class="section-title">Languages</div>
        <div>${this.escapeHtml(data.languages.join(', '))}</div>
      </div>
    `;
  }

  static buildCustomSections(data) {
    if (!data.customSectionTitles || data.customSectionTitles.length === 0) return '';

    let html = '';

    for (let i = 0; i < data.customSectionTitles.length; i++) {
      if (!data.customSectionTitles[i]) continue;

      const icon = data.customSectionIcons[i] ? `${data.customSectionIcons[i]} ` : '';
      const content = data.customSectionContents[i] || '';

      html += `
        <div class="section">
          <div class="section-title">${icon}${this.escapeHtml(data.customSectionTitles[i])}</div>
          <div class="entry-description">
            ${this.buildBulletList(content)}
          </div>
        </div>
      `;
    }

    return html;
  }

  static buildBulletList(text) {
    if (!text || !text.trim()) return '';

    const items = text.split(',').map(item => item.trim()).filter(item => item);
    
    if (items.length === 0) return this.escapeHtml(text);

    const listItems = items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }

  static makeATS_SafeLink(url) {
    if (!url) return '';
    const cleanUrl = this.escapeHtml(url);
    return `<a href="${cleanUrl}">${cleanUrl}</a>`;
  }

  static escapeHtml(text) {
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

  static renderPreview(html) {
    const previewContainer = document.getElementById('resumeContent');
    if (!previewContainer) return;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 6px;
    `;
    iframe.setAttribute('sandbox', 'allow-same-origin');
    
    previewContainer.innerHTML = '';
    previewContainer.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }

  /**
   * Export resume as PDF
   */
  static exportPDF(data, html, filename) {
    // Option 1: Using html2pdf library (recommended)
    if (typeof html2pdf !== 'undefined') {
      const element = document.createElement('div');
      element.innerHTML = html;

      const options = {
        margin: 0.5,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(options).from(element).save();
      return true;
    }

    // Option 2: Using browser print dialog
    console.warn('html2pdf not available, using print dialog');
    const printWindow = window.open('', '', 'height=800,width=900');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);

    return true;
  }

  /**
   * Export resume as DOCX
   */
  static exportDOCX(data, filename) {
    // This requires docx library or backend API
    console.log('DOCX export - implement with docx library or backend');
    // See PRODUCTION_GUIDE.md for full implementation
    return false;
  }

  /**
   * Export resume as JSON
   */
  static exportJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  static attachExportHandlers(data, html) {
    const filename = `resume_${data.fullName.toLowerCase().replace(/\s+/g, '_')}`;

    // PDF export
    const pdfBtn = document.getElementById('downloadPDFBtn');
    if (pdfBtn) {
      pdfBtn.onclick = () => {
        try {
          this.exportPDF(data, html, filename);
        } catch (error) {
          console.error('PDF export error:', error);
          alert('Failed to export PDF');
        }
      };
    }

    // JSON export
    const jsonBtn = document.getElementById('downloadJSONBtn');
    if (jsonBtn) {
      jsonBtn.onclick = () => {
        try {
          this.exportJSON(data, filename);
        } catch (error) {
          console.error('JSON export error:', error);
          alert('Failed to export JSON');
        }
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResumeGenerator;
}
