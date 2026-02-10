# Firestore Data Not Showing - Troubleshooting Guide

## Quick Checks

### 1. Open Browser Console
Press `F12` → Go to **Console** tab

Look for:
- ✅ "Testing Firestore connection..."
- ✅ "Firestore connection successful!"
- ❌ "PERMISSION DENIED" errors
- ❌ "Error in caregivers listener"

### 2. Check Firestore Security Rules

**This is the #1 cause of "nothing showing"!**

Go to: **Firebase Console → Firestore Database → Rules**

#### Current Rules (Too Restrictive)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /caregivers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /patients/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Problem**: These rules only allow users to read their OWN data. The admin portal needs to read ALL data.

#### Fix: Allow Admin Portal to Read All Data

**Option 1: Allow All Reads (For Testing/Development)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /caregivers/{document=**} {
      allow read: if true;  // Allow anyone to read
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    match /patients/{document=**} {
      allow read: if true;  // Allow anyone to read
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    match /admins/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /archived/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Option 2: Use Firebase Auth (More Secure)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated admin portal users to read all data
    match /caregivers/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    match /patients/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    match /admins/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /archived/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**After updating rules:**
1. Click **Publish**
2. Wait 1-2 minutes for rules to propagate
3. Refresh your admin portal
4. Check browser console again

### 3. Verify Data Exists in Firestore

Go to: **Firebase Console → Firestore Database → Data**

Check:
- ✅ Does `caregivers` collection exist?
- ✅ Does `patients` collection exist?
- ✅ Are there any documents in these collections?

**If collections are empty:**
- Create a test account in your Android app
- Or manually add a test document in Firebase Console

### 4. Check Firebase Configuration

Open: `src/utils/firebase.js`

Verify:
- ✅ `projectId` matches your Firebase project
- ✅ `appId` is from **Web App** (not Android)
- ✅ No typos in config values

### 5. Check Collection Names

The admin portal uses:
- `caregivers` (not `users` or `caregiver`)
- `patients` (not `users` or `patient`)

Verify in your Android app code that it uses the same names.

### 6. Browser Console Errors

Common errors and fixes:

#### Error: "permission-denied"
**Fix**: Update Firestore security rules (see #2 above)

#### Error: "Failed to get document"
**Fix**: Check Firebase connection and security rules

#### Error: "Collection not found"
**Fix**: 
- Check collection name spelling
- Create a test document in Firebase Console
- Collections are created automatically when first document is added

#### No errors, but no data
**Possible causes:**
1. Collections are empty (no accounts created yet)
2. Security rules blocking access
3. Wrong Firebase project

### 7. Test Connection

Open browser console and type:
```javascript
// This will test the connection
import { testFirestoreConnection } from './utils/firestoreService';
testFirestoreConnection();
```

Or check the console logs when the page loads - you should see connection test results.

## Step-by-Step Fix

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com/
   - Select your project: `careconnect-42772`

2. **Check Firestore Data**
   - Go to **Firestore Database → Data**
   - Verify `caregivers` and `patients` collections exist
   - Check if there are any documents

3. **Update Security Rules**
   - Go to **Firestore Database → Rules**
   - Replace with the rules from Option 1 above (for testing)
   - Click **Publish**

4. **Refresh Admin Portal**
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Open browser console (F12)
   - Look for connection test results

5. **Check Console Logs**
   - Should see: "✅ Firestore connection successful!"
   - Should see: "✅ Caregivers snapshot received: X documents"
   - If you see errors, follow the error messages

## Still Not Working?

Share these details:
1. **Browser console errors** (screenshot or copy text)
2. **Firestore security rules** (current rules)
3. **Firestore data** (screenshot showing collections)
4. **Connection test results** (from console)

This will help identify the exact issue!
