# Architecture & Design Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            React Frontend (Vite)                    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • HomePage                                          │    │
│  │ • LoginPage        ↕ (HTTP Requests)               │    │
│  │ • RegisterPage     ↕ (axios with JWT)              │    │
│  │ • DashboardPage                                     │    │
│  │                                                      │    │
│  │ ┌──────────────────────────────────────────────┐   │    │
│  │ │ AuthContext (Global State)                   │   │    │
│  │ │ • user, token, role, isAdmin                 │   │    │
│  │ │ • login(), register(), logout()              │   │    │
│  │ └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓ (API Calls)                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐      ┌──────────────────────────┐   │
│  │  Routes            │      │  Middleware              │   │
│  ├────────────────────┤      ├──────────────────────────┤   │
│  │ POST /register     │─────→│ authMiddleware           │   │
│  │ POST /login        │─────→│ (JWT verification)      │   │
│  │ GET /auth/me       │─────→│                          │   │
│  │ GET /pending-users │─────→│ adminMiddleware          │   │
│  │ PUT /approve/:id   │─────→│ (role check)             │   │
│  │ PUT /reject/:id    │      │                          │   │
│  │ GET /approved      │      │                          │   │
│  └────────────────────┘      └──────────────────────────┘   │
│           ↓                              ↓                    │
│  ┌────────────────────┐      ┌──────────────────────────┐   │
│  │  Controllers       │      │  Controllers             │   │
│  ├────────────────────┤      ├──────────────────────────┤   │
│  │ authController     │      │ adminController          │   │
│  │ • register()       │      │ • getPendingUsers()      │   │
│  │ • login()          │      │ • approveUser()          │   │
│  │ • getCurrentUser() │      │ • rejectUser()           │   │
│  │                    │      │ • getApprovedStaff()     │   │
│  └────────────────────┘      └──────────────────────────┘   │
│           ↓                              ↓                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           User Model (Mongoose)                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • Pre-save hook: Hash password with bcrypt         │    │
│  │ • Methods: matchPassword()                          │    │
│  │ • Fields: name, email, password, role, isApproved  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collection: users                                            │
│  • { name, email, password, role, isApproved, createdAt }   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Registration Flow

```
User Fills Form
     ↓
[Frontend] Form Submit
     ↓
POST /api/auth/register { name, email, password, confirmPassword }
     ↓
[Backend] authController.register()
     ├─ Validate input
     ├─ Check if email exists
     ├─ Hash password (bcrypt)
     ├─ Create user with role="staff", isApproved=false
     └─ Return {"message": "Awaiting approval", user{...}}
     ↓
[Frontend] Show success message
     ↓
Auto-redirect to login after 3 seconds
```

---

### Login Flow (Staff Not Approved)

```
User Enters Credentials
     ↓
[Frontend] POST /api/auth/login { email, password }
     ↓
[Backend] authController.login()
     ├─ Find user by email
     ├─ Compare password with bcrypt
     ├─ Check: if (role === 'staff' && !isApproved)
     │   └─ Return: { message: "Pending approval" } [403]
     └─ [if approved] Generate JWT
     ↓
[Frontend] Display error: "Pending admin approval"
```

---

### Login Flow (Admin or Approved Staff)

```
User Enters Credentials
     ↓
[Frontend] POST /api/auth/login { email, password }
     ↓
[Backend] authController.login()
     ├─ Find user by email
     ├─ Compare password with bcrypt
     ├─ Check: role === 'admin' OR (role === 'staff' AND isApproved)
     ├─ Generate JWT: jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' })
     └─ Return: { token, user{...} }
     ↓
[Frontend] 
     ├─ Save token to localStorage
     ├─ Save user to localStorage
     ├─ Update AuthContext state
     └─ Redirect to /dashboard
```

---

### Admin Approval Flow

