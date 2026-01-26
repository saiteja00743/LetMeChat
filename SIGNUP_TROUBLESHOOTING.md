# 🔧 Signup Issue - Troubleshooting Guide

## Issue: "Something went wrong" Error on Signup

### ✅ What Was Fixed

1. **Added `/register` route** - Explicit registration endpoint
2. **Added password hint** - "Minimum 6 characters required" message
3. **Added minLength validation** - HTML5 validation for 6+ characters
4. **Server restarted** - All new security features are now active

---

## 🧪 How to Test Signup Now

### Step 1: Open the App
Go to: `http://localhost:5173`

### Step 2: Fill in the Form
- **Full Name**: Any name (e.g., "John Doe")
- **Email**: Valid email format (e.g., "john@example.com")
- **Password**: **At least 6 characters** (e.g., "password123")
- **Profile Picture**: Optional (you can skip this)

### Step 3: Click "Sign Up"

---

## ✅ Expected Behavior

### Success Case
```
✓ Account created successfully
→ Redirects to chat page
→ You're logged in!
```

### Error Cases

#### 1. Invalid Email Format
```
Input: "notanemail"
Error: "Please enter a valid email address"
```

#### 2. Password Too Short
```
Input: "123" (less than 6 characters)
Error: "Password must be at least 6 characters long"
```

#### 3. User Already Exists
```
Input: Email that's already registered
Error: "User already exists"
```

#### 4. Missing Fields
```
Error: "Please Enter all the Fields"
```

---

## 🔍 Debugging Steps

### If you still see "Something went wrong":

#### 1. Check Browser Console
- Press `F12` to open DevTools
- Go to **Console** tab
- Look for error messages
- Check the **Network** tab for the failed request

#### 2. Check Server Logs
Look at the terminal where `npm run dev` is running for error messages.

#### 3. Common Issues & Solutions

**Issue**: CORS Error
```
Solution: Server is configured for http://localhost:5173
Make sure you're accessing from that URL
```

**Issue**: MongoDB Connection Error
```
Solution: Make sure MongoDB is running
Check MONGO_URI in .env file
```

**Issue**: Rate Limit Error
```
Error: "Too many login attempts, please try again later"
Solution: Wait 15 minutes or restart the server
```

**Issue**: Validation Error
```
Check that:
- Email is valid format (has @ and domain)
- Password is at least 6 characters
- All fields are filled
```

---

## 🎯 Test Data Examples

### Valid Test User 1
```
Name: John Doe
Email: john@example.com
Password: password123
```

### Valid Test User 2
```
Name: Jane Smith
Email: jane@example.com
Password: securepass456
```

### Valid Test User 3
```
Name: Bob Wilson
Email: bob@test.com
Password: mypass789
```

---

## 📊 API Endpoint Details

### Registration Endpoint
```
POST http://localhost:5000/api/user
POST http://localhost:5000/api/user/register (new!)

Headers:
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "" (optional)
}

Success Response (201):
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔐 Security Features Active

When you sign up, these security checks run:

1. ✅ **Email Validation** - Checks format
2. ✅ **Password Length** - Minimum 6 characters
3. ✅ **Duplicate Check** - Email must be unique
4. ✅ **Rate Limiting** - Max 5 signups per 15 min per IP
5. ✅ **Password Hashing** - Bcrypt encryption
6. ✅ **NoSQL Injection** - Query sanitization

---

## 🆘 Still Having Issues?

### Quick Fixes

**1. Restart Everything**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**2. Clear Browser Cache**
```
Ctrl+Shift+Delete → Clear cache
Or use Incognito mode
```

**3. Check MongoDB**
```bash
# Make sure MongoDB is running
# Windows: Check Services
# Or start manually
```

**4. Verify Environment Variables**
```env
# Check .env file in root directory
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=a8f5e2c9b4d7a1f3e6c8b2d5a7f9e1c3b6d8a2f4e7c9b1d3a5f8e2c4b7d9a1f3
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📝 Testing Checklist

- [ ] Server is running (check terminal)
- [ ] Frontend is running (http://localhost:5173)
- [ ] MongoDB is running
- [ ] Browser console shows no errors
- [ ] Email is valid format
- [ ] Password is 6+ characters
- [ ] All fields are filled

---

## 🎉 After Successful Signup

You should:
1. See "Account created successfully" toast
2. Be redirected to `/chats` page
3. See your name in the header
4. Be able to search for other users
5. Start chatting!

---

## 🔄 Next Steps After Signup

1. **Search for users** - Click "Search Users" button
2. **Start a chat** - Click on a user to start chatting
3. **Update profile** - Click your avatar to update name/picture
4. **Test messaging** - Send messages in real-time

---

## 💡 Pro Tips

1. **Use different emails** for testing multiple accounts
2. **Password must be 6+ chars** - You'll see a hint now
3. **Profile picture is optional** - Can skip for faster testing
4. **Check browser console** - F12 for detailed errors
5. **Server auto-restarts** - Nodemon watches for changes

---

**Your signup should work now! Try it with a 6+ character password! 🚀**

If you still see errors, check the browser console (F12) for the specific error message.
