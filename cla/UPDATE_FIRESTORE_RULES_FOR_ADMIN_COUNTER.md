# Update Firestore Rules for Admin Counter

## Problem
The admin counter is not incrementing because Firestore security rules require Firebase Authentication, but the admin portal uses custom authentication (not Firebase Auth).

## Solution
Update your Firestore rules to allow writes to the `counters` collection without Firebase Auth.

## Steps

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Select your project
   - Go to **Firestore Database** → **Rules**

2. **Find the counters rule**
   Look for this section:
   ```javascript
   match /counters/{counterId} {
     allow read: if true;
     allow write: if request.auth != null;  // ← This is the problem!
   }
   ```

3. **Change it to:**
   ```javascript
   match /counters/{counterId} {
     allow read: if true;
     allow write: if true;  // ← Allow writes without Firebase Auth
   }
   ```

4. **Click "Publish"**

5. **Wait 1-2 minutes** for rules to propagate

## Complete Rules (for reference)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Counters collection - allow reading and writing
    match /counters/{counterId} {
      allow read: if true;
      allow write: if true;  // Admin portal uses custom auth
    }
    
    // Caregivers collection
    match /caregivers/{documentId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      allow delete: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
    }
    
    // Patients collection
    match /patients/{documentId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      allow delete: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
    }
    
    // Admin portal collections
    match /admins/{documentId} {
      allow read: if true;
      allow write: if true;  // Admin portal manages admins
    }
    
    // Archived accounts
    match /archived/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Why This Is Needed

- **Admin portal** uses custom authentication (checks Firestore documents)
- **Android app** uses Firebase Authentication
- The counter needs to be writable by the admin portal (which doesn't use Firebase Auth)
- So we need `allow write: if true` for the counters collection

## After Updating Rules

1. **Refresh your admin portal**
2. **Try creating a new admin**
3. **Check browser console** - should see counter incrementing
4. **Check Firebase Console** - `counters/admins` should show incremented count
5. **Check `admins` collection** - should have new document with sequential ID

## Test

1. Create admin #1 → Should get `AD-001`, counter = 1
2. Create admin #2 → Should get `AD-002`, counter = 2
3. Create admin #3 → Should get `AD-003`, counter = 3

If it still doesn't work, check the browser console for error messages!
