# Resume Builder - API Reference Guide

## Public Functions

### Data Processing

#### `normalizeResumeData()`
Collects and validates all form data.

```javascript
const resumeData = normalizeResumeData();
// Throws: Error if validation fails
// Returns: {
//   fullName, email, address, phones: [], urls: [],
//   objective, degrees: [], institutions: [], durations: [], cgpas: [],
//   jobTitles: [], companies: [], expDurations: [], responsibilities: [],
//   projectNames: [], techUsed: [], projectDesc: [], projectLinks: [],
//   programmingLanguages, toolsFrameworks, otherSkills,
//   certNames: [], certAuthorities: [], certYears: [],
//   achievements: [], hobbies: [], languages: [], proficiencies: []
// }
```

### Resume Generation

#### `generateATSResume(data)`
Generates ATS-safe resume HTML.

```javascript
const html = generateATSResume(resumeData);
// Returns: HTML string (ATS-optimized)
document.getElementById('resumeContent').innerHTML = html;
```

**Features:**
- Single column layout
- No visual elements
- Standard fonts
- Machine-readable structure

---

#### `generateEmailBody(data)`
Creates professional email body.

```javascript
const emailBody = generateEmailBody(resumeData);
// Returns: HTML email content
```

---

### Export Functions

#### `exportAsHTML(data)`
Downloads resume as HTML file.

```javascript
exportAsHTML(resumeData);
// Downloads: John_Doe_Resume.html
// Notification: "Resume exported as HTML"
```

---

#### `exportAsPDF(data)`
Opens browser print dialog for PDF generation.

```javascript
exportAsPDF(resumeData);
// Opens print window
// User: Saves as PDF or prints
```

---

#### `exportAsText(data)`
Exports resume as plain text file.

```javascript
exportAsText(resumeData);
// Downloads: John_Doe_Resume.txt
// Format: Plain text (for online applications)
```

---

### Data Persistence

#### `saveToGoogleSheet(data)`
Saves data to Google Sheets via fetch.

```javascript
const success = await saveToGoogleSheet(resumeData);
// Returns: true if saved, false if failed
// Saves to: "ResumeBuilder" sheet with timestamp
```

---

#### `sendConfirmationEmail(data, emailBody)`
Sends SMTP email confirmation.

```javascript
await sendConfirmationEmail(resumeData, emailBody);
// Requires: SMTP_EMAIL, SMTP_PASS in ENV
// Returns: Promise
```

---

### Quality Metrics

#### `calculateATSScore(data)`
Calculates ATS compatibility score.

```javascript
const scoreData = calculateATSScore(resumeData);
// Returns: {
//   score: 85,                    // 0-100
//   rating: "Excellent",          // Excellent/Good/Needs Improvement
//   issues: [...]                 // Array of improvement suggestions
// }
```

**Scoring:**
- 80-100: Excellent ✅
- 60-79: Good ⚠️
- 0-59: Needs Improvement ❌

---

#### `displayATSScore(data)`
Renders ATS score in UI.

```javascript
displayATSScore(resumeData);
// Displays score card in #atsScore element
// Shows score, rating, and suggestions
```

---

### Utility Functions

#### `getVals(name)`
Collects multiple input values by name attribute.

```javascript
const phones = getVals("phone[]");
// Returns: ["9876543210", "9876543211", ...]
```

---

#### `showNotification(message, type)`
Shows toast notification to user.

```javascript
showNotification('Resume saved!', 'success');
showNotification('Error occurred', 'error');
showNotification('Loading...', 'info');
```

**Types:**
- `success` - Green background
- `error` - Red background
- `info` - Blue background (default)

---

#### `debugLog(context, data)`
Logs debug information to console.

```javascript
debugLog('Form Submission', 'Data validated');
// Output: [Resume Builder - Form Submission] Data validated
```

---

#### `escapeHtml(text)`
Sanitizes HTML to prevent XSS.

```javascript
const safe = escapeHtml('<img src=x>');
// Returns: "&lt;img src=x&gt;"
// Safe to insert into innerHTML
```

---

## Event Handlers

### Form Submission
```javascript
document.getElementById("resumeForm").addEventListener("submit", async (e) => {
  // 1. Validates data
  // 2. Generates ATS resume
  // 3. Renders preview
  // 4. Displays ATS score
  // 5. Saves to Google Sheet
  // 6. Sends confirmation email
});
```

---

### Download Button
```javascript
document.getElementById("downloadBtn").addEventListener("click", async (e) => {
  // 1. Validates data
  // 2. Saves to Google Sheet
  // 3. Exports as HTML
});
```

---

### Export PDF Button
```javascript
document.getElementById("exportPDFBtn").addEventListener("click", (e) => {
  // Opens browser print dialog
  // User saves as PDF
});
```

