# VaultLink Testing Guide

This guide provides step-by-step instructions for testing the VaultLink application locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [API Testing](#api-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before testing, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ MongoDB running (local or Atlas)
- ✅ Cloudinary account created (free tier available)
- ✅ Git installed

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/mayanklodhi1014z-svg/VaultLink.git
cd VaultLink

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vaultlink
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
FRONTEND_URL=http://localhost:5173
```

**Getting Cloudinary Credentials:**
1. Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
2. Go to your Dashboard
3. Copy the credentials:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

#### Frontend Configuration

Create `frontend/.env` file:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start MongoDB

**Option 1: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongodb
# OR
mongod --dbpath /path/to/data/directory
```

**Option 2: MongoDB Atlas**
- Use your Atlas connection string in `MONGODB_URI`

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Cloudinary initialized successfully
Cleanup job scheduled to run every 5 minutes
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Backend Testing

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "VaultLink API is running"
}
```

### 2. Test Text Upload

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "type=text" \
  -F "content=Hello, this is a test message!"
```

Expected response:
```json
{
  "success": true,
  "shareUrl": "http://localhost:5173/share/abc123xyz456",
  "uniqueId": "abc123xyz456",
  "expiresAt": "2026-02-07T11:00:00.000Z"
}
```

### 3. Test File Upload

```bash
# Create a test file
echo "This is a test file" > test.txt

# Upload the file
curl -X POST http://localhost:5000/api/upload \
  -F "type=file" \
  -F "file=@test.txt"
```

Expected response:
```json
{
  "success": true,
  "shareUrl": "http://localhost:5173/share/def456ghi789",
  "uniqueId": "def456ghi789",
  "expiresAt": "2026-02-07T11:00:00.000Z"
}
```

### 4. Test Content Retrieval

```bash
# Replace 'abc123xyz456' with the uniqueId from previous upload
curl http://localhost:5000/api/content/abc123xyz456
```

Expected response (for text):
```json
{
  "success": true,
  "type": "text",
  "content": "Hello, this is a test message!",
  "expiresAt": "2026-02-07T11:00:00.000Z"
}
```

### 5. Test Custom Expiry

```bash
# Set expiry to 1 hour from now
EXPIRY_DATE=$(date -u -d '+1 hour' +"%Y-%m-%dT%H:%M:%S.000Z")

curl -X POST http://localhost:5000/api/upload \
  -F "type=text" \
  -F "content=This expires in 1 hour" \
  -F "expiryDate=$EXPIRY_DATE"
```

### 6. Test Rate Limiting

```bash
# Try uploading 11 times in quick succession
# The 11th request should fail with 429 (Too Many Requests)
for i in {1..11}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/upload \
    -F "type=text" \
    -F "content=Rate limit test $i" \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

Expected: First 10 succeed (201), 11th fails (429)

### 7. Test Error Cases

**Invalid Link:**
```bash
curl http://localhost:5000/api/content/invalidid123
```
Expected: 403 Forbidden

**Expired Content:**
- Wait for content to expire (10 minutes by default)
- Try accessing it again
Expected: 410 Gone

## Frontend Testing

### 1. Build Verification

```bash
cd frontend
npm run build
```

Expected output:
```
✓ built in X.XXs
dist/index.html
dist/assets/index-[hash].css
dist/assets/index-[hash].js
```

### 2. Manual UI Testing Checklist

#### Upload Page (http://localhost:5173)

**Text Upload:**
- [ ] Open the application
- [ ] Select "Text" option (should be selected by default)
- [ ] Enter some text in the textarea
- [ ] Click one of the quick expiry buttons (10min, 30min, 1hr, 1day)
- [ ] Click "Generate Share Link"
- [ ] Verify success message appears
- [ ] Verify shareable link is displayed
- [ ] Click "Copy Link" button
- [ ] Verify "Copied!" message appears
- [ ] Click "New Upload" to return to upload form

**File Upload:**
- [ ] Select "File" option
- [ ] Click or drag a file to the upload area
- [ ] Verify file name and size are displayed
- [ ] Optionally set custom expiry date
- [ ] Click "Generate Share Link"
- [ ] Verify success message and link

**Validation Tests:**
- [ ] Try submitting empty text → Should show error
- [ ] Try submitting without file selected → Should show error
- [ ] Try uploading file > 10MB → Should show error
- [ ] Enter 50,001 characters → Should prevent input

#### Share Page (http://localhost:5173/share/:uniqueId)

**Text Content:**
- [ ] Paste a text share link in browser
- [ ] Verify text is displayed in a code block
- [ ] Verify expiry time is shown
- [ ] Click "Copy to Clipboard"
- [ ] Verify copy success feedback
- [ ] Click "Upload New Content" → Should return to upload page

**File Content:**
- [ ] Paste a file share link in browser
- [ ] Verify file name and size are displayed
- [ ] Click "Download File"
- [ ] Verify file downloads successfully
- [ ] Verify "Upload New Content" link works

**Error Cases:**
- [ ] Try invalid URL: http://localhost:5173/share/invalidlink
  - Should show "Content not found" error
- [ ] Wait for content to expire (or use expired link)
  - Should show "Content has expired" error

### 3. Responsive Design Testing

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Verify:
- [ ] Layout adapts properly
- [ ] All buttons are accessible
- [ ] Text is readable
- [ ] No horizontal scrolling

## API Testing

### Using the Provided Test Script

Create `backend/test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"