```
[Admin Dashboard]
     ↓
GET /api/admin/pending-users
     ↓
[Backend] 
     ├─ Verify JWT token
     ├─ Check role === 'admin' (adminMiddleware)
     ├─ Query users: { role: 'staff', isApproved: false }
     └─ Return: { count, users[...] }
     ↓
[Frontend] Display table of pending users
     ↓
Admin Clicks "Approve" Button
     ↓
PUT /api/admin/approve/:userId
     ↓
[Backend]
     ├─ Verify JWT & admin role
     ├─ Find user
     ├─ Set isApproved = true
     ├─ Save to DB
     └─ Return: { message: "Approved", user{...} }
     ↓
[Frontend]
     ├─ Remove user from pending list
     ├─ Show success message
     └─ Auto-refresh pending users list
```

---

## Authentication & Security

### Password Security
```
User enters password: "myPassword123"
         ↓
[Frontend] SHA-1 hash in form validation (optional)
         ↓
POST to backend (HTTPS in production)
         ↓
[Backend] Received: { password: "myPassword123" }
         ↓
Mongoose Pre-save Hook:
  1. Check if password modified
  2. Generate salt: bcrypt.genSalt(10)
  3. Hash: bcrypt.hash(password, salt)
  4. Store hashed version in DB
         ↓
DB: { password: "$2a$10$Y9f4..." }
```

### JWT Token Flow
```
Login Successful
         ↓
Generate JWT:
  Header: { alg: "HS256", typ: "JWT" }
  Payload: { id: "user_id", role: "admin", iat: ..., exp: ... }
  Signature: HMAC-SHA256(header.payload, JWT_SECRET)
         ↓
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNjQ..."
         ↓
[Frontend] localStorage.setItem('token', token)
         ↓
Each API Request:
  headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
         ↓
[Backend] Middleware:
  1. Extract token from Authorization header
  2. Verify signature with JWT_SECRET
  3. Check expiration (1 day)
  4. If valid: req.user = decoded payload
  5. If invalid: return 401 Unauthorized
```

---

## State Management

### AuthContext Structure

```typescript
interface AuthContextType {
  user: User | null              // Current user data
  token: string | null           // JWT token
  role: 'admin' | 'staff' | null // User role
  isAuthenticated: boolean       // Login status
  isAdmin: boolean               // Quick admin check
  login: (email, password) => Promise<void>
  register: (name, email, password, confirmPassword) => Promise<void>
  logout: () => void
}

// Persistent Storage: localStorage
{
  'token': 'eyJhbGciOiJIUzI1NiIs...'
  'user': '{"id":"...", "name":"...", "role":"admin", ...}'
}
```

### Context Operations

```
App Mount
  └─ useEffect: Check localStorage for token
       ├─ If found: setToken() + setUser() + setIsAuthenticated(true)
       └─ If not: Stay logged out

User Logs In
  └─ login(email, password)
       ├─ API call to POST /api/auth/login
       ├─ Receive: { token, user }
       ├─ setToken(token)
       ├─ setUser(user)
       ├─ localStorage.setItem('token', token)
       ├─ localStorage.setItem('user', JSON.stringify(user))
       └─ Navigate to /dashboard

User Logs Out
  └─ logout()
       ├─ setUser(null)
       ├─ setToken(null)
       ├─ setIsAuthenticated(false)
       ├─ localStorage.removeItem('token')
       ├─ localStorage.removeItem('user')
       └─ Navigate to /login
```

---

## Route Protection

### Frontend Routes

```
<Routes>
  <Route path="/" element={<HomePage />} />           [Public]
  <Route path="/login" element={<LoginPage />} />     [Public]
  <Route path="/register" element={<RegisterPage />} />[Public]
  
  <Route path="/dashboard" element={
    <PrivateRoute>                                    [Requires login]
      <DashboardPage />
    </PrivateRoute>
  } />
</Routes>

PrivateRoute Component:
  if (!isAuthenticated) redirect to /login
  else render dashboard

AdminRoute Component (for future use):
  if (!isAuthenticated) redirect to /login
  if (role !== 'admin') redirect to /dashboard
  else render admin panel
```

### Backend Route Protection

