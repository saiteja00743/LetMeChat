# Authentication & Security Features

## Overview
This chat application now implements **production-grade authentication and security** measures to protect user data and prevent common attacks.

## Security Features Implemented

### 1. **Password Security**
- ✅ **Bcrypt Hashing**: Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ **Minimum Length**: Passwords must be at least 6 characters
- ✅ **Never Stored in Plain Text**: Original passwords are never saved

### 2. **Account Lockout Protection**
- ✅ **Failed Login Tracking**: System tracks failed login attempts
- ✅ **Auto-Lock**: Account locks after **5 failed attempts**
- ✅ **Lock Duration**: **2 hours** automatic lockout
- ✅ **Auto-Unlock**: Account automatically unlocks after lockout period
- ✅ **Attempt Counter**: Users see remaining attempts before lockout

### 3. **JWT Token Authentication**
- ✅ **Secure Token Generation**: Cryptographically secure JWT tokens
- ✅ **Token Expiration**: Tokens expire after **30 days**
- ✅ **Strong Secret**: 64-character random JWT secret
- ✅ **Bearer Token**: Tokens sent via Authorization header

### 4. **Rate Limiting**
- ✅ **General API**: 100 requests per 15 minutes per IP
- ✅ **Auth Endpoints**: 5 login/register attempts per 15 minutes per IP
- ✅ **Brute Force Prevention**: Automatic blocking of excessive requests

### 5. **Input Validation**
- ✅ **Email Validation**: Validates proper email format
- ✅ **Required Fields**: Enforces all required fields
- ✅ **Email Normalization**: Converts emails to lowercase
- ✅ **NoSQL Injection Protection**: Sanitizes MongoDB queries

### 6. **HTTP Security Headers**
- ✅ **Helmet.js**: Sets secure HTTP headers
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Strict-Transport-Security
  - And more...

### 7. **CORS Configuration**
- ✅ **Restricted Origins**: Only allows specified client URLs
- ✅ **Credentials Support**: Enables cookies/auth headers
- ✅ **Production Ready**: Configurable via environment variables

### 8. **Data Protection**
- ✅ **Password Exclusion**: Passwords never returned in API responses
- ✅ **Sanitization**: Prevents NoSQL injection attacks
- ✅ **Secure Storage**: Sensitive data properly encrypted

## How It Works

### Registration Flow
1. User submits name, email, and password
2. System validates email format
3. System checks password length (min 6 chars)
4. Email is normalized to lowercase
5. System checks if user already exists
6. Password is hashed with bcrypt
7. User is created in database
8. JWT token is generated and returned

### Login Flow
1. User submits email and password
2. System finds user by email
3. **Account Lock Check**: If locked, returns remaining lock time
4. **Password Verification**: Compares hashed password
5. **Failed Attempt**: 
   - Increments login attempt counter
   - Locks account if 5 attempts reached
   - Shows remaining attempts
6. **Successful Login**:
   - Resets login attempt counter
   - Generates new JWT token
   - Returns user data

### Protected Routes
All chat and message routes require valid JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=<64-character-random-string>
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

⚠️ **IMPORTANT**: In production:
- Use a different, randomly generated JWT_SECRET
- Set CLIENT_URL to your production domain
- Set NODE_ENV=production
- Use HTTPS only
- Consider using environment-specific secrets

## API Error Responses

### Account Locked (423)
```json
{
  "message": "Account is locked. Try again in 45 minutes"
}
```

### Failed Login (401)
```json
{
  "message": "Invalid Email or Password. 3 attempts remaining"
}
```

### Too Many Requests (429)
```json
{
  "message": "Too many login attempts, please try again later"
}
```

### Invalid Email (400)
```json
{
  "message": "Please enter a valid email address"
}
```

### Weak Password (400)
```json
{
  "message": "Password must be at least 6 characters long"
}
```

## Security Best Practices

### For Developers
1. ✅ Never commit `.env` file to git
2. ✅ Use different secrets for dev/staging/production
3. ✅ Regularly rotate JWT secrets
4. ✅ Monitor failed login attempts
5. ✅ Keep dependencies updated
6. ✅ Use HTTPS in production
7. ✅ Implement logging for security events

### For Users
1. Use strong, unique passwords
2. Don't share your account credentials
3. Log out when done
4. Report suspicious activity

## Testing the Security Features

### Test Account Lockout
```bash
# Try logging in with wrong password 5 times
# Account should lock for 2 hours
```

### Test Rate Limiting
```bash
# Make 6 login requests within 15 minutes
# 6th request should be blocked
```

### Test Email Validation
```bash
# Try registering with invalid email
# Should return validation error
```

## Future Enhancements

Consider adding:
- [ ] Two-Factor Authentication (2FA)
- [ ] Email verification on signup
- [ ] Password reset via email
- [ ] Session management
- [ ] IP-based geolocation blocking
- [ ] Security audit logging
- [ ] OAuth integration (Google, GitHub)
- [ ] Refresh token rotation

## Dependencies

```json
{
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT token generation",
  "helmet": "Security headers",
  "express-rate-limit": "Rate limiting",
  "express-mongo-sanitize": "NoSQL injection prevention",
  "validator": "Input validation",
  "cors": "Cross-origin resource sharing"
}
```

## Compliance

This implementation follows:
- ✅ OWASP Top 10 security guidelines
- ✅ Industry-standard authentication practices
- ✅ Secure password storage (bcrypt)
- ✅ Token-based authentication (JWT)
- ✅ Rate limiting best practices

---

**Note**: This is a solid foundation for authentication. For production apps handling sensitive data, consider additional measures like:
- Professional security audit
- Penetration testing
- DDoS protection (Cloudflare)
- Database encryption at rest
- Regular security updates
