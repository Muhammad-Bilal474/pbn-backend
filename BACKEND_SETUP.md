# PBN Content Automation Platform - Backend Documentation

## Project Overview

A production-ready SaaS content automation platform backend built with Node.js, Express, and MongoDB. The system enables Super Admins to manage users and Google Sheets, while Users can create AI-generated articles and auto-post them to multiple sites.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (7-day expiry)
- **AI Integration**: Claude API (Anthropic)
- **Email**: Nodemailer
- **Security**: bcrypt, CORS, input validation

## Architecture

```
pbn-backend/
├── config/
│   └── database.js              # MongoDB connection
├── src/
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── sheetController.js   # Sheet management
│   │   └── postController.js    # Post creation & publishing
│   ├── middleware/
│   │   ├── auth.js              # JWT & RBAC middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Sheet.js
│   │   ├── Post.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sheetRoutes.js
│   │   └── postRoutes.js
│   ├── services/
│   │   └── aiService.js         # Claude API integration
│   └── utils/
│       ├── constants.js         # Enums & constants
│       ├── emailService.js      # Email templating
│       ├── helpers.js           # API response helpers
│       └── jwt.js               # JWT utilities
├── .env.example                 # Environment template
├── index.js                     # Entry point
└── package.json
```

## Setup Instructions

### 1. Clone & Install Dependencies

```bash
cd d:\Projects\pbn-backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pbn-saas

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=7d

# Email (Gmail with App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@pbn-platform.com

# Claude API
CLAUDE_API_KEY=sk-ant-your-anthropic-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# Using MongoDB locally
mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### 4. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/v1/auth`)

#### Login
- **POST** `/api/v1/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

#### Get Current User
- **GET** `/api/v1/auth/me`
- **Auth**: Required

#### Update Profile
- **PUT** `/api/v1/auth/profile`
- **Body**: `{ name, email }`

#### Change Password
- **POST** `/api/v1/auth/change-password`
- **Body**: `{ oldPassword, newPassword, confirmPassword }`

#### Get All Users (Super Admin)
- **GET** `/api/v1/auth/users?page=1&limit=10&role=USER&status=true`
- **Auth**: Super Admin

#### Create User (Super Admin)
- **POST** `/api/v1/auth/users`
- **Body**: `{ name, email, role }`
- **Response**: Sends welcome email with temp password

#### Update User (Super Admin)
- **PUT** `/api/v1/auth/users/:userId`
- **Body**: `{ name, email, role, isActive }`

#### Delete User (Super Admin)
- **DELETE** `/api/v1/auth/users/:userId`

#### Assign Sheets to User (Super Admin)
- **POST** `/api/v1/auth/users/:userId/assign-sheets`
- **Body**: `{ sheetIds: [...] }`

### Sheets (`/api/v1/sheets`)

#### Get All Sheets
- **GET** `/api/v1/sheets?page=1&limit=10&filter=all|my_sites|assigned|platform`
- **Filter Options**:
  - `all`: All available sheets
  - `my_sites`: Created by user
  - `assigned`: Assigned to user
  - `platform`: Platform-wide visible

#### Upload Sheet
- **POST** `/api/v1/sheets`
- **Body**:
  ```json
  {
    "siteName": "My WordPress Site",
    "siteUrl": "https://example.com",
    "type": "WORDPRESS|CUSTOM|WOO_COMMERCE",
    "credentials": { "username": "...", "password": "..." },
    "visibility": "PRIVATE|PLATFORM",
    "metadata": { "category": "tech", "description": "..." }
  }
  ```

#### Get Sheet Details
- **GET** `/api/v1/sheets/:sheetId`

#### Update Sheet
- **PUT** `/api/v1/sheets/:sheetId`
- **Body**: Any of the above fields

#### Delete Sheet
- **DELETE** `/api/v1/sheets/:sheetId`

#### Assign Sheet to Users (Super Admin)
- **POST** `/api/v1/sheets/:sheetId/assign-users`
- **Body**: `{ userIds: [...] }`

#### Make Sheet Public (Super Admin)
- **POST** `/api/v1/sheets/:sheetId/make-public`

### Posts (`/api/v1/posts`)

#### Get All Posts
- **GET** `/api/v1/posts?page=1&limit=10&status=DRAFT|GENERATED&author=userId`

#### Create Post (Triggers AI Generation)
- **POST** `/api/v1/posts`
- **Body**:
  ```json
  {
    "title": "10 Best Practices for SEO",
    "keywords": ["seo", "best practices", "ranking"],
    "selectedSites": ["sheetId1", "sheetId2"],
    "scheduledTime": "2024-04-20T10:00:00Z"
  }
  ```

#### Get Post Details
- **GET** `/api/v1/posts/:postId`

#### Update Post
- **PUT** `/api/v1/posts/:postId`
- **Body**: `{ title, content, keywords, selectedSites }`
- **Note**: Can only update DRAFT or GENERATED posts

#### Publish Post (Auto-Post to All Selected Sites)
- **POST** `/api/v1/posts/:postId/publish`

#### Get Post History
- **GET** `/api/v1/posts/:postId/history`

#### Delete Post
- **DELETE** `/api/v1/posts/:postId`

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "SUPER_ADMIN" | "USER",
  isActive: Boolean,
  lastLogin: Date,
  assignedSheets: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Sheet
```javascript
{
  siteName: String,
  siteUrl: String,
  credentials: { username, password, apiKeyOrToken },
  type: "WORDPRESS" | "CUSTOM" | "WOO_COMMERCE",
  visibility: "PLATFORM" | "PRIVATE",
  createdBy: ObjectId (User),
  assignedTo: [ObjectId],
  isActive: Boolean,
  metadata: { description, category },
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
  selectedSites: [ObjectId (Sheet)],
  status: "DRAFT" | "GENERATING" | "GENERATED" | "POSTING" | "COMPLETED" | "FAILED",
  postingResults: [
    {
      site: ObjectId,
      status: "PENDING" | "SUCCESS" | "FAILED",
      postUrl: String,
      errorMessage: String,
      postedAt: Date
    }
  ],
  metadata: { seoTitle, seoDescription, featuredImage },
  isScheduled: Boolean,
  scheduledTime: Date,
  retryCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog
```javascript
{
  user: ObjectId (User),
  action: String (enum),
  resource: "USER" | "SHEET" | "POST" | "AUTH",
  resourceId: ObjectId,
  description: String,
  status: "SUCCESS" | "FAILED",
  ipAddress: String,
  createdAt: Date
}
```

## Authentication Flow

### User Registration (Super Admin only)
1. Admin creates user via `/api/v1/auth/users`
2. System generates random password
3. Email sent with temporary credentials
4. User logs in with email + temp password
5. User must change password on first login

### JWT Token
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 7 days (configurable)
- **Payload**: `{ userId, iat, exp }`

## Security Features

✅ **Password Security**: bcrypt hashing with salt rounds  
✅ **JWT Authentication**: Secure token-based auth  
✅ **Role-Based Access Control**: Super Admin vs User roles  
✅ **Input Validation**: Express-validator for all inputs  
✅ **Error Handling**: Centralized error middleware  
✅ **CORS Protection**: Configurable origin  
✅ **Request Size Limits**: 50MB for uploads  
✅ **Audit Logging**: Track all critical actions  

## AI Integration (Claude API)

### How It Works

1. User creates post with keywords
2. System sends request to Claude API
3. Article generated in background
4. SEO metadata auto-generated
5. User can edit before publishing

### Claude Prompts

**Article Generation**:
- Generates 1500-2000 word articles
- SEO-optimized structure
- Proper heading hierarchy
- Engaging introduction & conclusion

**SEO Metadata**:
- Meta title (60 chars max)
- Meta description (160 chars max)
- Keywords extraction

## Email Service

### Emails Sent

1. **Welcome Email** - New user credentials
2. **Password Reset** - Reset link (1 hour valid)
3. **Post Notification** - When article published

### Configuration

Uses **Nodemailer** with Gmail SMTP:
1. Enable 2FA on Gmail account
2. Generate "App Password"
3. Set `EMAIL_PASS` in .env

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc) |
| 500 | Internal Server Error |

