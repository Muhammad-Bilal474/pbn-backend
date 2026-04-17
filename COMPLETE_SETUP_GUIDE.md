# PBN SaaS Platform - Complete Setup Guide

## 🚀 Quick Start Overview

This is a **production-ready Content Automation Platform** with:
- ✅ JWT Authentication & Role-Based Access Control
- ✅ AI-Powered Article Generation (Claude API)
- ✅ Multi-Site Auto-Posting System
- ✅ Super Admin + User Roles
- ✅ Email Notifications (Nodemailer)
- ✅ Dark/Light Theme Support
- ✅ Fully Responsive UI

---

## 📋 Part 1: Backend Setup

### 1.1 Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Anthropic Claude API key
- Gmail app password (for email service)

### 1.2 Installation

```bash
cd d:\Projects\pbn-backend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env
```

### 1.3 Configure `.env` File

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pbn-saas
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/pbn-saas

# JWT
JWT_SECRET=your_super_secure_secret_key_change_this_in_production
JWT_EXPIRY=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@pbn-platform.com

# Claude AI
CLAUDE_API_KEY=sk-ant-your-key-here

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 1.4 Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5 Get Gmail App Password
1. Enable 2FA on Google Account
2. Go to `myaccount.google.com/apppasswords`
3. Generate "App Password" for Mail
4. Use the 16-character password in `.env`

### 1.6 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

✅ Backend running on: http://localhost:5000

---

## 📋 Part 2: Frontend Setup

### 2.1 Create Next.js Project (Without TypeScript)

```bash
# Navigate to projects directory
cd d:\Projects

# Create Next.js app with NO TypeScript
npx create-next-app@latest pbn-frontend --tailwind --no-typescript

# Select these options when prompted:
# ✔ TypeScript: No
# ✔ ESLint: Yes
# ✔ Tailwind CSS: Yes
# ✔ `src/` directory: No
# ✔ App Router: Yes
# ✔ Would you like to import alias: Yes (@/*)

cd pbn-frontend
```

### 2.2 Install Additional Dependencies

```bash
# UI Components & Styling
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# State Management & Utils
npm install axios zustand next-themes js-cookie

# Notifications & Icons
npm install react-hot-toast react-icons
```

### 2.3 Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.4 Project Structure

Create these directories:

```bash
mkdir -p app/login
mkdir -p app/dashboard/{users,sheets,posts,settings}
mkdir -p components/{common,auth,dashboard,user,sheet,post,ui}
mkdir -p context
mkdir -p lib
mkdir -p hooks
mkdir -p styles
```

### 2.5 Copy Component Files

Copy all the JSX component files from this setup:
- [Backend folder]/FRONTEND_COMPONENTS_*.jsx → components/
- [Backend folder]/FRONTEND_PAGES_*.jsx → app/dashboard/

### 2.6 Start Frontend Server

```bash
npm run dev
```

✅ Frontend running on: http://localhost:3000

---

## 🔐 Authentication Flow

### Creating First Super Admin User

1. **Create MongoDB Connection**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

2. **Insert Super Admin via Database**
   ```javascript
   // Use MongoDB Compass or CLI
   db.users.insertOne({
     name: "Admin User",
     email: "admin@example.com",
     password: "hashed_password", // Use bcrypt to hash
     role: "SUPER_ADMIN",
     isActive: true
   })
   ```

   Or use this Node.js script:
   ```javascript
   // setup-admin.js
   import User from './src/models/User.js';
   import connectDB from './config/database.js';
   import dotenv from 'dotenv';

   dotenv.config();
   await connectDB();

   await User.create({
     name: 'Admin User',
     email: 'admin@example.com',
     password: 'Change@123',
     role: 'SUPER_ADMIN'
   });

   console.log('Super Admin created!');
   process.exit(0);
   ```

   Run with: `node setup-admin.js`

3. **Login with First Admin**
   - Email: `admin@example.com`
   - Password: `Change@123`

### User Creation Flow

1. Admin logs in
2. Navigate to **Users** page
3. Click **Create User**
4. Fill: Name, Email, Role
5. System generates temporary password
6. Email sent to user with credentials
7. User changes password on first login

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password
- `POST /auth/users` (Admin) - Create user
- `GET /auth/users` (Admin) - List users