---

### Export Text Button
```javascript
document.getElementById("exportTextBtn").addEventListener("click", (e) => {
  // Exports as plain text file
});
```

---

## Configuration

### Environment Variables
```javascript
const ENV_CONFIG = {
  SMTP_EMAIL: ENV.SMTP_EMAIL,          // Gmail address
  SMTP_PASS: ENV.SMTP_PASS,            // App password
  SHEET_SCRIPT_URL: ENV.SHEET_SCRIPT_URL  // Google Apps Script
};
```

### ATS Rules
```javascript
const ATS_CONFIG = {
  MIN_NAME_LENGTH: 2,                   // Minimum name characters
  MIN_EMAIL_LENGTH: 5,                  // Minimum email length
  RESERVED_KEYWORDS: [                  // Keywords that block ATS
    'QR', 'Photo', 'Picture', 'Image', 
    'Logo', 'Icon', 'Chart', 'Graph', 'Table'
  ]
};
```

---

## Data Flow Diagram

```
User Form Input
    ↓
normalizeResumeData()
    ↓
generateATSResume()
    ↓
Render Preview + calculateATSScore()
    ↓
saveToGoogleSheet() + sendConfirmationEmail()
    ↓
Success Notification
```

---

## Error Handling

### Try-Catch Pattern
```javascript
try {
  const data = normalizeResumeData();
  const html = generateATSResume(data);
  // ... process
} catch (error) {
  debugLog('Error', error.message);
  showNotification(error.message, 'error');
}
```

### Common Errors
- "Full name must be at least 2 characters"
- "Valid email address is required"
- "SHEET_SCRIPT_URL not configured"
- "SMTP credentials not configured"

---

## Usage Examples

### Complete Workflow
```javascript
// 1. Normalize data
const resumeData = normalizeResumeData();

// 2. Generate ATS resume
const atsHtml = generateATSResume(resumeData);
document.getElementById('resumeContent').innerHTML = atsHtml;

// 3. Calculate score
const scoreData = calculateATSScore(resumeData);
console.log(`ATS Score: ${scoreData.score}/100`);

// 4. Save to sheet
await saveToGoogleSheet(resumeData);

// 5. Send email
const emailBody = generateEmailBody(resumeData);
await sendConfirmationEmail(resumeData, emailBody);

// 6. Export
exportAsHTML(resumeData);
exportAsPDF(resumeData);
exportAsText(resumeData);
```

---

### Validation Only
```javascript
try {
  const data = normalizeResumeData();
  console.log('Resume is valid:', data);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

### Score Analysis
```javascript
const data = normalizeResumeData();
const score = calculateATSScore(data);

console.log(`Score: ${score.score}/100`);
console.log(`Rating: ${score.rating}`);
console.log('Suggestions:', score.issues);
```

---

## Best Practices

1. **Always validate before processing:**
   ```javascript
   try {
     const data = normalizeResumeData();
   } catch (e) {
     showNotification(e.message, 'error');
     return;
   }
   ```

2. **Use async/await for async operations:**
   ```javascript
   const success = await saveToGoogleSheet(data);
   if (success) showNotification('Saved!', 'success');
   ```

3. **Check for element existence:**
   ```javascript
   const btn = document.getElementById('exportPDFBtn');
   if (btn) btn.addEventListener('click', ...);
   ```

4. **Always escape user input:**
   ```javascript
   const safeText = escapeHtml(userInput);
   element.innerHTML = safeText;
   ```

5. **Log for debugging:**
   ```javascript
   debugLog('Context', { data });  // Will appear in console
   ```

---

## Performance Tips

1. **Minimize DOM manipulation** - Batch updates
2. **Cache frequently accessed elements** - Don't query DOM repeatedly
3. **Use event delegation** - For dynamic elements
4. **Debounce form input** - For real-time updates
5. **Lazy load exports** - Only when needed

---

## Security Considerations

- ✅ XSS Prevention (escapeHtml)
- ✅ Input Validation
- ✅ No eval() or dynamic code
- ✅ Safe data structures
- ✅ HTTPS for all requests

---

## Testing Checklist

- [ ] normalizeResumeData() returns correct structure
- [ ] generateATSResume() creates valid HTML
- [ ] calculateATSScore() returns 0-100
- [ ] saveToGoogleSheet() sends correct payload
- [ ] sendConfirmationEmail() sends email
- [ ] exportAsHTML() downloads file
- [ ] exportAsPDF() opens print dialog
- [ ] exportAsText() creates text file
- [ ] showNotification() displays correctly
- [ ] debugLog() appears in console
- [ ] Error handling works for all functions
- [ ] All form fields save correctly

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** Production Ready ✅
