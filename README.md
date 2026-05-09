<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HABITRY - AI-Powered Habit Tracker

A modern, production-ready habit tracker to build or quit habits with streak tracking and progress visualization.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build Mobile App (Android & iOS)

### Android

**Option 1: Automated Build**
```bash
# Run the build script (Windows)
build-mobile.bat
```

**Option 2: Manual Build**
```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Copy web assets to Android
mkdir android\app\src\main\assets
xcopy /E /I /Y dist\* android\app\src\main\assets\www\

# 4. Build APK
cd android
gradlew assembleDebug
```

The APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

### iOS

**Prerequisites:** macOS with Xcode installed

```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Copy web assets to iOS
mkdir ios/HABITRY/www
cp -r dist/* ios/HABITRY/www/

# 4. Install CocoaPods dependencies
cd ios/HABITRY
pod install

# 5. Open in Xcode and build
open HABITRY.xcworkspace
```

### Key Changes for Mobile

- Changed from `BrowserRouter` to `HashRouter` for file:// protocol compatibility
- Added Capacitor plugins for native mobile features
- Status bar styled to match app theme
- Splash screen auto-hides on app load
