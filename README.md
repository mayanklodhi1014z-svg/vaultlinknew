# VaultLink

A secure full-stack web application for sharing text and files through generated links with automatic expiration.

##  Quick Start

**Want to test it right now?** See [TESTING.md](TESTING.md) for detailed testing instructions.

```bash
# 1. Quick setup
./quick-start.sh

# 2. Configure environment (edit backend/.env with your credentials)
# 3. Start backend: cd backend && npm run dev
# 4. Start frontend: cd frontend && npm run dev
# 5. Test API: ./test-api.sh
```


## Overview

VaultLink allows users to upload text content or files and share them securely using unique, cryptographically-generated links. Content is accessible only through the generated link and automatically expires after a specified duration (default: 10 minutes).


## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database (via Mongoose ODM)
- **Cloudinary** - Cloud storage and media management
- **Multer** - File upload middleware
- **nanoid** - Unique ID generation
- **node-cron** - Scheduled cleanup jobs
- **express-validator** - Input validation


# Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (free tier available)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/mayanklodhi1014z-svg/vaultlinknew.git
cd vaultlinknew
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vaultlink
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
FRONTEND_URL=http://localhost:5173
```

**Note**: For Cloudinary setup:
1. Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

#### Start Backend Server
```bash
npm start
# or for development with auto-reload
npm run dev:clean
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

#### Start Frontend Development Server
```bash
npm run dev:clean
```

Application will open at `http://localhost:5173`

### 4. Build for Production

#### Backend
```bash
cd backend:clean
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Upload Content
**POST** `/api/upload`

Upload text or file content and receive a shareable link.

**Request (Text Upload):**
```http
Content-Type: multipart/form-data

type: "text"
content: "Your text content here"
expiryDate: "2026-02-07T12:00:00Z" (optional)
```

**Request (File Upload):**
```http
Content-Type: multipart/form-data

type: "file"
file: [File object]
expiryDate: "2026-02-07T12:00:00Z" (optional)
```

**Response (Success - 201):**
```json
{
  "success": true,
  "shareUrl": "http://localhost:5173/share/abc123xyz456",
  "uniqueId": "abc123xyz456",
  "expiresAt": "2026-02-07T12:00:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

#### 2. Retrieve Content
**GET** `/api/content/:uniqueId`

Retrieve content using the unique ID from the share link.

**Response (Text - 200):**
```json
{
  "success": true,
  "type": "text",
  "content": "The uploaded text content",
  "expiresAt": "2026-02-07T12:00:00.000Z"
}
```

**Response (File - 200):**
```json
{
  "success": true,
  "type": "file",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "downloadUrl": "https://res.cloudinary.com/...",
  "expiresAt": "2026-02-07T12:00:00.000Z"
}
```

**Response (Not Found - 403):**
```json
{
  "success": false,
  "message": "Content not found or invalid link"
}
```

**Response (Expired - 410):**
```json
{
  "success": false,
  "message": "Content has expired"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden (invalid link)
- `410` - Gone (expired content)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Rate Limiting
The API implements rate limiting to prevent abuse:
- **Upload endpoint**: 10 requests per 15 minutes per IP address
- **Content retrieval**: 60 requests per minute per IP address

When rate limit is exceeded, the API returns a 429 status code with a message indicating when to retry.

## Design Decisions

### Why MongoDB?
- **Flexible Schema**: NoSQL structure suits the dual nature of text/file uploads
- **Fast Queries**: Indexed uniqueId field enables quick lookups
- **Scalability**: Easy horizontal scaling for future growth
- **TTL Indexes**: Native support for automatic document expiration (though we use cron for more control)

### Why Cloudinary?
- **Reliability**: Enterprise-grade infrastructure ensures high availability
- **Easy Integration**: Simple API and SDK for file operations
- **Scalability**: Automatically handles traffic spikes and storage needs
- **Global CDN**: Fast content delivery worldwide with optimized media delivery
- **Cost-Effective**: Generous free tier with pay-as-you-go pricing
- **Media Management**: Built-in transformations and optimizations

### Why nanoid for Unique IDs?
- **Security**: Cryptographically secure random generation
- **Collision Resistance**: 12-character IDs provide ~3 million years to have 1% collision probability at 1000 IDs/hour
- **URL-Safe**: Characters are safe for URLs without encoding
- **Compact**: Shorter than UUIDs while maintaining security
- **Performance**: Faster than UUID generation

### Expiry Handling Approach
- **Cron-Based Cleanup**: Runs every 5 minutes to delete expired content
- **Database + Storage Cleanup**: Removes both metadata and actual files
- **Graceful Degradation**: Cleanup failures don't break the application
- **Default Expiry**: 10 minutes balances usability with storage costs
- **Custom Expiry**: Users can set their own expiration time

## Data Flow Diagram

```
┌─────────────┐
│   User      │
└─────┬───────┘
      │
      ▼
┌────────────────────────────────────────────┐
│         Frontend (React + Vite)            │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │ Upload Page  │      │   Share Page    │ │
│  └──────┬───────┘      └────────┬────────┘ │
└─────────┼─────────────────────┬─┼──────────┘
          │                     │ │
          │ POST /api/upload    │ │ GET /api/content/:id
          ▼                     ▼ ▼
┌──────────────────────────────────────────────┐
│         Backend (Express.js)                 │
│  ┌──────────────┐      ┌──────────────────┐  │
│  │   Routes     │─────▶│  Controllers     │  │
│  └──────────────┘      └────────┬─────────┘  │
│                               ┌──┴──┐        │
│                               │     │        │
│                         ┌─────▼─┐ ┌─▼──────┐ │
│                         │ Upload│ │Retrieve│ │
│                         │Service│ │Service │ │
│                         └───┬───┘ └───┬────┘ │
└─────────────────────────────┼─────────┼──────┘
                              │         │
              ┌───────────────┼─────────┼──────────┐
              │               │         │          │
              ▼               ▼         ▼          ▼
    ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
    │   MongoDB    │  │   Cloudinary     │  │  Cron Job    │
    │              │  │                  │  │              │
    │ - uniqueId   │  │ - File uploads   │  │ - Runs every │
    │ - content    │  │ - Public URLs    │  │   5 minutes  │
    │ - metadata   │  │ - File deletion  │  │ - Cleanup    │
    │ - expiresAt  │  │                  │  │   expired    │
    └──────────────┘  └──────────────────┘  └──────────────┘
```

### Upload Flow:
1. User selects upload type (text/file) and sets expiry
2. Frontend sends POST request with form data
3. Backend generates unique ID using nanoid
4. For files: Upload to Cloudinary → get public URL
5. Save metadata to MongoDB
6. Return shareable link to user

### Retrieval Flow:
1. User opens share link with unique ID
2. Frontend requests content from backend
3. Backend queries MongoDB by unique ID
4. Check expiration status
5. Return content (text) or download URL (file)
6. Frontend displays content or download button

### Cleanup Flow:
1. Cron job runs every 5 minutes
2. Query MongoDB for expired content (expiresAt < now)
3. For each expired item:
   - Delete file from Cloudinary (if file type)
   - Delete document from MongoDB
4. Log results and continue

## License

This project is open source and available under the MIT License.

## Author

Maynk Lodhi
MTECH CSE
25CS60R70