#### Sheets (Websites)
- `GET /sheets?filter=all|my_sites|assigned|platform` - List sheets
- `POST /sheets` - Upload new sheet
- `PUT /sheets/:id` - Update sheet
- `DELETE /sheets/:id` - Delete sheet
- `POST /sheets/:id/make-public` (Admin) - Make platform-wide

#### Posts
- `GET /posts` - List posts
- `POST /posts` - Create post (triggers AI generation)
- `PUT /posts/:id` - Update draft/generated post
- `POST /posts/:id/publish` - Publish to selected sites
- `GET /posts/:id/history` - Get posting history

### Test with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Change@123"}'

# List sheets (use token from login response)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/sheets
```

---

## 🎨 Frontend Features

### Pages Structure

```
/login                    - Login page (public)
/dashboard                - Main dashboard
/dashboard/users          - User management (admin only)
/dashboard/sheets         - Website management
/dashboard/posts          - Posts management
/dashboard/settings       - User settings
```

### Key Components

**AuthContext.jsx**
- JWT token management
- User state
- Login/Logout functions

**ProtectedRoute.jsx**
- Route protection
- Role-based access
- Auto-redirect

**DashboardLayout.jsx**
- Navbar with theme toggle
- Sidebar navigation
- Toast notifications

**Components Provided**
- LoginForm.jsx
- CreateUserModal.jsx
- UserTable.jsx
- UploadSheetForm.jsx
- CreatePostForm.jsx
- PostCard.jsx
- Navbar.jsx
- Sidebar.jsx

---

## 🤖 AI Integration (Claude API)

### How It Works

1. **User creates post** with keywords
2. **Backend calls Claude API** with article prompt
3. **AI generates 1500-2000 word article** in background (non-blocking)
4. **SEO metadata auto-generated** (title, description, keywords)
5. **User can edit** before publishing
6. **Publish to sites** with auto-posting

### Claude Prompts Used

**Article Generation:**
- Generates SEO-optimized content
- Proper heading structure (H2, H3)
- Natural language, no keyword stuffing
- 1500-2000 words
- Engaging intro & conclusion

**SEO Metadata:**
- Meta title (60 chars max)
- Meta description (160 chars max)
- Keywords extraction

### Setting Up Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account and pay via credit card
3. Get API key from Settings
4. Add to `.env` as `CLAUDE_API_KEY`
5. Set monthly budget limits

---

## 📧 Email Service Setup

### Gmail Configuration

1. **Enable 2FA**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select: Mail & Windows Computer
   - Copy 16-char password
   - Use in `.env` as `EMAIL_PASS`

3. **Test Email**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/users \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","role":"USER"}'
   ```

### Email Templates Included

- ✉️ Welcome email with credentials
- ✉️ Password reset email
- ✉️ Post published notification

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas (not local)
- [ ] Setup production email service
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for frontend domain
- [ ] Add rate limiting
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN for images
- [ ] Backup database regularly

### Deploy Backend

**Heroku:**
```bash
npm install -g heroku
heroku login
heroku create pbn-backend-prod
git push heroku main
```

**Railway:**
1. Connect GitHub repo
2. Set environment variables
3. Deploy

**DigitalOcean App Platform:**
1. Connect GitHub
2. Configure app.yaml
3. Deploy

