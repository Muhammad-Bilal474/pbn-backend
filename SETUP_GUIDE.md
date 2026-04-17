# PBN Backend - Setup & Configuration Guide

Complete backend setup guide for Content Automation Platform built with Node.js, Express, MongoDB, and Claude AI.

## 📋 Prerequisites

- **Node.js** 16+ installed
- **MongoDB** 4.4+ running locally or cloud
- **npm** or **yarn** package manager
- **Anthropic API Key** (Claude API access)
- **Email Service** (Gmail, SendGrid, or similar)

## 🚀 Quick Start

### 1. Navigate to Backend
```bash
cd d:\Projects\pbn-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` file from `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pbn
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pbn

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Email Service (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@pbnplatform.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional: Admin Email
ADMIN_EMAIL=admin@pbnplatform.com
```

### 4. Create MongoDB Connection

**Option A: Local MongoDB**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or use MongoDB Compass
# Default: mongodb://localhost:27017/pbn
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create free tier cluster
3. Create database user
4. Get connection string
5. Add to `MONGODB_URI` in `.env`

### 5. Create Initial Admin User

Create `scripts/create-admin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../src/models/users');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      active: true
    });
    
    await admin.save();
    console.log('✅ Admin user created!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
node scripts/create-admin.js
```

### 6. Get Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or login
3. Create API key
4. Add to `.env` as `ANTHROPIC_API_KEY`

### 7. Setup Email Service

**Gmail Example:**
1. Enable 2-factor authentication
2. Generate [App Password](https://myaccount.google.com/apppasswords)
3. Use app password in `.env` as `EMAIL_PASS`

**SendGrid Alternative:**
```javascript
// Update src/utils/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: process.env.EMAIL_FROM,
  subject,
  html
};

await sgMail.send(msg);
```

### 8. Start Development Server
```bash
npm run dev
```

Output should show:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

## 📁 Project Structure

```
src/
├── controllers/         # Business logic
│   ├── authController.js
│   ├── sheetController.js
│   └── postController.js
├── models/             # Database schemas
│   ├── users.js
│   ├── sheets.js
│   ├── posts.js
│   └── auditLogs.js
├── routes/             # API endpoints
│   ├── authRoutes.js
│   ├── sheetRoutes.js
│   └── postRoutes.js
├── middleware/         # Express middleware
│   ├── auth.js         # JWT validation
│   ├── errorHandler.js # Error handling
│   └── validation.js   # Input validation
├── services/           # External services
│   └── aiService.js    # Claude API integration
└── utils/              # Helpers
    ├── constants.js
    ├── emailService.js
    ├── helpers.js
    └── jwt.js

config/
└── database.js         # MongoDB connection

index.js               # Express app entry point
package.json           # Dependencies
.env                   # Environment variables
.env.example           # Example template
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/login              # Login
GET    /api/v1/auth/me                 # Get current user
PUT    /api/v1/auth/profile            # Update profile
POST   /api/v1/auth/change-password    # Change password
```

### Users (Admin Only)
```
GET    /api/v1/auth/users              # List users
POST   /api/v1/auth/users              # Create user
PUT    /api/v1/auth/users/:id          # Update user
DELETE /api/v1/auth/users/:id          # Delete user
POST   /api/v1/auth/users/:id/assign-sheets # Assign websites
```

### Websites (Sheets)
```
POST   /api/v1/sheets                  # Upload website
GET    /api/v1/sheets                  # List websites
GET    /api/v1/sheets/:id              # Get website details
PUT    /api/v1/sheets/:id              # Update website
DELETE /api/v1/sheets/:id              # Delete website
POST   /api/v1/sheets/:id/public       # Make public
```

### Posts
```
POST   /api/v1/posts                   # Create post (triggers AI)
GET    /api/v1/posts                   # List posts
GET    /api/v1/posts/:id               # Get post details
PUT    /api/v1/posts/:id               # Update post
DELETE /api/v1/posts/:id               # Delete post
POST   /api/v1/posts/:id/publish       # Publish to sites
GET    /api/v1/posts/:id/history       # Get posting results
```

## 🧪 Testing Endpoints

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

### Test with Token
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create User (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"John Doe","email":"john@example.com","role":"USER"}'
```

### Upload Website
```bash
curl -X POST http://localhost:5000/api/v1/sheets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "siteName":"My Blog",
    "siteUrl":"https://myblog.com",
    "type":"WORDPRESS",
    "credentials":{"username":"admin","password":"pass"},
    "visibility":"PRIVATE"
  }'
