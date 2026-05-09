# App Bundle Creation Guide

This guide covers how to build release-ready app bundles for both Android and iOS platforms.

---

## Android

### Prerequisites

- Android Studio or command-line Gradle
- JDK 11+ installed
- A valid signing key (keystore) for release builds

### Option 1: Android App Bundle (AAB) — Recommended for Play Store

The **Android App Bundle** is the recommended format for Google Play Store submissions.

```bash
# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build release AAB
./gradlew bundleRelease
```

**Output location:**
```
android/app/build/outputs/apk/release/app-release.aab
```

### Option 2: APK (Universal)

For direct distribution or testing:

```bash
# Build release APK
./gradlew assembleRelease
```

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Signing Configuration

If not using debug signing, configure your keystore in `android/app/build.gradle`:

```groovy
android {
    signingConfigs {
        release {
            storeFile file("your-keystore.jks")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Build with Custom Keystore

```bash
./gradlew bundleRelease \
  -PstoreFile=path/to/keystore.jks \
  -PstorePassword=xxx \
  -PkeyAlias=xxx \
  -PkeyPassword=xxx
```

---

## iOS

### Prerequisites

- macOS (required for iOS builds)
- Xcode installed
- Apple Developer account
- Valid provisioning profile and certificates

### Option 1: Xcode Build (IPA)

```bash
# Navigate to ios directory
cd ios/HABITRY

# List available schemes
xcodebuild -list

# Build for simulator
xcodebuild -scheme HABITRY -configuration Debug -destination 'platform=iOS Simulator' build

# Build for device (requires code signing)
xcodebuild -scheme HABITRY -configuration Release \
  -codeSignIdentity="Apple Distribution" \
  -provisioningProfile="Your Provisioning Profile" \
  -archive
```

### Option 2: Archive via Xcode GUI

1. Open `ios/HABITRY/HABITRY.xcworkspace` in Xcode
2. Select **Product → Archive**
3. In the Organizer window, click **Distribute App**
4. Choose **App Store Connect** (for TestFlight/App Store) or **Ad Hoc** (for testing)

### Option 3: Export IPA from Archive

```bash
# Export for TestFlight/App Store
xcodebuild -exportArchive \
  -archivePath build/HABITRY.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath output.ipa
```

Create `ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

### Code Signing Setup

1. **Automatic Signing** (recommended):
   - In Xcode: Project → Signing & Capabilities → Automatically manage signing

2. **Manual Signing**:
   - Download certificates from Apple Developer Portal
   - Import into Keychain Access
   - Create provisioning profiles
   - Configure in Xcode or via Fastlane

---

## CI/CD Automation

### Fastlane (Recommended)

Install Fastlane in your project:

```bash
# In project root
npm install -g fastlane
cd ios/HABITRY
fastlane init
```

Configure `Fastfile` for Android:

```ruby
# android/Fastfile
default_platform(:android)

platform :android do
  lane :build_release do
    gradle(
      task: "bundleRelease"
    )
    upload_to_play_store(
      json_key: "play-store-config.json",
      package_name: "com.habitry.app"
    )
  end
end
```

Configure `Fastfile` for iOS:

```ruby
# ios/Fastfile
default_platform(:ios)

platform :ios do
  lane :build_release do
    match(type: "appstore")
    gym(
      scheme: "HABITRY",
      configuration: "Release"
    )
    deliver(skip_metadata: true)
  end
end
```

Run with:
```bash
fastlane android build_release
fastlane ios build_release
```

### GitHub Actions Example

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [main]

jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: '11'
      - name: Build Android AAB
        run: cd android && ./gradlew bundleRelease
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: android-aab
          path: android/app/build/outputs/apk/release/app-release.aab

  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build iOS IPA
        run: |
          cd ios/HABITRY
          xcodebuild -scheme HABITRY -configuration Release archive
          xcodebuild -exportArchive -archivePath build/HABITRY.xcarchive -exportPath output
```

---

## Version Management

Update version in these locations:

| Platform | File | Properties |
|----------|------|------------|
| Android | `android/app/build.gradle` | `versionCode`, `versionName` |
| iOS | `ios/HABITRY/App/Info.plist` | `CFBundleVersion`, `CFBundleShortVersionString` |
| App | `package.json` | `version` |

---

## Quick Reference Commands

### Android
```bash
# Debug APK
cd android && ./gradlew assembleDebug

# Release AAB
cd android && ./gradlew bundleRelease

# Release APK
cd android && ./gradlew assembleRelease
```

### iOS (macOS only)
```bash
# Build simulator
xcodebuild -scheme HABITRY -configuration Debug -destination 'platform=iOS Simulator' build

# Archive for release
xcodebuild -scheme HABITRY -configuration Release -archive
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `JAVA_HOME` not set | Set `JAVA_HOME` to JDK 11+ path |
| Keystore not found | Verify path in `local.properties` or Gradle config |
| iOS signing failed | Check provisioning profile in Apple Developer Portal |
| Capacitor build errors | Run `npx capacitor sync` before building |
| Missing CocoaPods | Run `cd ios/HABITRY && pod install` |

---

## Additional Resources

- [Capacitor Build Documentation](https://capacitorjs.com/docs/android/build)
- [Google Play App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Apple Distribution Guide](https://developer.apple.com/distribute/)
- [Fastlane Documentation](https://docs.fastlane.tools/)