## Development Tips

### Enable Debug Logging
```javascript
// In auth middleware
console.log('User authenticated:', req.user._id);
```

### Test Authentication
```bash
# Get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/v1/auth/me
```

### Test Data Setup
```bash
# Create test super admin user
# Then use admin credentials to create other users
```

## Performance Considerations

- **Database Indexing**: Added on email, createdBy fields
- **Pagination**: All list endpoints paginated (limit 10 default)
- **AI Generation**: Runs in background (non-blocking)
- **Auto-Posting**: Queue-based (implement Bull/RabbitMQ for scale)

## Future Enhancements

🔮 **Rate Limiting**: Prevent API abuse  
🔮 **Job Queue**: Bull/Redis for async tasks  
🔮 **WebSocket**: Real-time post status updates  
🔮 **Caching**: Redis for frequently accessed data  
🔮 **Analytics**: Post performance tracking  
🔮 **WordPress Plugin**: Direct WordPress integration  
🔮 **Post Scheduling**: Advanced scheduling engine  
🔮 **Retry Logic**: Failed post retry mechanism  
🔮 **Multi-language**: Support multiple languages  

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas connection
- [ ] Setup Nodemailer with production email
- [ ] Add Claude API key from Anthropic
- [ ] Enable HTTPS/SSL
- [ ] Setup error monitoring (Sentry)
- [ ] Configure RateLimit middleware
- [ ] Setup proper logging

### Deployment Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS EC2**: Standard Node.js deployment
- **DigitalOcean**: App Platform
- **Render**: Connect GitHub repo

## Support & Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in .env
- Verify network connectivity

**Email Not Sending**
- Enable "Less secure app access" in Gmail
- Use Gmail App Password (not regular password)
- Check `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`

**Claude API Errors**
- Verify API key is valid
- Check monthly usage limits
- Ensure request format is correct

**JWT Token Expired**
- Token valid for 7 days
- User must login again to get new token
- No refresh token in this version

