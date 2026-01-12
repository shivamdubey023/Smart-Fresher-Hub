# ATS Resume Builder - Complete Implementation

## Architecture

This resume builder implements a **single-source-of-truth** architecture where the `ResumeRenderer` component generates all resume outputs (preview, PDF, print, export).

## Key Components

### 1. **ResumeRenderer Class** (Lines 67-290 in script.js)
The core component that renders ATS-optimized resume HTML from normalized data.

**Methods:**
- `render()` - Returns complete resume HTML (main entry point)
- `renderHeader()` - Name + contact info with clickable Portfolio link
- `renderSummary()` - Professional objective
- `renderEducation()` - Education entries (Degree | Institution | Duration | CGPA format)
- `renderExperience()` - Job title, company, duration, bullet-point responsibilities
- `renderSkills()` - Technical, Soft, and Other skills (separated)
- `renderProjects()` - Project name, tech stack, description, clickable links
- `renderCertifications()` - Certification name, authority, year
- `renderAdditional()` - Languages, achievements, hobbies
- `renderCustomSections()` - Dynamic custom sections (Publications, Awards, etc.)

### 2. **Data Collection** (Lines 304-376)
`normalizeFormData()` collects form inputs and normalizes them into structured data:
```javascript
{
  fullName, email, phone, address, url, objective,
  education: [{ degree, institution, duration, cgpa }],
  experience: [{ jobTitle, company, duration, responsibilities }],
  skills: { programming, soft, other },
  projects: [{ name, tech, description, link }],
  certifications: [{ name, authority, year }],
  additional: { languages: [], achievements: [], hobbies: [] },
  customSections: [{ title, content }]
}
```

### 3. **Google Sheets Integration** (Lines 401-458)
`submitToGoogleSheets()` POSTs data to Apps Script endpoint:
- Endpoint: https://script.google.com/macros/s/AKfycbyQp0XmC9uQdebn8cMe0LccuFMyvGAytOlFclP6X3-TNev5UGrf2YJ-5lGEBOaVGXE2cQ/exec
- Maps formState fields to Apps Script parameter names
- Supports array fields with comma-separated values
- No SMTP/email (Google Sheets only)

### 4. **Preview, PDF, Print, Export** (Lines 461-620)
All functions use the **same ResumeRenderer** ensuring consistency:

- `updatePreview()` - Live preview (triggered on every input change)
- `exportAsHTML()` - Download HTML file
- `exportAsPDF()` - Print dialog (user selects "Save as PDF")
- `printResume()` - Print preview

**Key:** Preview === PDF === Print === Export (all use same ResumeRenderer)

### 5. **Form Event Handling** (Lines 623-908)

#### Dynamic Field Management
- `addEducation()`, `addExperience()`, `addProject()`, `addCertification()`
- `addLanguage()`, `addAchievement()`, `addHobby()`, `addCustomSection()`
- `removeBlock()` - Removes any block element
- `attachPreviewListeners()` - Attaches input listeners to newly added elements

#### Form Submission
- `handleFormSubmit()` - Validates and submits to Google Sheets
- `setupFormListeners()` - Initializes all event handlers
- Live preview updates on every input change

## Design Decisions

### 1. Single Source of Truth
The ResumeRenderer class is the ONLY place where resume HTML is generated. This ensures:
- Preview === PDF === Print === Export (byte-for-byte identical)
- No inconsistencies between different export formats
- Easy to maintain and update rendering logic

### 2. ATS-Safe Formatting
Resume output includes:
- Single column layout (no tables)
- Standard fonts (Arial)
- Black text on white background
- No decorative elements, icons, or images
- Clickable links for URLs (ATS-safe `<a href>` tags)
- Proper spacing (0.5in margins, 1.5 line height)

### 3. Google Sheets Integration Only
- No SMTP/email credentials stored
- No third-party email services
- POST to Apps Script endpoint
- Field names match Apps Script doPost handler exactly

### 4. Custom Sections
Users can add unlimited custom sections (Publications, Awards, Languages, etc.):
- Dynamic add/remove functionality
- Custom sections included in preview, PDF, and Google Sheets
- Render method handles sections generically

## Files Modified

### Resume-builder.html
- Updated form field IDs to match JavaScript
- Changed `id="portfolio"` to `id="url"` for consistency
- Reorganized Languages, Achievements, Hobbies into proper array structures
- Added Custom Sections container
- Updated button IDs and functions (exportHTML, exportPDF, printResume)

### script.js
**Lines 1-25:** Configuration (Google Sheets URL, fonts, colors)
**Lines 27-45:** State management (formState object with save/load)
**Lines 47-65:** Utility functions (escapeHtml, showNotification)
**Lines 67-290:** ResumeRenderer class (single source of truth)
**Lines 304-376:** Data normalization (normalizeFormData, validateResumeData)
**Lines 401-458:** Google Sheets integration (submitToGoogleSheets)
**Lines 461-620:** Preview/PDF/Print/Export (updatePreview, exportAsHTML, exportAsPDF, printResume)
**Lines 623-908:** Form handlers (add/remove dynamic fields, event listeners, initialization)

## Testing Checklist

- [ ] Fill out form and see live preview update
- [ ] Add education entries and verify they appear in preview
- [ ] Add experience with responsibilities (should show as bullets)
- [ ] Test Portfolio link (should be clickable in preview)
- [ ] Export as HTML (download file)
- [ ] Export as PDF (print dialog opens)
- [ ] Print preview (verify looks identical to PDF)
- [ ] Submit resume (check Google Sheets for entry)
- [ ] Add custom section and verify in preview
- [ ] Verify education format: "Degree | Institution | Duration | CGPA: X.XX"
- [ ] Verify no images/tables/icons in output (ATS-safe)
- [ ] Test form validation (name and email required)

## API Endpoint Details

**POST to:** `https://script.google.com/macros/s/AKfycbyQp0XmC9uQdebn8cMe0LccuFMyvGAytOlFclP6X3-TNev5UGrf2YJ-5lGEBOaVGXE2cQ/exec`

**Expected Parameters (from Apps Script doPost handler):**
- Scalar: fullName, email, phone, url, address, objective
- Scalar (skills): programmingLanguages, toolsFrameworks, otherSkills
- Arrays (comma-separated in formData): degree[], institution[], duration[], cgpa[], jobTitle[], company[], expDuration[], responsibilities[], projectName[], techUsed[], projectLinks[], certName[], certAuthority[], achievement[], hobby[], language[], customSectionTitle[], customSectionContent[]

**Response:** "Success" on successful submission

## Future Enhancements

1. Add localStorage persistence (save form state locally)
2. Add form validation error messages
3. Add resume templates (different formats)
4. Add skill proficiency levels
5. Add work visa sponsorship field
6. Add multi-language support
7. Add resume scoring (ATS compatibility check)
8. Add duplicate detection (prevent spam)

## Notes

- All HTML is escaped to prevent XSS attacks
- Form fields automatically update preview (no manual refresh needed)
- Custom sections support unlimited fields
- No external dependencies (pure vanilla JavaScript)
- Works in all modern browsers
