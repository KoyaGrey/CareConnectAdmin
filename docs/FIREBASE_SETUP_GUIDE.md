# Firebase Setup Guide for Admin Portal

## Overview
The admin portal is now connected to Firebase Firestore to fetch real data from your CareConnect Android app.

## Step 1: Get Firebase Web App Configuration

You need to add a **Web App** to your Firebase project and get the configuration.

### Instructions:

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Sign in with your Google account
   - Select your project: **careconnect-42772**

2. **Add Web App** (if not already added)
   - Click the gear icon ⚙️ (top left) → **Project settings**
   - Scroll down to **"Your apps"** section
   - If you see a web app already, skip to step 3
   - If not, click the **</> (Web)** icon to add a web app
   - Give it a nickname (e.g., "Admin Portal")
   - Click **Register app**

3. **Copy Firebase Config**
   - After registering, you'll see a `firebaseConfig` object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "careconnect-42772.firebaseapp.com",
     projectId: "careconnect-42772",
     storageBucket: "careconnect-42772.firebasestorage.app",
     messagingSenderId: "713688982594",
     appId: "1:713688982594:web:xxxxxxxxxxxxx"
   };
   ```

4. **Update Firebase Config File**
   - Open: `src/utils/firebase.js`
   - Replace the `firebaseConfig` object with your actual config
   - **Important**: Make sure to get the `appId` from the web app config (it's different from Android)

## Step 2: Update Firestore Security Rules

The admin portal needs to read from Firestore. Update your security rules:

1. **Go to Firestore Database** in Firebase Console
2. Click on **Rules** tab
3. Update rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admins to read all caregivers and patients
    match /caregivers/{userId} {
      allow read: if request.auth != null; // For now, allow any authenticated user
      allow write: if request.auth != null;
    }
    
    match /patients/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow admins to read/write archived items
    match /archived/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: For production, you should implement proper admin authentication. For now, this allows any authenticated user to access the data.

## Step 3: Test the Connection

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the admin portal** in your browser

3. **Navigate to Caregivers or Patients page**
   - You should see data from your Firebase database
   - If you see "Loading..." or errors, check:
     - Firebase config is correct
     - Firestore security rules allow access
     - Browser console for error messages

## What's Connected

✅ **Caregivers Page**: Fetches real caregiver data from Firestore  
✅ **Patients Page**: Fetches real patient data from Firestore  
✅ **Archive Functionality**: Archives accounts to Firestore  
✅ **Real-time Data**: Shows actual data from your Android app  

## Data Mapping

The admin portal maps Firestore data to the display format:

- **Firestore `fullName`** → Admin portal `name`
- **Firestore `email`** → Admin portal `email`
- **Firestore `phone`** → Admin portal `phone`
- **Firestore document ID** → Admin portal `id`
- **Status**: Currently defaults to "Active" (you can add a status field to Firestore later)

## Troubleshooting

### Error: "Failed to load caregivers/patients"
- **Check Firebase config**: Make sure `appId` is correct (from web app, not Android)
- **Check Firestore rules**: Make sure rules allow read access
- **Check browser console**: Look for specific error messages

### Error: "Firebase: Error (auth/configuration-not-found)"
- **Solution**: Make sure you've added a **Web App** (not just Android app) to Firebase
- The web app has a different `appId` than the Android app

### No data showing
- **Check Firestore**: Go to Firebase Console → Firestore Database
- Verify that `caregivers` and `patients` collections exist
- Verify that documents exist in those collections

### Archive not working
- **Check Firestore rules**: Make sure `archived` collection allows write access
- **Check browser console**: Look for permission errors

## Next Steps

1. ✅ Get Firebase web app config
2. ✅ Update `src/utils/firebase.js` with your config
3. ✅ Update Firestore security rules
4. ✅ Test the connection
5. 🔄 (Optional) Add admin authentication with Firebase Auth
6. 🔄 (Optional) Add status field to Firestore documents
7. 🔄 (Optional) Add real-time updates (listen to Firestore changes)

## Files Modified

- `src/utils/firebase.js` - Firebase configuration
- `src/utils/firestoreService.js` - Firestore operations
- `src/tabs/CaregiversPage.jsx` - Now uses Firestore
- `src/tabs/PatientsPage.jsx` - Now uses Firestore

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console for data
3. Verify Firestore security rules
4. Make sure Firebase config is correct
