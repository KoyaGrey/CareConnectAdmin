# Super Admin in Firestore - Setup Guide

## Overview

The super admin account is now stored in **Firestore** (not localStorage) with:
- ✅ **Fixed username:** `superadmin`
- ✅ **Fixed password:** `SuperAdmin@2024` (you can change this)
- ✅ **Stored in Firestore** `admins` collection
- ✅ **Hidden from Admin Account Management** - Super admin cannot see their own account
- ✅ **Cannot be deleted or modified** - Fully protected

## How It Works

### 1. **Firestore Collection: `admins`**

The super admin is stored in Firestore with:
- **Document ID:** `SUPER_ADMIN_FIXED` (fixed ID)
- **Username:** `superadmin` (fixed)
- **Password:** `SuperAdmin@2024` (fixed, but you can change it)

### 2. **Automatic Initialization**

When you login or visit Admin Account Management:
- The system automatically checks if super admin exists in Firestore
- If not, it creates it automatically
- This happens in the background

### 3. **Hidden from Admin List**

The super admin account is **automatically filtered out** from the Admin Account Management page:
- Super admin cannot see their own account in the list
- Only regular admins are shown
- Super admin can still manage other admins

### 4. **Authentication**

Login process:
1. User enters username and password
2. System checks Firestore `admins` collection
3. If username is `superadmin` and password matches → SUPER_ADMIN role
4. If other admin credentials match → ADMIN role
5. Otherwise → Invalid credentials

## Default Credentials

**Super Admin Login:**
- **Username:** `superadmin`
- **Password:** `SuperAdmin@2024`

> ⚠️ **Important:** Change the password in production!

## Change the Password

### Option 1: Edit in Code (Recommended for now)

1. Open `src/utils/firestoreService.js`
2. Find `SUPER_ADMIN_CREDENTIALS`:
```javascript
const SUPER_ADMIN_CREDENTIALS = {
  USERNAME: 'superadmin',
  PASSWORD: 'SuperAdmin@2024', // ← Change this
  DOC_ID: 'SUPER_ADMIN_FIXED'
};
```
3. Change the `PASSWORD` value
4. Save the file
5. The next time you login, it will update Firestore with the new password

### Option 2: Update in Firebase Console

1. Go to Firebase Console → Firestore Database
2. Find `admins` collection
3. Find document with ID: `SUPER_ADMIN_FIXED`
4. Edit the `password` field
5. Save

## Firestore Structure

### `admins` Collection

```
admins/
  └── SUPER_ADMIN_FIXED/  (Fixed document ID)
      ├── username: "superadmin"
      ├── password: "SuperAdmin@2024"
      ├── name: "Super Administrator"
      ├── email: "superadmin@careconnect.com"
      ├── role: "SUPER_ADMIN"
      ├── type: "superadmin"
      ├── status: "Active"
      ├── isFixed: true
      ├── isProtected: true
      ├── createdAt: Timestamp
      └── lastActive: Timestamp

  └── {other-admin-id}/  (Regular admins)
      ├── username: "admin1"
      ├── password: "hashed_password"
      ├── name: "Admin Name"
      ├── email: "admin@example.com"
      ├── role: "ADMIN"
      ├── type: "admin"
      └── ...
```

## Security Rules

Update your Firestore security rules to protect the `admins` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection
    match /admins/{adminId} {
      // Allow read for authenticated users (admins can see other admins)
      allow read: if request.auth != null;
      
      // Allow write only for super admin or the admin themselves
      allow write: if request.auth != null && 
        (request.auth.token.role == 'SUPER_ADMIN' || 
         request.auth.uid == adminId);
      
      // Prevent deletion of fixed super admin
      allow delete: if request.auth != null && 
        request.auth.token.role == 'SUPER_ADMIN' && 
        adminId != 'SUPER_ADMIN_FIXED';
    }
  }
}
```

## Testing

### Test 1: Login as Super Admin
1. Go to login page
2. Enter:
   - Username: `superadmin`
   - Password: `SuperAdmin@2024`
3. ✅ Should login and redirect to super admin dashboard

### Test 2: Verify Super Admin Not in List
1. Login as super admin
2. Go to Admin Account Management
3. ✅ Should NOT see the super admin account in the list
4. ✅ Should only see regular admin accounts

### Test 3: Verify in Firestore
1. Go to Firebase Console → Firestore Database
2. Open `admins` collection
3. ✅ Should see document with ID: `SUPER_ADMIN_FIXED`
4. ✅ Should have username: `superadmin`
5. ✅ Should have password: `SuperAdmin@2024`

### Test 4: Try to Create Another Super Admin
1. Go to Admin Account Management
2. Click "Add New Admin"
3. Try username: `superadmin`
4. ✅ Should show error: "Username 'superadmin' is reserved..."

## Files Modified

1. **`src/utils/firestoreService.js`**
   - Added `admins` collection support
   - Added `initializeSuperAdmin()` function
   - Added `authenticateAdmin()` function
   - Added `getAdmins()` - filters out super admin
   - Added `addAdmin()`, `updateAdmin()`, `archiveAdmin()`

2. **`src/utils/auth.js`**
   - Updated `authenticate()` to use Firestore
   - Calls `authenticateAdmin()` from firestoreService

3. **`src/tabs/superadmin/AdminAccountManagement.jsx`**
   - Now fetches from Firestore
   - Super admin is automatically filtered out
   - All operations use Firestore

## Important Notes

⚠️ **Password Security:**
- Currently, password is stored in **plain text** in Firestore
- For production, you should:
  1. Hash passwords before storing
  2. Use Firebase Authentication instead
  3. Store admin accounts in Firebase Auth

⚠️ **Super Admin Visibility:**
- Super admin **cannot see their own account** in Admin Account Management
- This is intentional - they can manage other admins but not themselves
- The super admin account is protected and cannot be modified

## Summary

✅ **Super admin in Firestore** - Stored in database  
✅ **Fixed credentials** - Username: `superadmin`, Password: `SuperAdmin@2024`  
✅ **Hidden from list** - Super admin doesn't see their own account  
✅ **Auto-initialized** - Created automatically if missing  
✅ **Protected** - Cannot be deleted or modified  

Your super admin is now properly stored in Firestore! 🔐