### Deploy Frontend

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=.next
```

---

## 🧪 Testing Workflows

### Admin Workflow
1. Login with admin credentials
2. Create new user → Email sent
3. Upload website/sheet
4. New user logs in, changes password
5. User creates post → AI generates
6. Approve & publish → Auto-posts to sites

### User Workflow
1. Receive welcome email with temporary password
2. Login to dashboard
3. View assigned sites in sidebar
4. Create new post with keywords
5. Wait for AI to generate content
6. Review and publish
7. Monitor posting results

---

## 📊 Database Models Summary

### User Schema
```javascript
{
  name, email, password (hashed),
  role: "SUPER_ADMIN" | "USER",
  isActive, lastLogin,
  assignedSheets, createdAt, updatedAt
}
```

### Sheet Schema
```javascript
{
  siteName, siteUrl, type,
  credentials: { username, password },
  visibility: "PRIVATE" | "PLATFORM",
  createdBy, assignedTo,
  metadata: { description, category }
}
```

### Post Schema
```javascript
{
  title, content, keywords,
  author, selectedSites,
  status: "DRAFT"|"GENERATING"|"GENERATED"|"POSTING"|"COMPLETED",
  postingResults: [{ site, status, postUrl, error }],
  metadata: { seoTitle, seoDescription },
  isScheduled, scheduledTime
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ Failed to connect to MongoDB
→ Verify MongoDB is running (mongod)
→ Check MONGODB_URI in .env
→ Try: mongosh to test connection
```

### Email Not Sending
```
❌ Failed to send email
→ Check EMAIL_USER and EMAIL_PASS
→ Verify Gmail app password (not regular password)
→ Enable "Less secure app" if not using app password
```

### Claude API Error
```
❌ Claude API request failed
→ Verify CLAUDE_API_KEY is correct
→ Check API usage limits
→ Ensure account has balance
```

### CORS Error
```
❌ CORS policy error
→ Check FRONTEND_URL in backend .env
→ Verify same-origin requests
→ Check browser console for details
```

### JWT Token Expired
```
❌ Token expired or invalid
→ Token lasts 7 days
→ User must login again
→ Implement token refresh (optional future enhancement)
```

---

## 📞 Support Resources

- **Anthropic Claude Docs**: https://docs.anthropic.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Guide**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Material-UI Components**: https://mui.com

---

## 📝 Project Files Structure

```
pbn-backend/                          ← Backend Server
├── .env.example
├── index.js
├── package.json
├── config/
│   └── database.js
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sheetController.js
│   │   └── postController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Sheet.js
│   │   ├── Post.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sheetRoutes.js
│   │   └── postRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── services/
│   │   └── aiService.js
│   └── utils/
│       ├── constants.js
│       ├── emailService.js
│       ├── helpers.js
│       └── jwt.js
├── BACKEND_SETUP.md
├── FRONTEND_SETUP.md
├── FRONTEND_COMPONENTS_*.jsx       ← All React component templates
└── FRONTEND_PAGES_*.jsx             ← All React page templates

pbn-frontend/                         ← Frontend App (Next.js)
├── .env.local
├── app/
│   ├── layout.js
│   ├── login/
│   ├── dashboard/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── users/page.js
│   │   ├── sheets/page.js
│   │   ├── posts/page.js
│   │   └── settings/page.js
├── components/
│   ├── common/
│   ├── auth/
│   ├── user/
│   ├── sheet/
│   ├── post/
│   └── ui/
├── context/
│   └── AuthContext.js
├── lib/
├── hooks/
├── styles/
└── package.json
```

---

## ✅ Verification Checklist

After setup, verify:

```bash
# 1. Backend starts without errors
curl http://localhost:5000/api/health
# Expected: { "status": "OK", "message": "Server is running" }

# 2. Frontend loads
# Open http://localhost:3000 in browser

# 3. Can login with admin credentials
# Email: admin@example.com, Password: (set in setup)

# 4. Can create user (admin only)
# Navigation → Users → Create User

# 5. Can upload website
# Navigation → Websites → Upload

# 6. Can create post
# Navigation → Posts → Create Post

# 7. AI generates content
# Wait 5-10 seconds after creating post

# 8. Can publish to sites
# Click "Publish Now" on generated post
```

---

## 🎓 Learning Resources

### JavaScript/Node.js
- [MDN JavaScript Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js Official Docs](https://nodejs.org/docs)

### React/Next.js
- [React Documentation](https://react.dev)
- [Next.js 14 App Router](https://nextjs.org/docs/app)

### Database
- [MongoDB Tutorial](https://docs.mongodb.com/manual)
- [Mongoose ODM](https://mongoosejs.com)

### API Design
- [RESTful API Best Practices](https://restfulapi.net)
- [API Error Handling](https://www.rfc-editor.org/rfc/rfc7231)

---

## 📄 License

MIT License - Open source and free to use

---

## 🚁 Next Steps

After basic setup:

1. **Customize branding** - Add your logo & colors
2. **Add database backups** - Setup MongoDB Atlas automated backups
3. **Implement caching** - Add Redis for performance
4. **Setup monitoring** - Use Sentry for error tracking
5. **Add analytics** - Track user engagement
6. **Scale posting** - Implement Queue system (Bull/RabbitMQ)
7. **Advanced features** - Post scheduling, retry logic, webhooks

---

**Happy building! 🎉**

For questions or issues, refer to the individual setup guides:
- Backend: `BACKEND_SETUP.md`
- Frontend: `FRONTEND_SETUP.md`
