# Android Project Changes Analysis
## Comparing Android Project with React Web App

**Date:** May 9, 2026  
**Project:** HABITRY - AI-Powered Habit Tracker

---

## Overview

The Android project has been customized from a standard Capacitor setup to create a fully functional mobile app from the React web codebase. Below is a detailed list of all changes made.

---

## 1. Project Configuration & Setup

### 1.1 Capacitor Configuration (`capacitor.config.json`)
- **App ID:** `com.habitry.app`
- **App Name:** `HABITRY`
- **Web Directory:** `dist` (points to built React web assets)
- **Bundle Web Runtime:** `false`
- **Android-Specific Settings:**
  - `allowMixed: true` - Allows mixing native and web content
  - `minSdkVersion: 22` - Supports Android 5.1+
  - `androidScheme: "https"` - Uses HTTPS protocol for better security

### 1.2 Package.json Dependencies Added
Mobile-specific Capacitor packages added to support native features:
```json
"@capacitor/android": "^8.3.1"
"@capacitor/core": "^8.3.1"
"@capacitor/local-notifications": "^8.0.2"
"@capacitor/splash-screen": "^8.0.1"
"@capacitor/status-bar": "^8.0.2"
```

### 1.3 Vite Build Configuration
- Modified `vite.config.ts` to output to `dist/` folder
- Build artifacts automatically copied to Android web assets directory during build process

---

## 2. Android Native Layer

### 2.1 Android Gradle Configuration

**Root `build.gradle`:**
- Android Gradle Plugin: `8.13.2`
- Kotlin Plugin: `2.1.0`

**App Module `build.gradle` (`android/app/build.gradle`):**
```gradle
- Namespace: com.habitry.app
- compileSdkVersion: 36 (Android 15)
- minSdkVersion: 24 (Android 7.0)
- targetSdkVersion: 36 (Android 15)
- versionCode: 1
- versionName: 1.0.0
- Java Compatibility: VERSION_21
- Kotlin JVM Target: 21
```

**Key Dependencies:**
- `androidx.appcompat:appcompat:1.7.1`
- `androidx.core:core-ktx:1.18.0`
- `androidx.activity:activity:1.13.0`
- `androidx.fragment:fragment:1.8.9`
- `org.jetbrains.kotlin:kotlin-stdlib:2.1.0`
- Capacitor Android framework

### 2.2 Custom Kotlin Classes

**MainActivity.kt** (`android/app/src/main/java/com/habitry/app/MainActivity.kt`)
```kotlin
class MainActivity : BridgeActivity()
```
- Extends Capacitor's `BridgeActivity`
- Provides bridge between React web app and native Android APIs
- Handles the webview that displays the React app

**MainApplication.kt** (`android/app/src/main/java/com/habitry/app/MainApplication.kt`)
```kotlin
class MainApplication : Application()
```
- Custom application class for global app initialization
- Minimal implementation - extends Android `Application`

### 2.3 Android Manifest Configuration (`AndroidManifest.xml`)

**Permissions:**
- `android.permission.INTERNET` - Required for API calls and Supabase
- `android.permission.POST_NOTIFICATIONS` - Required for local notifications (Android 13+)

**Application Configuration:**
- Package: `com.habitry.app`
- Main Theme: `@style/AppTheme`
- Main Activity: `MainActivity` 
- Exported: `true` (allows external app launching)
- Launch Mode: `singleTask` (single instance on the back stack)
- Window Soft Input Mode: `adjustResize` (adjusts layout when keyboard appears)
- Uses cleartext traffic: `true` (allows HTTP in development)

### 2.4 Gradle Properties (`gradle.properties`)

```properties
org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
android.useAndroidX=true
android.enableJetifier=true
```

**Purpose:**
- JVM memory: 4GB heap for builds
- Parallel builds enabled for faster compilation
- Build caching enabled
- Configuration cache enabled
- AndroidX support enabled (modern Android libraries)

---

## 3. Android Resources & Styling

### 3.1 Color Palette (`res/values/colors.xml`)

Custom colors matching the app's design system:
```xml
Primary: #6366F1 (Indigo)
Primary Dark: #4F46E5 (Dark Indigo)
Accent: #22C55E (Green)
Background: #FFFFFF (White)
Surface: #F9FAFB (Light Gray)
On Primary: #FFFFFF (White text on primary)
On Background: #111827 (Dark text on background)
On Surface: #374151 (Medium gray text)
```

### 3.2 Strings Resource (`res/values/strings.xml`)
```xml
App Name: HABITRY
Activity Title: HABITRY
```

### 3.3 Themes Configuration (`res/values/themes.xml`)

