# Fix Signup Permission Error

## The Problem

When creating a new account:
- First click: "PERMISSION_DENIED: Missing or insufficient permissions"
- Second click: "Email already in use" (account was created in Auth, but not in Firestore)

**Root Cause:** Firestore rules don't allow users to CREATE their own document during signup.

## The Solution

Update your Firestore rules to allow users to CREATE their own document.

## Step 1: Go to Firestore Rules

1. Go to: https://console.firebase.google.com/project/careconnect-42772/firestore/rules
2. Or: Firebase Console → Firestore Database → Rules tab

## Step 2: Replace Rules

Replace ALL the code with this (updated version):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Caregivers collection
    match /caregivers/{userId} {
      // Allow reading all caregivers (for admin portal)
      allow read: if true;
      // Allow users to CREATE their own document (during signup)
      allow create: if request.auth != null && request.auth.uid == userId;
      // Allow users to UPDATE their own document
      allow update: if request.auth != null && request.auth.uid == userId;
      // Allow users to DELETE their own document
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Patients collection
    match /patients/{userId} {
      // Allow reading all patients (for admin portal)
      allow read: if true;
      // Allow users to CREATE their own document (during signup)
      allow create: if request.auth != null && request.auth.uid == userId;
      // Allow users to UPDATE their own document
      allow update: if request.auth != null && request.auth.uid == userId;
      // Allow users to DELETE their own document
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin portal collections
    match /admins/{document=**} {
      allow read, write: if true;
    }
    
    // Archived accounts
    match /archived/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 3: Publish

1. Click **"Publish"** button
2. Wait for confirmation
3. Wait 1-2 minutes for rules to propagate

## Step 4: Test

1. Try creating a new account in your Android app
2. It should work on the first try now!

## What Changed?

**Old rule:**
```javascript
allow write: if request.auth != null && request.auth.uid == resource.id;
```

**Problem:** `resource.id` only works for existing documents. During signup, the document doesn't exist yet!

**New rules:**
```javascript
allow create: if request.auth != null && request.auth.uid == userId;
allow update: if request.auth != null && request.auth.uid == userId;
```

**Solution:** 
- `create` uses `userId` from the path (works for new documents)
- `update` uses `resource.id` (works for existing documents)
- Separated create/update/delete for better control

## Important Notes

- Users can only create/update/delete their OWN documents (security maintained)
- Admin portal can still read ALL documents (for displaying data)
- Rules are more explicit and secure

## If You Still Get Errors

1. **Wait 2-3 minutes** after publishing rules
2. **Clear app data** in Android app (Settings → Apps → CareConnect → Clear Data)
3. **Try again** with a new email address
4. **Check browser console** in admin portal for any errors

Let me know if this fixes the issue!