echo "================================"
echo "VaultLink API Test Suite"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s $API_URL/health | jq '.'
echo ""

# Test 2: Text Upload
echo "Test 2: Text Upload"
RESPONSE=$(curl -s -X POST $API_URL/api/upload \
  -F "type=text" \
  -F "content=Hello from automated test!")

echo $RESPONSE | jq '.'
UNIQUE_ID=$(echo $RESPONSE | jq -r '.uniqueId')
echo "UniqueID: $UNIQUE_ID"
echo ""

# Test 3: Retrieve Text
echo "Test 3: Retrieve Text Content"
sleep 1
curl -s $API_URL/api/content/$UNIQUE_ID | jq '.'
echo ""

# Test 4: File Upload
echo "Test 4: File Upload"
echo "Test file content" > /tmp/test-file.txt
FILE_RESPONSE=$(curl -s -X POST $API_URL/api/upload \
  -F "type=file" \
  -F "file=@/tmp/test-file.txt")

echo $FILE_RESPONSE | jq '.'
FILE_UNIQUE_ID=$(echo $FILE_RESPONSE | jq -r '.uniqueId')
echo "File UniqueID: $FILE_UNIQUE_ID"
echo ""

# Test 5: Retrieve File Info
echo "Test 5: Retrieve File Content Info"
sleep 1
curl -s $API_URL/api/content/$FILE_UNIQUE_ID | jq '.'
echo ""

# Test 6: Invalid Content
echo "Test 6: Invalid Content (should return 403)"
curl -s $API_URL/api/content/invalidid123 -w "\nHTTP Status: %{http_code}\n"
echo ""

echo "================================"
echo "All tests completed!"
echo "================================"
```

Make it executable and run:
```bash
chmod +x backend/test-api.sh
./backend/test-api.sh
```

### Using Postman/Insomnia

Import these request examples:

**Collection: VaultLink API**

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:5000/health`

2. **Upload Text**
   - Method: POST
   - URL: `http://localhost:5000/api/upload`
   - Body (form-data):
     - `type`: `text`
     - `content`: `Your text here`
     - `expiryDate`: `2026-02-07T12:00:00.000Z` (optional)

3. **Upload File**
   - Method: POST
   - URL: `http://localhost:5000/api/upload`
   - Body (form-data):
     - `type`: `file`
     - `file`: [select file]

4. **Get Content**
   - Method: GET
   - URL: `http://localhost:5000/api/content/{{uniqueId}}`

## End-to-End Testing

### Scenario 1: Share Text with Friend

1. **Create content:**
   - Open http://localhost:5173
   - Enter: "Meeting at 3 PM today!"
   - Select "10 min" expiry
   - Click "Generate Share Link"

2. **Share link:**
   - Copy the generated link
   - Open in new browser/incognito window

3. **Verify:**
   - Text is displayed correctly
   - Expiry time is shown
   - Copy button works

4. **Wait for expiry:**
   - Wait 10 minutes
   - Refresh the share page
   - Should show "Content has expired"

### Scenario 2: Share File

1. **Create a test PDF/image:**
   - Prepare a small file (< 10MB)

2. **Upload:**
   - Select "File" tab
   - Drag/drop or select the file
   - Set 1-hour expiry
   - Generate link

3. **Verify download:**
   - Open share link
   - Click "Download File"
   - Verify file downloads correctly

### Scenario 3: Test Cleanup Job

1. **Upload content with 10-minute expiry**

