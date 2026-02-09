# VaultLink Testing Checklist

Use this checklist to verify all features are working correctly.

## Pre-Testing Setup
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] MongoDB is running and accessible
- [ ] Cloudinary account created (free tier available)
- [ ] `backend/.env` configured with valid credentials
- [ ] `frontend/.env` configured with API URL

## Backend Testing

### Server Startup
- [ ] Backend starts without errors (`cd backend && npm run dev`)
- [ ] See "MongoDB Connected" message
- [ ] See "Cloudinary initialized" message
- [ ] See "Server running on port 5000" message
- [ ] Health check works: `curl http://localhost:5000/health`

### Text Upload Tests
- [ ] Upload text with default expiry (10 minutes)
- [ ] Upload text with custom expiry (1 hour)
- [ ] Upload text with quick expiry (set to expire in 2 minutes)
- [ ] Verify unique share URL is generated
- [ ] Verify expiresAt timestamp is correct

### File Upload Tests
- [ ] Upload small text file (< 1MB)
- [ ] Upload medium file (5MB)
- [ ] Upload PDF document
- [ ] Upload image file (JPG/PNG)
- [ ] Verify Cloudinary Media Library shows uploaded files in vaultlink folder
- [ ] Verify file metadata is correct (name, size)

### Content Retrieval Tests
- [ ] Retrieve text content by unique ID
- [ ] Retrieve file content by unique ID
- [ ] Content includes correct expiry time
- [ ] File URL is accessible and downloadable

### Validation Tests
- [ ] Empty text upload is rejected (400 error)
- [ ] Missing file upload is rejected (400 error)
- [ ] Invalid unique ID returns 403
- [ ] Text over 50,000 characters is rejected
- [ ] File over 10MB is rejected

### Rate Limiting Tests
- [ ] 10th upload within 15 minutes succeeds
- [ ] 11th upload within 15 minutes fails (429 error)
- [ ] 60th content retrieval within 1 minute succeeds
- [ ] 61st content retrieval within 1 minute fails (429 error)

### Expiry Tests
- [ ] Upload content with 2-minute expiry
- [ ] Content is accessible immediately
- [ ] Wait 3 minutes
- [ ] Content returns 410 Gone status
- [ ] Wait 5 more minutes (for cleanup job)
- [ ] Content is removed from MongoDB
- [ ] File is removed from Cloudinary (if applicable - check Media Library)

### Error Handling
- [ ] Invalid request format returns proper error message
- [ ] Server errors are logged but don't crash
- [ ] CORS errors don't occur for localhost:5173

## Frontend Testing

### Application Startup
- [ ] Frontend starts without errors (`cd frontend && npm run dev`)
- [ ] Application opens at http://localhost:5173
- [ ] No console errors in browser
- [ ] Page loads completely

### Upload Page - Text Mode
- [ ] "Text" tab is selected by default
- [ ] Textarea is visible and functional
- [ ] Character counter shows 0 / 50,000
- [ ] Quick expiry buttons work (10min, 30min, 1hr, 1day)
- [ ] Custom date/time picker works
- [ ] Cannot select date in the past
- [ ] Submit button is enabled when text is entered
- [ ] Submit button is disabled when empty

### Upload Page - File Mode
- [ ] "File" tab switches to file upload view
- [ ] Drag and drop area is visible
- [ ] Click to browse works
- [ ] Selected file name is displayed
- [ ] File size is shown correctly
- [ ] Remove file button works
- [ ] File over 10MB shows error message
- [ ] Submit button enabled only when file is selected

### Upload Success Flow
- [ ] Upload shows loading state
- [ ] Success message appears after upload
- [ ] Share URL is displayed
- [ ] Share URL is correctly formatted
- [ ] Copy Link button is visible
- [ ] Copy Link button works (shows "Copied!")
- [ ] New Upload button returns to upload form
- [ ] Form is reset after new upload click

### Share Page - Text Display
- [ ] Navigate to text share URL
- [ ] Text content displays correctly
- [ ] Text formatting is preserved
- [ ] Expiry time is shown
- [ ] **Countdown timer is visible and ticking**
- [ ] **Timer shows correct format (HH:MM:SS or MM:SS)**
- [ ] **Timer updates every second**
- [ ] Copy to Clipboard button works
- [ ] Copied feedback is shown
- [ ] "Upload New Content" link works

### Share Page - File Display
- [ ] Navigate to file share URL
- [ ] File icon is displayed
- [ ] File name is shown correctly
- [ ] File size is formatted (KB/MB)
- [ ] **Countdown timer displays correctly**
- [ ] **Timer is positioned in header area**
- [ ] Download button is visible
- [ ] Download button works
- [ ] File downloads with correct name
- [ ] "Upload New Content" link works