```xml
AppTheme (extends Material.Light.NoActionBar):
- statusBarColor: #6366F1 (matches primary color)
- navigationBarColor: #FFFFFF (white)
- windowBackground: #FFFFFF (white)
```

**Features:**
- Material Design Light theme without action bar (React app provides UI)
- Styled status bar matching app branding
- Navigation bar styled for consistency

### 3.4 Drawable Resources (`res/drawable/`)
- `ic_launcher_foreground.xml` - App launcher icon foreground

### 3.5 App Icon Resources (`res/mipmap-*/`)
- Standard Android app icons for different screen densities (hdpi, etc.)
- Adaptive icon support (anydpi-v26)

### 3.6 Capacitor Configuration (`res/xml/config.xml`)
- Minimal Cordova config for web asset loading
- Allows all origins for network access (`<access origin="*" />`)

---

## 4. React Web App Modifications for Mobile

### 4.1 Router Changes (`src/main.tsx`)

**Change: BrowserRouter → HashRouter**
```typescript
// Old (web):
import { BrowserRouter } from 'react-router-dom';

// New (mobile):
import { HashRouter } from 'react-router-dom';
```
**Reason:** Hash-based routing works with `file://` protocol used in Android webview

### 4.2 Mobile Initialization (`src/lib/mobileInit.ts`)

**New file added for mobile-specific setup:**

```typescript
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export async function initializeMobile(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // Configure status bar
    await StatusBar.setStyle({ style: 'light' });
    await StatusBar.setBackgroundColor({ color: '#6366F1' });
    await StatusBar.show();

    // Hide splash screen
    await SplashScreen.hide({ fadeOutDuration: 500 });
  }
}
```

**Features:**
- Detects if running on native platform
- Sets status bar to light text with indigo background
- Hides native splash screen after 500ms fade out

### 4.3 App Initialization (`src/main.tsx`)

```typescript
import { initializeMobile } from './lib/mobileInit';

// Initialize mobile-specific features on app start
initializeMobile();
```

### 4.4 Local Notifications Service (`src/services/reminderService.ts`)

**New service for Android native notifications:**

```typescript
class ReminderService {
  async start() {
    // Check notification permissions
    const status = await LocalNotifications.checkPermissions();
    
    // Create Android notification channel
    await LocalNotifications.createChannel({
      id: 'habit-reminders',
      name: 'Habit Reminders',
      description: 'Daily habit check-in reminders',
      importance: 5,
      visibility: 1,
      sound: 'default'
    });
  }

  async requestPermission() {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  }

  async sync(habits: Habit[]) {
    // Schedules native notifications for each habit reminder
    // Supports: daily, weekdays, weekends frequencies
    // Uses Capacitor LocalNotifications API
  }
}
```

**Capabilities:**
- Channel-based notification management (Android 8.0+)
- Notification permission handling
- Scheduling recurring notifications with custom times
- Support for different frequencies (daily, weekdays, weekends)
- Includes 8 motivational messages for variety

### 4.5 Main App Component (`src/App.tsx`)

**Mobile Enhancements:**
1. **Splash Screen Display:**
   - Shows custom splash screen (2.5 seconds)
   - Managed by `Splash` component

2. **Notification Permission Request:**
   - Automatically requests permission when user logs in
   - Syncs notifications with reminder service

3. **Mobile Floating Action Button:**
   - FAB-style layout for adding new habits
   - Optimized for touch interaction

4. **Reminder Service Integration:**
   - Initializes reminder service on app mount
   - Synchronizes habit reminders when habits are fetched

### 4.6 Splash Screen Component (`src/components/Splash.tsx`)

**Mobile-Specific UI:**
```typescript
- Custom 2.5-second animated splash screen
- Gradient background (#5B3DF5 to #8B7CFF)
- HABITRY logo with white star icon
- Tagline: "Discipline Made Simple"
- Blur effect with animated background
- Drop shadow effects for depth
```

---

## 5. Build & Deployment Setup

### 5.1 Build Script (`build-mobile.bat`)

Automated Windows batch script for building Android APK:
```batch
# 1. Install npm dependencies
# 2. Build React app (npm run build)
# 3. Copy dist assets to Android
# 4. Build Android APK with Gradle
```

### 5.2 Build Directory Structure

After building, the structure becomes:
```
android/app/src/main/assets/www/
  ├── index.html          (React SPA entry point)
  ├── assets/             (bundled React components & JS)
  ├── vite.svg
  └── [other web assets]
```

### 5.3 Release Configuration

Current setup uses debug signing config - ready to be replaced with release keystore for production builds.

---

## 6. Dependency Comparison

