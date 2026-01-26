# Letme - MERN Stack Real-Time Chat App

A premium, production-ready real-time chat application with a WhatsApp-inspired UI, Socket.IO integration, and **enterprise-grade security**.

## ✨ Features

### Core Features
- **Real-time Messaging**: Instant delivery using Socket.IO
- **Secure Auth**: JWT-based authentication with bcrypt hashing
- **Dynamic Search**: Find and chat with users globally
- **Typing Indicators**: Real-time status updates
- **Message Management**: Edit and delete messages in real-time
- **Responsive Design**: Flawless experience on mobile and desktop
- **Rich UI**: Glassmorphism, framer-motion animations, and Tailwind CSS

### 🔒 Security Features (NEW!)
- **Account Lockout**: Automatic 2-hour lock after 5 failed login attempts
- **Rate Limiting**: Prevents brute force attacks (5 auth requests per 15 min)
- **Email Validation**: Validates proper email format
- **Password Strength**: Enforces minimum password requirements
- **NoSQL Injection Protection**: Sanitizes all database queries
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS Protection**: Restricted to authorized origins only
- **Strong JWT Secrets**: Cryptographically secure token generation
- **Login Attempt Tracking**: Real-time feedback on remaining attempts

## 🛠️ Setup Instructions

### 1. Database Setup
- Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Update the `MONGO_URI` in `.env`

### 2. Installation
Run the following command in the root directory:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=a8f5e2c9b4d7a1f3e6c8b2d5a7f9e1c3b6d8a2f4e7c9b1d3a5f8e2c4b7d9a1f3
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

⚠️ **IMPORTANT**: Generate your own JWT_SECRET for production!

### 4. Running the App
From the root directory:
```bash
npm run dev
```
- Backend starts on: `http://localhost:5000`
- Frontend starts on: `http://localhost:5173`

## 🔐 Security Documentation

For detailed security information:
- **[SECURITY.md](./SECURITY.md)** - Complete security features documentation
- **[SECURITY_TESTING.md](./SECURITY_TESTING.md)** - Testing guide for all security features

### Quick Security Test
Try logging in with wrong password 5 times to see account lockout in action!

## 📦 Deployment

### Backend (Render/Railway/Heroku)
- Connect your GitHub repo
- Set environment variables on the platform
- Build command: `npm install`
- Start command: `node server/index.js`

**Required Environment Variables:**
- `MONGO_URI`
- `JWT_SECRET` (generate a new one!)
- `NODE_ENV=production`
- `CLIENT_URL` (your frontend URL)

### Frontend (Vercel/Netlify)
- Change `baseURL` in `client/src/utils/api.js` to your production backend URL
- Change `ENDPOINT` in `client/src/components/ChatBox.jsx` to your production backend URL
- Build command: `npm run build`
- Output directory: `dist`

## 🔒 Security Best Practices

### Implemented ✅
- ✅ CORS configured for specific origins
- ✅ All routes protected by JWT middleware
- ✅ Input validation on client and server
- ✅ Rate limiting on authentication endpoints
- ✅ Account lockout after failed attempts
- ✅ Password hashing with bcrypt
- ✅ NoSQL injection prevention
- ✅ Security HTTP headers (Helmet.js)
- ✅ Email format validation
- ✅ Password strength requirements

### For Production 🚀
- [ ] Use HTTPS only
- [ ] Generate new JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Set up monitoring/logging
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement rate limiting at CDN level
- [ ] Add DDoS protection (Cloudflare)

## 📚 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT + Bcrypt
- Helmet.js
- Express Rate Limit
- Validator.js

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- React Hot Toast

## 🧪 Testing

See [SECURITY_TESTING.md](./SECURITY_TESTING.md) for comprehensive testing instructions.

## 📝 License

MIT

---

**Built with ❤️ and 🔒 Security in mind**