### Error Pages
- [ ] Invalid share URL shows error page
- [ ] Error message is clear
- [ ] Error icon is displayed
- [ ] "Go to Upload Page" button works
- [ ] Expired content shows "expired" error
- [ ] Network errors show appropriate message

### Responsive Design
- [ ] Desktop view (1920x1080) looks good
- [ ] Tablet view (768x1024) is functional
- [ ] Mobile view (375x667) works properly
- [ ] All buttons are tappable on mobile
- [ ] Text is readable on all screen sizes
- [ ] No horizontal scrolling
- [ ] Upload form fits on screen

### Browser Compatibility
- [ ] Chrome/Edge (latest) works
- [ ] Firefox (latest) works
- [ ] Safari (latest) works
- [ ] Clipboard API works on localhost
- [ ] File uploads work in all browsers

## Integration Testing

### Complete Flow - Text
- [ ] Open upload page
- [ ] Enter text: "Test message for sharing"
- [ ] Select "30 min" expiry
- [ ] Click "Generate Share Link"
- [ ] Copy the generated link
- [ ] Open link in new incognito window
- [ ] Verify text is displayed
- [ ] Click "Copy to Clipboard"
- [ ] Paste in a text editor
- [ ] Text matches original

### Complete Flow - File
- [ ] Open upload page
- [ ] Switch to File tab
- [ ] Select a PDF file (< 5MB)
- [ ] Set custom expiry to tomorrow
- [ ] Click "Generate Share Link"
- [ ] Copy the link
- [ ] Share with another browser/device
- [ ] Open the link
- [ ] Click "Download File"
- [ ] Open downloaded file
- [ ] File opens correctly

### Expiry Verification
- [ ] Upload text with 2-minute expiry
- [ ] Note the share URL
- [ ] Open URL immediately (should work)
- [ ] Wait 3 minutes
- [ ] Refresh the page (should show expired)
- [ ] Wait 5 more minutes
- [ ] Check MongoDB (content should be deleted)

### Rate Limit Verification
- [ ] Upload 10 texts in quick succession
- [ ] All 10 succeed
- [ ] Try 11th upload
- [ ] See rate limit error
- [ ] Wait 15 minutes
- [ ] Upload works again

## Performance Testing

### Upload Performance
- [ ] Small text (100 chars) uploads in < 1 second
- [ ] Large text (10,000 chars) uploads in < 2 seconds
- [ ] Small file (100KB) uploads in < 2 seconds
- [ ] Medium file (5MB) uploads in < 10 seconds
- [ ] Upload shows progress/loading state

### Retrieval Performance
- [ ] Text content loads in < 1 second
- [ ] File info loads in < 1 second
- [ ] File download starts immediately
- [ ] No lag when copying to clipboard

### Cleanup Job
- [ ] Cron job runs every 5 minutes (check logs)
- [ ] Expired content is deleted
- [ ] Files are removed from Cloudinary
- [ ] No errors in cleanup logs

## Security Testing

### XSS Protection
- [ ] Upload text with `<script>alert('xss')</script>`
- [ ] View the shared content
- [ ] Script tags are escaped (not executed)
- [ ] Content displays as plain text

### Input Validation
- [ ] SQL injection attempts are rejected
- [ ] Invalid characters in unique ID return 403
- [ ] Malformed requests return proper errors
- [ ] File type validation works

### Rate Limiting
- [ ] Rapid uploads are blocked
- [ ] Rate limit is per IP address
- [ ] Error message is informative
- [ ] Reset time is communicated

## Production Readiness

### Environment Configuration
- [ ] Production .env files configured
- [ ] MongoDB uses authentication
- [ ] MongoDB connection uses TLS
- [ ] Cloudinary credentials are secure
- [ ] CORS configured for production domain

### Build Process
- [ ] Backend runs without dev dependencies
- [ ] Frontend builds successfully
- [ ] Production build has no errors
- [ ] Assets are minified
- [ ] No source maps in production

### Monitoring
- [ ] Server logs are being generated
- [ ] Error logging is working
- [ ] Cleanup job logs are visible
- [ ] Can monitor MongoDB queries
- [ ] Cloudinary usage is tracked

### Security Scan
- [ ] npm audit shows 0 vulnerabilities
- [ ] All dependencies are up to date
- [ ] CodeQL scan passes
- [ ] No secrets in code
- [ ] .env files are in .gitignore

## Test Results

Date Tested: _______________
Tested By: _______________

Total Tests: _______________
Passed: _______________
Failed: _______________

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________

## Sign-off

- [ ] All critical tests passed
- [ ] All security tests passed
- [ ] Application is ready for deployment
- [ ] Documentation is complete
- [ ] Team has been trained on deployment

Approved By: _______________
Date: _______________
