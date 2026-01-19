# Super Admin Login Troubleshooting

## Current Credentials

- **Username:** `superadmin`
- **Password:** `SuperAdmin@2024`

## Common Issues & Solutions

### Issue 1: "Invalid username or password"

**Possible Causes:**
1. Firebase not connected
2. Firestore rules blocking access
3. Password mismatch
4. Browser console errors

**Solutions:**

#### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages
5. Share the error with me

#### Check Firebase Connection
1. Open browser DevTools → Console
2. Look for Firebase errors
3. Check if `appId` is correct in `src/utils/firebase.js`
4. Verify Firestore is accessible

#### Verify Password
- Make sure you're typing: `SuperAdmin@2024`
- Check for typos
- Make sure no extra spaces

### Issue 2: Firebase Connection Error

**Error:** "Cannot connect to database"

**Solution:**
1. Check `src/utils/firebase.js`
2. Verify `appId` is from **Web App** (not Android)
3. Check Firestore security rules allow read access

### Issue 3: Firestore Rules Blocking

**Error:** "Permission denied"

**Solution:**
Update Firestore rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Quick Test

1. **Open Browser Console** (F12)
2. **Try to login** with:
   - Username: `superadmin`
   - Password: `SuperAdmin@2024`
3. **Check Console** for:
   - "Attempting login with username: superadmin"
   - "Authentication successful. Role: SUPER_ADMIN"
   - Any error messages

## Manual Check

### Check if Super Admin Exists in Firestore

1. Go to Firebase Console
2. Open Firestore Database
3. Check `admins` collection
4. Look for document: `SUPER_ADMIN_FIXED`
5. Verify:
   - `username`: "superadmin"
   - `password`: "SuperAdmin@2024"

### If Document Doesn't Exist

The system should create it automatically, but if it doesn't:

1. Manually create it in Firebase Console:
   - Collection: `admins`
   - Document ID: `SUPER_ADMIN_FIXED`
   - Fields:
     - `username`: "superadmin"
     - `password`: "SuperAdmin@2024"
     - `role`: "SUPER_ADMIN"
     - `name`: "Super Administrator"
     - `email`: "superadmin@careconnect.com"
     - `isFixed`: true
     - `isProtected`: true
     - `status`: "Active"

## Debug Steps

1. **Check Console Logs:**
   - Open DevTools → Console
   - Try to login
   - Look for log messages starting with "Attempting login" or "Authentication"

2. **Check Network Tab:**
   - Open DevTools → Network
   - Try to login
   - Look for Firestore requests
   - Check if they're failing

3. **Verify Firebase Config:**
   - Check `src/utils/firebase.js`
   - Make sure `appId` is correct
   - Should start with: `1:713688982594:web:`

4. **Test Firestore Connection:**
   - Open browser console
   - Type: `firebase` (if Firebase is loaded)
   - Check for errors

## Still Not Working?

Please share:
1. **Browser console errors** (screenshot or copy text)
2. **Network tab errors** (if any)
3. **What happens** when you click Login
4. **Any error messages** shown to user

This will help me identify the exact issue!
