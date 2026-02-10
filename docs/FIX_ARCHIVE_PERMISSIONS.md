# Fix Archive Permission Issues

## Problem
Archive functionality is failing, likely due to Firestore security rules.

## Solution

### Step 1: Check Browser Console
1. Open browser console (F12)
2. Try to archive an account
3. Look for error messages
4. Common errors:
   - `permission-denied` - Firestore rules blocking access
   - `not-found` - Document doesn't exist
   - Other errors - Check the specific message

### Step 2: Update Firestore Security Rules

Go to **Firebase Console → Firestore Database → Rules**

Make sure you have these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Counters collection
    match /counters/{counterId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Caregivers collection
    match /caregivers/{documentId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      allow delete: if true;  // ← Allow deleting for archiving
    }
    
    // Patients collection
    match /patients/{documentId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.resource.data.authUid == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.authUid == request.auth.uid;
      allow delete: if true;  // ← Allow deleting for archiving
    }
    
    // Admins collection
    match /admins/{documentId} {
      allow read: if true;
      allow write: if true;
      allow delete: if true;  // ← Allow deleting for archiving
    }
    
    // Archived collection - IMPORTANT!
    match /archived/{documentId} {
      allow read: if true;   // ← Allow reading archived items
      allow write: if true;   // ← Allow writing (creating) archived items
      allow delete: if true;  // ← Allow deleting (for restore)
    }
  }
}
```

### Step 3: Key Rules to Check

1. **`archived` collection:**
   ```javascript
   match /archived/{documentId} {
     allow read, write, delete: if true;
   }
   ```

2. **Delete permissions on original collections:**
   ```javascript
   // For caregivers
   allow delete: if true;
   
   // For patients
   allow delete: if true;
   
   // For admins
   allow delete: if true;
   ```

### Step 4: Publish Rules

1. After updating rules, click **"Publish"**
2. Wait 1-2 minutes for rules to propagate
3. Try archiving again

## Common Issues

### Issue 1: Permission Denied on Archived Collection
**Error:** `PERMISSION_DENIED: Missing or insufficient permissions`

**Fix:** Add write permission to `archived` collection:
```javascript
match /archived/{documentId} {
  allow read, write: if true;
}
```

### Issue 2: Cannot Delete from Original Collection
**Error:** `PERMISSION_DENIED` when trying to delete

**Fix:** Add delete permission:
```javascript
match /caregivers/{documentId} {
  allow delete: if true;
}
```

### Issue 3: Archive Collection Doesn't Exist
**Note:** This is fine! The collection is created automatically when you add the first document. Just make sure rules allow writes.

## Testing

1. **Open browser console (F12)**
2. **Try to archive an account**
3. **Check console logs:**
   - Should see: "Starting archive process..."
   - Should see: "Adding to archived collection..."
   - Should see: "Successfully added to archived collection"
   - Should see: "Deleting from [collection]..."
   - Should see: "Successfully deleted..."
   - Should see: "[Type] archived successfully"

4. **If you see errors:**
   - Copy the error message
   - Check which step failed
   - Update Firestore rules accordingly

## Debug Steps

1. Check browser console for detailed error messages
2. Verify Firestore rules are published
3. Check if document exists before archiving
4. Verify `archived` collection rules allow writes
5. Verify original collection rules allow deletes

The code now has extensive logging - check the console to see exactly where it's failing!
