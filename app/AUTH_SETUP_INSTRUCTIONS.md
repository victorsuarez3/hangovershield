# 🔐 Google & Apple Sign-In Setup Instructions

## ✅ CODE CHANGES COMPLETED

All code fixes have been implemented:
- ✅ Added native Google Sign-In SDK integration
- ✅ Added nonce security to Apple Sign-In
- ✅ Fixed Firestore database configuration
- ✅ Updated logout to clear Google session
- ✅ Added lastLoginAt tracking to user documents
- ✅ Updated app.config.ts with required plugins

---

## 📦 STEP 1: Install Required Package

Run this command in the terminal:

```bash
cd /Users/victorsuarez/Projects/hangovershield/app
npm install @react-native-google-signin/google-signin
```

**Why:** The native Google Sign-In SDK is required for production iOS/Android builds.

---

## 🔧 STEP 2: Firebase Console Configuration

### A. Enable Authentication Providers

**Go to:** [Firebase Console](https://console.firebase.google.com) → Your Project (`xxx-test-f2f64`) → Authentication → Sign-in method

#### Enable Google Sign-In:
1. Click on **"Google"** in the providers list
2. Toggle **"Enable"** to ON
3. Enter support email: `your-email@example.com`
4. Click **"Save"**

#### Enable Apple Sign-In:
1. Click on **"Apple"** in the providers list
2. Toggle **"Enable"** to ON
3. Leave Service ID blank (not needed for native app)
4. Click **"Save"**

---

### B. Create Web OAuth Client (Required for Google Sign-In)

**Why needed:** Google Sign-In on native apps requires a Web OAuth client ID from Google Cloud Console.

**Go to:** [Google Cloud Console](https://console.cloud.google.com) → Select project `xxx-test-f2f64` → APIs & Services → Credentials

#### Create Web Application OAuth Client:

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: `Hangover Shield Web Client`
4. Authorized JavaScript origins:
   ```
   https://xxx-test-f2f64.firebaseapp.com
   https://xxx-test-f2f64.web.app
   ```
5. Authorized redirect URIs:
   ```
   https://xxx-test-f2f64.firebaseapp.com/__/auth/handler
   ```
6. Click **"CREATE"**
7. **COPY THE CLIENT ID** (format: `XXXXX-XXXXX.apps.googleusercontent.com`)

---

### C. Update app.config.ts with Correct Web Client ID

**File:** `/Users/victorsuarez/Projects/hangovershield/app/app.config.ts`

**Find line 30 and replace with your actual Web Client ID:**

```typescript
googleWebClientId: 'YOUR_WEB_CLIENT_ID_FROM_STEP_2B.apps.googleusercontent.com',
```

**Example:**
```typescript
googleWebClientId: '251175596798-abc123def456.apps.googleusercontent.com',
```

**Current values in your config:**
- ✅ iOS Client ID: `251175596798-i2k3l2od98f1rucpuuvgcple05t4cv13.apps.googleusercontent.com`
- ✅ Android Client ID: `251175596798-7gm1psc5s4ls18kdqq5v85hmc3rq5cf5.apps.googleusercontent.com`
- ⚠️ Web Client ID: **NEEDS TO BE UPDATED** (current value is incorrect)

---

## 📱 STEP 3: Android SHA Fingerprints

**Why needed:** Google Sign-In on Android requires SHA fingerprints to verify your app.

### A. Get Debug SHA-1 Fingerprint

**Run this command:**

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Look for these lines in the output:**
```
SHA1: A1:B2:C3:D4:E5:F6:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
SHA256: A1:B2:C3:D4:E5:F6:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

**Copy both SHA-1 and SHA-256.**

### B. Add Fingerprints to Firebase

**Go to:** Firebase Console → Project Settings → Your apps → Android app (com.versaluna.hangovershield)

1. Scroll to **"SHA certificate fingerprints"**
2. Click **"Add fingerprint"**
3. Paste your DEBUG **SHA-1**
4. Click **"Add fingerprint"** again
5. Paste your DEBUG **SHA-256**

### C. Get Release/EAS SHA Fingerprints (For Production)

**When you build with EAS Build, get the release SHA fingerprints:**

```bash
eas credentials
```

**Or manually from keystore:**
```bash
keytool -list -v -keystore /path/to/release.keystore -alias your-key-alias
```

**Add these to Firebase the same way as debug fingerprints.**

---

## 🍎 STEP 4: Apple Developer Portal

### A. Enable Sign In with Apple Capability

**Go to:** [Apple Developer Portal](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers

1. Find your App ID: `com.versaluna.hangovershield`
2. Click to edit
3. Scroll to **"Sign In with Apple"**
4. Check the **"Enable"** checkbox
5. Click **"Save"**
6. Click **"Confirm"**

**Note:** You do NOT need to create a Service ID for native iOS apps. Service IDs are only for web-based Apple Sign-In.

---

## 🔨 STEP 5: Build Your App

### Option A: Development Build with EAS (Recommended)

**iOS:**
```bash
cd /Users/victorsuarez/Projects/hangovershield/app
eas build --profile development --platform ios
```

**Android:**
```bash
eas build --profile development --platform android
```

**Install on device:**
- iOS: Download from EAS and install via TestFlight or direct install
- Android: Download APK from EAS and install directly

---

### Option B: Local Build with Expo

**First, prebuild native code:**
```bash
npx expo prebuild --clean
```

**Then run:**

**iOS:**
```bash
npx expo run:ios
```

**Android:**
```bash
npx expo run:android
```

---

## ✅ VERIFICATION CHECKLIST

Before testing, verify all these are complete:

### Firebase Console:
- [ ] Google provider enabled in Authentication → Sign-in method
- [ ] Apple provider enabled in Authentication → Sign-in method
- [ ] Firestore Database created (or using default)

### Google Cloud Console:
- [ ] Web OAuth client created
- [ ] Web client ID copied to app.config.ts line 30
- [ ] Android SHA-1 (debug) added to Firebase
- [ ] Android SHA-256 (debug) added to Firebase

### Apple Developer:
- [ ] App ID `com.versaluna.hangovershield` has Sign In with Apple enabled

### Code:
- [ ] Package installed: `npm install @react-native-google-signin/google-signin`
- [ ] app.config.ts updated with correct webClientId
- [ ] App built with `eas build` or `expo prebuild + expo run`

---

## 🧪 TESTING

### Test on iOS Device/Simulator:

1. Launch app
2. Tap **"Sign in with Google"**
   - Should open Google account picker
   - Select account
   - Grant permissions
   - Should navigate to HomeMain
3. Sign out (Settings → Sign Out)
4. Tap **"Sign in with Apple"**
   - Should show Apple Sign-In prompt
   - Authenticate with Face ID / Apple ID
   - Choose email option
   - Should navigate to HomeMain

**Check Firestore:**
- Go to Firebase Console → Firestore Database → `users` collection
- You should see a document with your Firebase Auth UID
- Fields should include: `email`, `displayName`, `photoUrl`, `createdAt`, `lastLoginAt`

---

### Test on Android Device/Emulator:

1. Ensure Google Play Services is up to date
2. Launch app
3. Tap **"Sign in with Google"**
   - Should open Google account picker
   - If emulator doesn't have accounts, add one in Settings
   - Select account
   - Grant permissions
   - Should navigate to HomeMain

**Apple Sign-In Button:**
- Should NOT appear on Android (iOS-only feature)

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Google Sign-In Errors:

**Error: "Invalid client ID" or "Sign-in failed"**
- ❌ Web Client ID in app.config.ts is wrong
- ✅ Fix: Copy correct Web Client ID from Google Cloud Console → Credentials
- ✅ Update line 30 in app.config.ts

**Error: "SIGN_IN_FAILED" (Android)**
- ❌ SHA fingerprints not added to Firebase
- ✅ Fix: Run `keytool` command above and add SHA-1/SHA-256 to Firebase

**Error: "Developer error" (Android)**
- ❌ Wrong androidClientId in app.config.ts
- ✅ Fix: Verify androidClientId matches google-services.json line 17

**Error: "PLAY_SERVICES_NOT_AVAILABLE"**
- ❌ Google Play Services not installed or outdated
- ✅ Fix: Update Google Play Services on device/emulator

---

### Apple Sign-In Errors:

**Error: "Operation not allowed"**
- ❌ Apple provider not enabled in Firebase Console
- ✅ Fix: Go to Firebase Console → Authentication → Sign-in method → Enable Apple

**Error: "Sign-in unavailable"**
- ❌ Sign In with Apple not enabled in App ID capabilities
- ✅ Fix: Go to Apple Developer Portal → Enable capability → Rebuild app

**Button doesn't appear:**
- ✅ Expected on Android (iOS-only feature)
- ❌ On iOS: Check `Platform.OS === 'ios'` in AppleSignInButton component

---

### Firebase/Firestore Errors:

**Error: "database not found"**
- ❌ Named database doesn't exist
- ✅ Fix: Already fixed in code to use default database

**Error: "permission-denied" in Firestore**
- ❌ Firestore security rules blocking writes
- ✅ Fix: Update Firestore rules to allow authenticated users to write their own documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📞 NEED HELP?

If you encounter issues:

1. **Check Firebase Console Logs:**
   - Firebase Console → Authentication → Users (verify user was created)
   - Firestore Database → users collection (verify document created)

2. **Check App Logs:**
   - Run app with `npx expo start`
   - Look for errors in console output
   - Check for `[Google]`, `[Apple]`, `[Firebase]` log tags

3. **Verify Configuration:**
   - Double-check all Client IDs match between Firebase, Google Cloud, and app.config.ts
   - Ensure SHA fingerprints are correct (case-sensitive)
   - Confirm bundle ID/package name matches everywhere

4. **Test with Different Account:**
   - Sometimes cached credentials cause issues
   - Try signing in with a different Google/Apple account

---

## 🎉 SUCCESS CRITERIA

You'll know authentication is working when:

✅ Google Sign-In opens native picker on both iOS and Android
✅ Apple Sign-In opens on iOS (not shown on Android)
✅ User is redirected to app after successful authentication
✅ User document appears in Firestore with all fields
✅ `lastLoginAt` updates on each sign-in
✅ Sign out clears session and returns to login screen
✅ App remembers user on restart (auth persistence)

---

## 📝 NOTES

- **Expo Go NOT supported:** Native Google/Apple Sign-In requires custom native code, which Expo Go doesn't support. You MUST use development builds or standalone builds.

- **Testing on Simulator:** iOS Simulator supports Apple Sign-In if you're logged into an Apple ID in the simulator. Android Emulator needs Google Play Services installed.

- **Production builds:** When building for production, ensure you add RELEASE SHA fingerprints to Firebase, not just debug.

- **Firestore Security Rules:** Update rules before going to production to restrict access appropriately.

---

## 🔄 NEXT STEPS AFTER AUTH WORKS

Once authentication is working:

1. Remove `TEST_MODE` flag from App.tsx (line 37)
2. Remove "Skip Auth" and "Reset Onboarding" buttons from LoginScreen
3. Test subscription flow with real users
4. Set up analytics for auth events
5. Configure Firestore security rules for production
6. Test on real devices before App Store/Play Store submission

Good luck! 🚀
