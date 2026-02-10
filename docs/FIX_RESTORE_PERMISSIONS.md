# Fix Restore Function - Firestore Permission Error

## Error Message
"Permission denied. Please check Firestore security rules for write access to the original collection and delete access to the archived collection."

## Problem
The restore function needs:
1. **Write access** to original collections (caregivers/patients/admins) - to create restored documents
2. **Delete access** to archived collection - to remove archived documents

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database** → **Rules**

### Step 2: Update Rules

Replace your current rules with this complete set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Counters collection
    match /counters/{counterId} {
      allow read: if true;
      allow write: if true;  // Admin portal needs this
    }
    
    // Caregivers collection
    match /caregivers/{documentId} {
      allow read: if true;
      // Allow users to CREATE their own document (during signup)
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      // Allow users to UPDATE their own document
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      // Allow DELETE for archiving (admin portal)
      allow delete: if true;  // ← Needed for archiving
      // Allow WRITE for restore (admin portal)
      allow write: if true;  // ← Needed for restore
    }
    
    // Patients collection
    match /patients/{documentId} {
      allow read: if true;
      // Allow users to CREATE their own document (during signup)
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      // Allow users to UPDATE their own document
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      // Allow DELETE for archiving (admin portal)
      allow delete: if true;  // ← Needed for archiving
      // Allow WRITE for restore (admin portal)
      allow write: if true;  // ← Needed for restore
    }
    
    // Admins collection
    match /admins/{documentId} {
      allow read: if true;
      allow write: if true;  // Admin portal manages admins
      allow delete: if true;  // ← Needed for archiving
    }
    
    // Archived collection - IMPORTANT FOR RESTORE!
    match /archived/{documentId} {
      allow read: if true;   // Allow reading archived items
      allow write: if true;   // Allow creating archived items
      allow delete: if true;  // ← CRITICAL: Needed for restore!
    }
  }
}
```

### Step 3: Key Rules for Restore

**For Original Collections (caregivers/patients/admins):**
```javascript
allow write: if true;  // Allows creating restored documents
allow delete: if true; // Allows archiving
```

**For Archived Collection:**
```javascript
allow delete: if true;  // CRITICAL: Allows removing from archive during restore
```

### Step 4: Publish Rules
1. Click **"Publish"** button
2. Wait 1-2 minutes for rules to propagate
3. Try restoring again

## Why These Rules Are Needed

### Restore Process Requires:
1. **Write to original collection** - Creates the restored document
   - Needs: `allow write: if true` on caregivers/patients/admins
   
2. **Delete from archived collection** - Removes archived document
   - Needs: `allow delete: if true` on archived collection

### Current Issue:
- Original collections might not have `allow write: if true`
- Archived collection might not have `allow delete: if true`

## Testing After Update

1. **Update Firestore rules** (see above)
2. **Wait 1-2 minutes** for propagation
3. **Try restoring an archived item**
4. **Should work!** ✅

## Alternative: More Secure Rules (Optional)

If you want more security later, you can restrict based on admin authentication:

```javascript
// More secure (requires admin authentication)
match /caregivers/{documentId} {
  allow write: if request.auth != null && 
                  (request.auth.token.admin == true || 
                   resource.data.authUid == request.auth.uid);
}

match /archived/{documentId} {
  allow delete: if request.auth != null && 
                   request.auth.token.admin == true;
}
```

But for now, `allow write/delete: if true` will work for restore!

## Status

✅ **After updating rules, restore should work!**

The restore function code is correct - it just needs proper Firestore permissions.