```

### Create Post
```bash
curl -X POST http://localhost:5000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title":"AI Article",
    "keywords":["AI","automation"],
    "selectedSites":["SHEET_ID_HERE"]
  }'
```

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'SUPER_ADMIN' | 'USER',
  active: Boolean,
  lastLogin: Date,
  assignedSheets: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Sheet (Website)
```javascript
{
  siteName: String,
  siteUrl: String,
  type: 'WORDPRESS' | 'CUSTOM' | 'WOO_COMMERCE',
  credentials: Object,
  visibility: 'PRIVATE' | 'PLATFORM',
  createdBy: ObjectId (User),
  assignedTo: [ObjectId],
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Post
```javascript
{
  title: String,
  content: String,
  keywords: [String],
  author: ObjectId (User),
  selectedSites: [ObjectId],
  status: 'DRAFT' | 'GENERATING' | 'GENERATED' | 'POSTING' | 'COMPLETED' | 'FAILED',
  postingResults: [{
    siteId: ObjectId,
    status: 'POSTED' | 'FAILED',
    postUrl: String,
    error: String
  }],
  metadata: {
    seoTitle: String,
    seoDescription: String
  },
  scheduledFor: Date,
  retryCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog
```javascript
{
  userId: ObjectId,
  action: String,
  resourceType: String,
  resourceId: ObjectId,
  status: 'SUCCESS' | 'FAILED',
  details: Object,
  ipAddress: String,
  createdAt: Date
}
```

## 🤖 Claude AI Integration

### How It Works

1. User creates post with keywords
2. Backend receives request
3. `aiService.generateArticleWithClaude()` called
4. Claude API generates article in background
5. Post status updated to GENERATED
6. Frontend polls for status updates
7. User sees "Ready to Publish"

### Configuration

Edit `src/services/aiService.js`:

```javascript
const generateArticleWithClaude = async (keywords) => {
  const prompt = `Write a 1500-2000 word article about: ${keywords.join(', ')}
    - Use proper H2 and H3 headings
    - Include introduction and conclusion
    - Make it SEO optimized`;

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content[0].text;
};
```

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend validates credentials (bcrypt)
3. JWT token generated (7 days expiry)
4. Token sent to frontend
5. Frontend stores token in localStorage
6. All requests include `Authorization: Bearer TOKEN` header
7. Backend verifies token with `auth.js` middleware

## 🚨 Error Handling

All errors return standardized JSON:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 📊 MongoDB Indexes

For better performance, create indexes:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use pbn

# Create indexes
db.users.createIndex({ email: 1 });
db.sheets.createIndex({ createdBy: 1 });
db.posts.createIndex({ author: 1, status: 1 });
db.auditlogs.createIndex({ userId: 1, createdAt: -1 });
```

## 🚀 Deployment

### Using Railway
```bash
npm install -g railway
railway link
railway up
```

### Using Heroku
```bash
npm install -g heroku
heroku login
heroku create pbn-backend
git push heroku main
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build & run:
```bash
docker build -t pbn-backend .
docker run -p 5000:5000 --env-file .env pbn-backend
```

## 📝 Available Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests (if configured)
npm run lint   # Run ESLint (if configured)
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running on port 27017 |
| CORS errors | Add frontend URL to `CORS_ORIGIN` in .env |
| Invalid JWT | Check `JWT_SECRET` is same on all instances |
| Email not sending | Verify SMTP credentials & less secure apps enabled |
| Claude API error | Check API key is valid & account has credits |

## 📚 Documentation

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Anthropic API Docs](https://docs.anthropic.com)
- [JWT Guide](https://jwt.io)

## ✅ Ready to Go!

1. ✅ Dependencies installed
2. ✅ Environment variables configured
3. ✅ MongoDB running
4. ✅ Admin user created
5. ✅ Server started

**Frontend is running on:** http://localhost:3000
**Backend is running on:** http://localhost:5000

---

**Backend Production Ready! 🎉**

Made with ❤️ using Node.js + Express
