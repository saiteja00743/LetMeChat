# 🚀 File Upload Setup Guide

## ⚠️ **Current Status**

Your chat app has **all file upload features implemented**, but file uploads won't work until you add Cloudinary credentials.

---

## 📋 **Quick Setup (5 Minutes)**

### **Step 1: Get Cloudinary Credentials**

#### **Option A: Use Existing Account**
1. Go to: https://cloudinary.com/console
2. Login
3. Copy from Dashboard:
   - **Cloud Name**: `dw7vpxv8o` ✅ (already set)
   - **API Key**: (16-digit number)
   - **API Secret**: (27-character string)

#### **Option B: Create Free Account**
1. Go to: https://cloudinary.com/users/register/free
2. Sign up (FREE - no credit card required)
3. Verify email
4. Copy credentials from Dashboard

---

### **Step 2: Update .env File**

Open: `d:\Saiteja\projects\chat-app\.env`

**Current content:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=a8f5e2c9b4d7a1f3e6c8b2d5a7f9e1c3b6d8a2f4e7c9b1d3a5f8e2c4b7d9a1f3
NODE_ENV=development
CLIENT_URL=http://10.75.221.145:5173
CLOUDINARY_CLOUD_NAME=dw7vpxv8o
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Update these lines:**
```env
CLOUDINARY_API_KEY=123456789012345          ← Replace with your API Key
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUv ← Replace with your API Secret
```

---

### **Step 3: Restart Server**

After updating .env:

1. **Stop the server**: Press `Ctrl+C` in terminal
2. **Restart**: Run `npm run dev`
3. **Wait** for "MongoDB Connected" message

---

### **Step 4: Test File Upload**

1. **Refresh browser** (F5)
2. **Open a chat**
3. **Click 📎 (Paperclip)** button
4. **Select a file** (image, video, document)
5. **Click Send**
6. **File should upload!** ✅

---

## 🎯 **What Works Now**

### ✅ **Implemented Features**

1. **😊 Emoji Picker**
   - 1000+ emojis
   - Search function
   - Dark theme

2. **🎬 GIF Picker**
   - Giphy integration
   - Search GIFs
   - Trending GIFs

3. **📎 File Attachments** (needs credentials)
   - Images (JPG, PNG, GIF, WebP)
   - Videos (MP4, WebM, MOV)
   - Audio (MP3, WAV, OGG)
   - Documents (PDF, DOC, DOCX, TXT)
   - Max size: 10MB

---

## 🔧 **Technical Details**

### **File Upload Flow**

```
User selects file
    ↓
Frontend validates (type, size)
    ↓
Shows preview
    ↓
User clicks Send
    ↓
File sent to backend /api/upload
    ↓
Backend uploads to Cloudinary
    ↓
Cloudinary returns URL
    ↓
Message saved with attachment URL
    ↓
Socket.IO broadcasts to chat
    ↓
File displays in chat
```

### **Backend Endpoint**

```javascript
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: (binary file data)

Response:
{
  url: "https://res.cloudinary.com/...",
  filename: "document.pdf",
  size: 1024000,
  type: "application/pdf"
}
```

### **Message Schema**

```javascript
{
  sender: ObjectId,
  content: "Optional caption",
  chat: ObjectId,
  attachmentType: "image|video|audio|document|other",
  attachmentUrl: "https://...",
  attachmentName: "filename.jpg",
  attachmentSize: 1024000,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 **Supported File Types**

| Type | Extensions | Max Size | Display |
|------|-----------|----------|---------|
| Images | JPG, PNG, GIF, WebP | 10MB | Inline preview |
| Videos | MP4, WebM, MOV | 10MB | Video player |
| Audio | MP3, WAV, OGG | 10MB | Audio player |
| Documents | PDF, DOC, DOCX, TXT | 10MB | Download link |

---

## 🐛 **Troubleshooting**

### **Error: "Failed to send file"**

**Cause**: Missing Cloudinary credentials

**Fix**:
1. Add API Key and Secret to .env
2. Restart server
3. Try again

---

### **Error: "File too large"**

**Cause**: File exceeds 10MB limit

**Fix**:
1. Compress the file
2. Use a smaller file
3. Or increase limit in `uploadRoutes.js`:
   ```javascript
   limits: {
       fileSize: 20 * 1024 * 1024, // 20MB
   }
   ```

---

### **Error: "Invalid file type"**

**Cause**: File type not supported

**Fix**:
1. Convert to supported format
2. Or add format in `uploadRoutes.js`:
   ```javascript
   allowed_formats: [..., "your_format"]
   ```

---

## 🔐 **Security Notes**

### **Environment Variables**
- ✅ Never commit .env to Git
- ✅ Use different credentials for production
- ✅ Rotate secrets regularly

### **File Validation**
- ✅ Type checking (frontend + backend)
- ✅ Size limits (10MB default)
- ✅ Extension validation
- ✅ No executable files

### **Cloudinary Security**
- ✅ Secure HTTPS uploads
- ✅ Private API credentials
- ✅ Folder organization
- ✅ Access control

---

## 📱 **Usage Examples**

### **Send an Image**
```
1. Click 📎
2. Select photo.jpg
3. See preview
4. Type "Check this out!"
5. Send
→ Image displays inline
```

### **Send a Document**
```
1. Click 📎
2. Select resume.pdf
3. See file info
4. Optional caption
5. Send
→ Download link appears
```

### **Send a Video**
```
1. Click 📎
2. Select video.mp4
3. Wait for upload
4. Send
→ Video player in chat
```

---

## 🎨 **UI Features**

### **File Preview**
- Image thumbnails
- File name
- File size
- Cancel button

### **Upload Progress**
- Loading spinner
- Disabled send button
- Status messages

### **File Display**
- Type-specific rendering
- Click to enlarge (images)
- Play controls (video/audio)
- Download button (documents)

---

## 🚀 **Next Steps**

1. ✅ **Add Cloudinary credentials** to .env
2. ✅ **Restart server**
3. ✅ **Test file upload**
4. ✅ **Enjoy full-featured chat!**

---

## 📚 **Related Documentation**

- [FILE_ATTACHMENT_GUIDE.md](./FILE_ATTACHMENT_GUIDE.md) - Complete feature guide
- [EMOJI_GIF_GUIDE.md](./EMOJI_GIF_GUIDE.md) - Emoji & GIF guide
- [Cloudinary Docs](https://cloudinary.com/documentation) - Official docs

---

## 💡 **Pro Tips**

1. **Compress images** before uploading
2. **Use descriptive captions** for context
3. **Preview before sending** to verify
4. **Keep files under 5MB** for faster uploads
5. **Use PDFs** for documents when possible

---

## 🎉 **Feature Summary**

Your chat app now has:

✅ **Text Messages** - Rich text with emojis  
✅ **Emojis** - 1000+ to choose from  
✅ **GIFs** - Search millions of GIFs  
✅ **Images** - Inline photo sharing  
✅ **Videos** - Video playback  
✅ **Audio** - Audio messages  
✅ **Documents** - File sharing  
✅ **Real-time** - Instant delivery  
✅ **Edit/Delete** - Message management  
✅ **Typing Indicators** - See when typing  
✅ **Read Receipts** - Message status  

---

**Once you add Cloudinary credentials, your chat app will be fully functional! 🎉**

Need help? Check the troubleshooting section above or the detailed guides.
