# How to Build the Android APK

Since this is a web application, we use **Capacitor** to wrap it into an Android app.

I have already configured the Android project for you in the `client/android` folder. 

## Prerequisites

To generate the `.apk` file, you need the Android build tools, which are best installed via **Android Studio**.

1.  **Download & Install Android Studio**: [https://developer.android.com/studio](https://developer.android.com/studio)
2.  During installation, ensure the **Android SDK** and **Android Virtual Device** components are selected.

## Steps to Build

1.  **Open the Project**:
    *   Open Android Studio.
    *   Select **Open**.
    *   Navigate to `d:\Saiteja\projects\chat-app\client\android` and click OK.
    *   Wait for Gradle sync to finish (this may take a few minutes the first time).

2.  **Build the APK**:
    *   In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Wait for the build to complete.
    *   A notification will appear: "APK(s) generated successfully". Click **locate** to find your `.apk` file.
    *   Typically found in: `client/android/app/build/outputs/apk/debug/app-debug.apk`.

3.  **Install on Phone**:
    *   Transfer the `.apk` file to your Android phone (USB, Google Drive, etc.).
    *   Tap to install. You may need to allow "Install from unknown sources".

## Important: Network Configuration

Your app connects to the backend at `http://10.75.221.145:5000`.
*   **WiFi**: Your phone MUST be connected to the **same WiFi network** as your computer.
*   **Firewall**: Ensure your computer's firewall allows incoming connections on port 5000.

## Updating the App

If you make changes to the React code:
1.  Run `npm run build` in the `client` folder.
2.  Run `npx cap sync` in the `client` folder.
3.  Rebuild the APK in Android Studio.
