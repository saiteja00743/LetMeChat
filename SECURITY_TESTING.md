# Security Testing Guide

## Quick Tests for Authentication Features

### 1. Test Email Validation

**Register with invalid email:**
```bash
POST http://localhost:5000/api/user/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "notanemail",
  "password": "password123"
}
```
**Expected**: ❌ Error: "Please enter a valid email address"

---

### 2. Test Password Strength

**Register with weak password:**
```bash
POST http://localhost:5000/api/user/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123"
}
```
**Expected**: ❌ Error: "Password must be at least 6 characters long"

---

### 3. Test Account Lockout

**Step 1**: Create a test account
```bash
POST http://localhost:5000/api/user/register
Content-Type: application/json

{
  "name": "Lockout Test",
  "email": "locktest@example.com",
  "password": "correct123"
}
```

**Step 2**: Try logging in with WRONG password 5 times
```bash
POST http://localhost:5000/api/user/login
Content-Type: application/json

{
  "email": "locktest@example.com",
  "password": "wrongpassword"
}
```

**Expected Results**:
- Attempt 1: ❌ "Invalid Email or Password. 4 attempts remaining"
- Attempt 2: ❌ "Invalid Email or Password. 3 attempts remaining"
- Attempt 3: ❌ "Invalid Email or Password. 2 attempts remaining"
- Attempt 4: ❌ "Invalid Email or Password. 1 attempts remaining"
- Attempt 5: 🔒 "Too many failed login attempts. Account locked for 2 hours"

**Step 3**: Try logging in with CORRECT password
```bash
POST http://localhost:5000/api/user/login
Content-Type: application/json

{
  "email": "locktest@example.com",
  "password": "correct123"
}
```
**Expected**: 🔒 "Account is locked. Try again in 120 minutes"

---

### 4. Test Rate Limiting

**Make 6 login requests within 15 minutes:**
```bash
# Request 1-5: Should work
POST http://localhost:5000/api/user/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# Request 6: Should be blocked
```
**Expected on 6th request**: ⏱️ "Too many login attempts, please try again later"

---

### 5. Test Successful Login Flow

**Step 1**: Register a new user
```bash
POST http://localhost:5000/api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Expected**: ✅ Returns user object with JWT token
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 2**: Login with correct credentials
```bash
POST http://localhost:5000/api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Expected**: ✅ Returns user object with JWT token

---

### 6. Test Protected Routes

**Without Token:**
```bash
GET http://localhost:5000/api/chat
```
**Expected**: ❌ "Not authorized, no token"

**With Valid Token:**
```bash
GET http://localhost:5000/api/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Expected**: ✅ Returns chat data

---

## Using the Frontend

### Test Account Lockout via UI

1. Go to login page
2. Enter a valid email
3. Enter wrong password 5 times
4. On 5th attempt, you should see: "Too many failed login attempts. Account locked for 2 hours"
5. Try logging in with correct password - should still be locked

### Test Email Validation via UI

1. Go to signup page
2. Enter name: "Test User"
3. Enter email: "notanemail" (invalid format)
4. Enter password: "password123"
5. Click Register
6. Should see error: "Please enter a valid email address"

### Test Password Strength via UI

1. Go to signup page
2. Enter name: "Test User"
3. Enter email: "test@example.com"
4. Enter password: "123" (too short)
5. Click Register
6. Should see error: "Password must be at least 6 characters long"

---

## Browser DevTools Testing

### Check Security Headers

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make any request to the API
4. Check Response Headers - should see:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 0`
   - `Strict-Transport-Security` (in production with HTTPS)

---

## Monitoring

### Check Failed Login Attempts in MongoDB

```javascript
// Connect to MongoDB
use chat-app

// Find users with failed login attempts
db.users.find({ loginAttempts: { $gt: 0 } })

// Find locked accounts
db.users.find({ lockUntil: { $exists: true } })

// Reset a locked account manually (for testing)
db.users.updateOne(
  { email: "locktest@example.com" },
  { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
)
```

---

## Expected Behavior Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Email Validation | ✅ | Rejects invalid email formats |
| Password Strength | ✅ | Requires minimum 6 characters |
| Account Lockout | ✅ | Locks after 5 failed attempts for 2 hours |
| Rate Limiting | ✅ | Max 5 auth requests per 15 min per IP |
| JWT Tokens | ✅ | 30-day expiration, secure secret |
| Password Hashing | ✅ | Bcrypt with salt rounds |
| NoSQL Injection | ✅ | Sanitizes all inputs |
| Security Headers | ✅ | Helmet.js protection |
| CORS | ✅ | Restricted to client URL |

---

## Troubleshooting

### "Account is locked" but I need to unlock it

**Option 1**: Wait 2 hours for automatic unlock

**Option 2**: Manually reset in MongoDB:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
)
```

### Rate limit blocking legitimate requests

Wait 15 minutes or restart the server (rate limits are in-memory)

### Can't test because of existing account

Use different email addresses or delete test accounts from MongoDB:
```javascript
db.users.deleteOne({ email: "test@example.com" })
```

---

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a new random value
- [ ] Set CLIENT_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up monitoring/logging
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement backup strategy
- [ ] Set up error tracking (Sentry, etc.)

---

**Happy Testing! 🔒**
