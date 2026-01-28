# Deployment Guide to Make Your App Accessible Anywhere

Currently, your app connects to your laptop (`10.75.221.145`). If your laptop is off or you are on a different network (like 4G/5G), the app **cannot work**.

To make it work anywhere (on any phone, even when your PC is off), you must move your server and database to the **Cloud**.

## Phase 1: Move Database to Cloud (MongoDB Atlas)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.
2.  Create a strict **Free Tier Cluster**.
3.  In "Database Access", create a database user (e.g., `admin`) and password.
4.  In "Network Access", add `0.0.0.0/0` (Allow Access from Anywhere).
5.  Click **Connect** > **Drivers** > Copy the connection string.
    *   It looks like: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your real password.

## Phase 2: Host Your Server (Railway or Render)

We will use **Render** (it has a free tier) or **Railway** (easier but trial period). Let's use **Render**.

1.  Push your code to **GitHub**.
    *   Create a repository on GitHub.
    *   Run inside your project folder:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin <your-github-repo-url>
        git push -u origin main
        ```

2.  Sign up at [Render.com](https://render.com/).
3.  Click **New +** > **Web Service**.
4.  Connect your GitHub repository.
5.  Settings:
    *   **Build Command**: `npm install && npm install --prefix client && npm run build --prefix client`
    *   **Start Command**: `npm start`
6.  **Environment Variables** (Add these):
    *   `NODE_ENV`: `production`
    *   `MONGO_URI`: (Paste your connection string from Phase 1)
    *   `JWT_SECRET`: (Create a random secret password)
    *   `CLOUDINARY_CLOUD_NAME`: (Copy from your .env)
    *   `CLOUDINARY_API_KEY`: (Copy from your .env)
    *   `CLOUDINARY_API_SECRET`: (Copy from your .env)

7.  Click **Create Web Service**.
8.  Wait for deployment. Render will give you a URL like: `https://your-app-name.onrender.com`.

## Phase 3: Update Android App

Once you have your new Render URL (e.g., `https://chat-app-123.onrender.com`):

1.  Open `client/src/utils/api.js` on your PC.
2.  Change the `baseURL`:
    ```javascript
    // api.js
    const API = axios.create({
        baseURL: "https://your-app-name.onrender.com/api", // USE YOUR NEW RENDER URL
    });
    ```
3.  Open `client/src/components/ChatBox.jsx`.
4.  Change the `ENDPOINT`:
    ```javascript
    // ChatBox.jsx
    const ENDPOINT = "https://your-app-name.onrender.com"; // USE YOUR NEW RENDER URL
    ```
5.  Rebuild the APK:
    *   `cd client`
    *   `npm run build`
    *   `npx cap sync`
    *   Open Android Studio and **Build APK** again.

Now your app will work on ANY phone, anywhere, anytime!