### Dependencies Added for Android (in `package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| @capacitor/android | ^8.3.1 | Android runtime for Capacitor |
| @capacitor/core | ^8.3.1 | Core Capacitor APIs |
| @capacitor/local-notifications | ^8.0.2 | Native notification scheduling |
| @capacitor/splash-screen | ^8.0.1 | Native splash screen control |
| @capacitor/status-bar | ^8.0.2 | Native status bar styling |

### No Changes to These Dependencies

All existing web dependencies work on mobile:
- React 19.0.0
- React DOM 19.0.0
- React Router DOM 7.14.1
- Zustand 5.0.12
- Tailwind CSS 4.1.14
- Supabase JS 2.101.1
- Motion (animations) 12.23.24
- Lucide React (icons) 0.546.0

---

## 7. Key Implementation Details

### 7.1 Asset Path Configuration
- React built assets stored in: `android/app/src/main/assets/www/`
- WebView loads index.html from this location
- All paths must be relative or use hash-based routing

### 7.2 Native Bridge Integration
- MainActivity extends BridgeActivity (Capacitor)
- Provides web-to-native method call interface
- Enables access to:
  - Notifications API
  - Status bar styling
  - Splash screen control
  - Device storage (future)
  - Camera/gallery (future)

### 7.3 Notification System
- Uses Capacitor LocalNotifications plugin
- Android notification channels for categorization
- Supports recurring notifications (daily/weekly)
- Permissions handled via Android runtime permissions

### 7.4 Security Configuration
- HTTPS protocol preferred for web requests
- Cleartext traffic allowed in debug build
- Should disable for release builds
- Configured in `capacitor.config.json`

---

## 8. Summary of Changes from Web to Android

| Aspect | Web App | Android App |
|--------|---------|------------|
| **Router** | BrowserRouter | HashRouter |
| **Entry Point** | DOM element | Native WebView |
| **Status Bar** | Browser native | Custom styled via Capacitor |
| **Notifications** | Browser push (if available) | Native Android notifications |
| **Splash Screen** | React component | Native + React component |
| **Build Target** | dist/ folder | Android APK/AAB |
| **Min SDK** | N/A | Android 7.0 (API 24) |
| **Target SDK** | N/A | Android 15 (API 36) |
| **Permissions** | Browser permissions | Android manifest permissions |
| **Storage** | Browser localStorage | Native storage (future) |
| **Navigation** | HTML history | WebView history stack |

---

## 9. Architecture Overview

```
┌─────────────────────────────────────┐
│     Native Android Layer            │
│  ┌────────────────────────────────┐ │
│  │  MainActivity (BridgeActivity) │ │
│  │  MainApplication               │ │
│  │  StatusBar, SplashScreen APIs  │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
           ↓ (Capacitor Bridge)
┌─────────────────────────────────────┐
│     WebView (Android)               │
│  ┌────────────────────────────────┐ │
│  │  React App (HashRouter)        │ │
│  │  ├─ mobileInit.ts              │ │
│  │  ├─ reminderService.ts         │ │
│  │  ├─ All React Components       │ │
│  │  └─ Tailwind CSS Styling       │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
           ↓ (API Calls)
┌─────────────────────────────────────┐
│  Supabase Backend                   │
│  (Authentication & Database)        │
└─────────────────────────────────────┘
```

---

## 10. Notable Absence of Changes

The following aspects remain **unchanged** from the web version:

- All React component logic
- Supabase authentication flow
- Database schema and queries
- UI/UX layout (Tailwind CSS)
- State management (Zustand)
- API integration (Google Gemini)
- Form handling
- Data validation

---

## 11. Configuration Files Summary

| File | Location | Purpose |
|------|----------|---------|
| capacitor.config.json | Root | Capacitor bridge configuration |
| AndroidManifest.xml | android/app/src/main | App metadata & permissions |
| build.gradle | android/app | Android build configuration |
| local.properties | android | SDK path configuration |
| gradle.properties | android | Gradle build properties |
| colors.xml | android/app/src/main/res/values | Color palette |
| strings.xml | android/app/src/main/res/values | String resources |
| themes.xml | android/app/src/main/res/values | Theme configuration |
| config.xml | android/app/src/main/res/xml | Cordova/Capacitor config |

---

## Conclusion

The Android project is a **Capacitor-based wrapper** around the React web application. Key changes focus on:

1. ✅ **Native app packaging** - Capacitor framework bridges React to Android
2. ✅ **Mobile-optimized routing** - HashRouter for file:// protocol
3. ✅ **Native notifications** - Local notification scheduling
4. ✅ **Status bar styling** - Custom Android status bar
5. ✅ **Splash screen** - Native + React component for smooth launch
6. ✅ **Asset bundling** - Build web assets into APK
7. ✅ **Permissions** - Android manifest permissions for notifications

**Minimal native code** - Most functionality leverages Capacitor plugins and the shared React codebase.