2. **Check MongoDB:**
   ```bash
   mongosh
   use vaultlink
   db.contents.find().pretty()
   ```

3. **Wait 15 minutes** (10 min expiry + 5 min max cleanup interval)

4. **Check again:**
   ```bash
   db.contents.find().pretty()
   # Expired content should be gone
   ```

5. **Check Cloudinary Dashboard:**
   - Log in to your Cloudinary account
   - Go to Media Library
   - Verify expired files are deleted from the vaultlink folder

## Troubleshooting

### Backend Issues

**Problem:** "MongoDB connection failed"
```
Solution:
1. Ensure MongoDB is running: sudo systemctl status mongodb
2. Check connection string in .env
3. For Atlas, ensure IP is whitelisted
```

**Problem:** "Cloudinary initialization error"
```
Solution:
1. Verify all Cloudinary env variables are set correctly
2. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
3. Ensure credentials are from your Cloudinary dashboard
4. Verify your Cloudinary account is active
```

**Problem:** "Port 5000 already in use"
```
Solution:
1. Change PORT in backend/.env
2. Or kill the process: lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Problem:** "Network Error" when uploading
```
Solution:
1. Ensure backend is running on port 5000
2. Check VITE_API_URL in frontend/.env
3. Check browser console for CORS errors
4. Verify backend CORS configuration allows http://localhost:5173
```

**Problem:** Build fails with PostCSS error
```
Solution:
Already fixed - ensure postcss.config.js uses ES module syntax (export default)
```

**Problem:** "Cannot access clipboard"
```
Solution:
Clipboard API requires HTTPS in production. For local testing:
1. Chrome: Works on localhost
2. Firefox: Works on localhost
3. For production, use HTTPS
```

### Common Issues

**Rate Limiting Triggered:**
- Wait 15 minutes for upload limit to reset
- Wait 1 minute for content retrieval limit to reset

**File Upload Fails:**
- Check file size < 10MB
- Ensure Cloudinary storage quota isn't exceeded (25GB free tier)
- Verify Cloudinary API credentials are correct
- Check network connectivity to Cloudinary

**Content Not Found:**
- UniqueId is case-sensitive
- Content may have expired
- Check MongoDB to verify content exists

## Monitoring and Logs

### Backend Logs

Watch logs in real-time:
```bash
cd backend
npm run dev
# Logs will show:
# - Upload requests
# - Content retrieval
# - Cleanup job runs (every 5 minutes)
# - Rate limit violations
# - Errors
```

### MongoDB Monitoring

```bash
# Connect to MongoDB
mongosh

# Use the database
use vaultlink

# Count documents
db.contents.countDocuments()

# Find recent uploads
db.contents.find().sort({createdAt: -1}).limit(5).pretty()

# Find expiring soon
db.contents.find({expiresAt: {$lt: new Date(Date.now() + 600000)}}).pretty()

# Check indexes
db.contents.getIndexes()
```

### Cloudinary Storage Monitoring

- Log in to Cloudinary Dashboard
- Monitor usage and bandwidth (25GB storage, 25GB/month bandwidth on free tier)
- Check Media Library → vaultlink folder for uploaded files
- Verify cleanup is working (files should be deleted after expiry)

## Production Testing Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] MongoDB has proper authentication
- [ ] Cloudinary credentials configured correctly
- [ ] CORS configured for production domain
- [ ] HTTPS enabled for both frontend and backend
- [ ] Rate limits are appropriate for expected traffic
- [ ] Cleanup job is running (check logs)
- [ ] Error handling works (test 403, 410, 429 responses)
- [ ] File size limits enforced
- [ ] Content expiry working correctly
- [ ] No security vulnerabilities (npm audit)
- [ ] Database has proper indexes
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured

## Next Steps

Once local testing is complete:

1. **Deploy Backend:**
   - Use services like Heroku, Railway, Render, or DigitalOcean
   - Set environment variables
   - Ensure MongoDB and Cloudinary are accessible

2. **Deploy Frontend:**
   - Build: `npm run build`
   - Deploy to Netlify, Vercel, or similar
   - Set VITE_API_URL to production backend URL

3. **Test Production:**
   - Run through all test scenarios
   - Verify HTTPS works
   - Check clipboard functionality
   - Monitor logs and errors

## Support

If you encounter issues:
1. Check this TESTING.md guide
2. Review SECURITY_SUMMARY.md
3. Check README.md for architecture details
4. Search GitHub issues
5. Enable debug logging in backend
