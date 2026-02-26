# VisionBite - Quick Start Guide

## Project Overview

VisionBite is a complete full-stack authentication system with role-based access control (RBAC) and admin approval workflow.

**Stack:**
- **Backend:** Node.js + Express + MongoDB + JWT + bcrypt
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router

## Quick Start (5 minutes)

### Prerequisites
- Node.js v16+
- MongoDB running locally or MongoDB Atlas account
- npm or yarn

### Step 1: Backend Setup

```bash
cd backend
npm install
```

**Edit `.env` file:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/visionbite
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRE=1d
```

**Run backend:**
```bash
npm run dev
```

✅ Backend running on http://localhost:5000

---

### Step 2: Frontend Setup

```bash
cd frontend
npm install
```

**Verify `.env` file:**
```
VITE_API_URL=http://localhost:5000
```

**Run frontend:**
```bash
npm run dev
```

✅ Frontend running on http://localhost:3000

---

### Step 3: Create Admin User

Option A - Using MongoDB Shell:
```bash
mongosh
use visionbite
db.users.insertOne({
  name: "Admin",
  email: "admin@test.com",
  password: "$2a$10$YjI.CsmW6b24G.0sR8e.suA5FWzagGipW6NzMh9G7nZrXfkJSDc3m",
  role: "admin",
  isApproved: true,
  createdAt: new Date()
})
```

**Login credentials:** 
- Email: `admin@test.com`
- Password: `admin123`

---

### Step 4: Test the Application

1. **Open http://localhost:3000**
2. **Register as Staff:** Click "Register" → Fill form → See approval message
3. **Login as Admin:** Click "Login" → Use admin@test.com / admin123
4. **Approve Staff:** In dashboard → Approve the pending user
5. **Staff Login:** Now staff member can login

---

## File Structure at a Glance

**Backend:**
```
backend/
├── server.js              ← Main entry
├── config/database.js     ← MongoDB connection
├── models/User.js         ← User schema
├── controllers/           ← Business logic
├── middleware/auth.js     ← JWT validation
├── routes/auth.js         ← Auth endpoints
└── routes/admin.js        ← Admin endpoints
```

**Frontend:**
```
frontend/
├── src/
│   ├── App.tsx            ← Main app
│   ├── context/AuthContext.tsx  ← Auth state
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/api.ts    ← API calls
│   └── components/ProtectedRoutes.tsx
```

---

## Key Features

| Feature | Staff | Admin |
|---------|-------|-------|
| Register | ✅ | ❌ |
| Pending Approval | ✅ | ❌ |
| Login | ✅ (After approval) | ✅ |
| View Dashboard | ✅ | ✅ |
| Approve Users | ❌ | ✅ |
| Reject Users | ❌ | ✅ |

---

## API Endpoints

### Auth Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Staff registration |
| POST | `/api/auth/login` | Login (staff/admin) |
| GET | `/api/auth/me` | Get current user |

### Admin Routes (Protected)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/pending-users` | View pending staff |
| PUT | `/api/admin/approve/:id` | Approve staff |
| PUT | `/api/admin/reject/:id` | Reject staff |
| GET | `/api/admin/approved-staff` | View approved staff |

---

## Common Issues & Solutions

**MongoDB Connection Refused:**
```bash
# Start MongoDB
mongod
```

**Port 5000 Already In Use:**
```bash
# Change PORT in backend/.env to another port (e.g., 5001)
PORT=5001
# Then update frontend/.env
VITE_API_URL=http://localhost:5001
```

**CORS Error:**
- Backend CORS is already configured
- Verify `VITE_API_URL` in frontend `.env` matches backend URL

**Can't Login After Approval:**
- Clear browser cache: DevTools → Application → Clear storage
- Re-login

---

## Production Deployment

### Backend (Heroku/Railway Example)
```bash
# 1. Update .env with production MongoDB URI
# 2. Deploy: git push heroku main
```

### Frontend (Vercel Example)
```bash
# 1. Update .env with production API URL
# 2. Deploy: npm run build → Upload to Vercel
```

---

## Next Steps

1. ✅ Run the system locally and test
2. ✅ Customize UI colors in Tailwind config
3. ✅ Add email notifications for approvals
4. ✅ Implement password reset
5. ✅ Add more user roles
6. ✅ Deploy to production

---

## Support

Check individual file comments for detailed documentation. All code is well-commented and follows best practices.

**Key Files with Comments:**
- [backend/server.js](/backend/server.js)
- [backend/controllers/authController.js](/backend/controllers/authController.js)
- [frontend/src/context/AuthContext.tsx](/frontend/src/context/AuthContext.tsx)
- [frontend/src/pages/DashboardPage.tsx](/frontend/src/pages/DashboardPage.tsx)
