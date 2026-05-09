@echo off
REM HABITRY Mobile Build Script for Windows
REM Run this from the project root directory

echo ========================================
echo Building HABITRY Mobile App
echo ========================================

REM Step 1: Install dependencies
echo.
echo [1/5] Installing npm dependencies...
call npm install

REM Step 2: Build the web app
echo.
echo [2/5] Building web app...
call npm run build

REM Step 3: Copy web assets to Android
echo.
echo [3/5] Copying web assets to Android...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
xcopy /E /I /Y dist\* "android\app\src\main\assets\www\"

REM Step 4: Build Android APK
echo.
echo [4/5] Building Android APK...
cd android
call gradlew assembleDebug
cd ..

REM Step 5: Verify build
echo.
echo [5/5] Verifying build...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================
) else (
    echo.
    echo BUILD FAILED - Check errors above
    exit /b 1
)

echo.
echo Next steps:
echo 1. Install the APK on your Android device
echo 2. For iOS, follow the instructions in README.md
pause