```
// Public Routes
POST /api/auth/register
POST /api/auth/login

// Protected Routes
GET /api/auth/me              ← authMiddleware
PUT /api/admin/approve/:id    ← authMiddleware + adminMiddleware
PUT /api/admin/reject/:id     ← authMiddleware + adminMiddleware
GET /api/admin/pending-users  ← authMiddleware + adminMiddleware
GET /api/admin/approved-staff ← authMiddleware + adminMiddleware

Middleware Chain:
  authMiddleware:
    1. Extract token from Authorization header
    2. Verify JWT
    3. Set req.user = decoded payload
    4. Call next()
    5. On error: return 401 Unauthorized

adminMiddleware:
    1. Check req.user.role === 'admin'
    2. If yes: Call next()
    3. If no: return 403 Forbidden
```

---

## Database Design

### User Collection Schema

```javascript
{
  _id: ObjectId,
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // Validates: user@example.com format
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // Never return password in queries
  },
  
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  
  isApproved: {
    type: Boolean,
    default: false
    // For staff: must be true to login
    // For admin: always true
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes for Performance
```javascript
// Ensure fast email lookups
db.users.createIndex({ email: 1 }, { unique: true })

// Query pending staff efficiently
db.users.createIndex({ role: 1, isApproved: 1 })
```

---

## Error Handling

### Frontend Error Flow

```
API Call
  ↓
axios request interceptor adds Authorization header
  ↓
Response received
  ↓
If status 2xx: return data
If status 4xx/5xx: catch block
  ├─ Extract error.response.data.message
  ├─ Display to user in UI
  └─ Don't expose sensitive info
```

### Backend Error Responses

```json
// 400 Bad Request - Validation Error
{
  "message": "Email already registered"
}

// 401 Unauthorized - Invalid credentials
{
  "message": "Invalid credentials"
}

// 403 Forbidden - Not approved
{
  "message": "Your account is pending admin approval."
}

// 403 Forbidden - Not admin
{
  "message": "Admin access required"
}

// 500 Server Error
{
  "message": "Server error during registration"
}
```

---

## Environment & Configuration

### Backend Environment
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/visionbite
JWT_SECRET=super_secret_key
JWT_EXPIRE=1d
```

### Frontend Environment
```
VITE_API_URL=http://localhost:5000
```

### Environment-Specific Settings
```
Development:
  JWT_SECRET: any string (change per machine)
  MONGO_URI: local or test DB
  VITE_API_URL: http://localhost:5000

Production:
  JWT_SECRET: secure random string (use .env)
  MONGO_URI: MongoDB Atlas connection string
  VITE_API_URL: https://api.yourdomain.com
  JWT_EXPIRE: Keep at 1d or adjust to your needs
```

---

## Performance Considerations

1. **JWT over Sessions**: Stateless auth, scalable
2. **Bcrypt Hashing**: 10 salt rounds (balance security vs speed)
3. **Password Never Selected**: Uses `select: false` in schema
4. **Token Expiration**: 1 day prevents long-term token theft
5. **Index on Email/Role**: Fast database queries
6. **Conditional Rendering**: Only render admin UI for admins

---

## Security Best Practices Implemented

✅ Password hashing with bcrypt
✅ JWT token expiration
✅ CORS enabled (configure in production)
✅ Role-based access control
✅ Admin middleware verification
✅ No password in API responses
✅ Proper HTTP status codes
✅ Input validation
✅ Protected admin routes
✅ Token stored in localStorage (consider httpOnly cookies for production)

---

## Future Architecture Improvements

1. **Refresh Tokens**: Implement separate refresh token logic
2. **HttpOnly Cookies**: Store JWT in httpOnly cookies instead of localStorage
3. **Rate Limiting**: Prevent brute force attacks
4. **Login Logging**: Track login attempts and IP addresses
5. **Email Notifications**: Alert users of approval/rejection
6. **Two-Factor Authentication**: Add 2FA for admin accounts
7. **Audit Logs**: Track all admin actions
8. **Caching**: Cache pending users list with Redis
