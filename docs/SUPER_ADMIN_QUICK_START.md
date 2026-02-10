# Super Admin Quick Start Guide

## 🎯 What Was Implemented

A **fixed super admin account** stored in **Firestore** with:
- ✅ Fixed username: `superadmin`
- ✅ Fixed password: `SuperAdmin@2024`
- ✅ Stored in Firestore `admins` collection
- ✅ **Hidden from Admin Account Management** - Super admin cannot see their own account
- ✅ Automatically created on first login

## 🔑 Login Credentials

**Super Admin:**
- **Username:** `superadmin`
- **Password:** `SuperAdmin@2024`

## 📍 Where It's Stored

**Firestore Database:**
- **Collection:** `admins`
- **Document ID:** `SUPER_ADMIN_FIXED`
- **Fields:**
  - `username`: "superadmin"
  - `password`: "SuperAdmin@2024"
  - `role`: "SUPER_ADMIN"
  - `isFixed`: true
  - `isProtected`: true

## 🔒 How It Works

### 1. **Login**
- Enter username: `superadmin`
- Enter password: `SuperAdmin@2024`
- System checks Firestore
- If credentials match → Login as SUPER_ADMIN

### 2. **Admin Account Management**
- Super admin goes to Admin Account Management page
- **Their own account is automatically filtered out**
- Only sees regular admin accounts
- Can add/edit/delete regular admins

### 3. **Automatic Initialization**
- On first login, super admin is created in Firestore
- Happens automatically in the background
- No manual setup needed

## 🛠️ Change the Password

Edit `src/utils/firestoreService.js`:

```javascript
const SUPER_ADMIN_CREDENTIALS = {
  USERNAME: 'superadmin',
  PASSWORD: 'YourNewPassword123!', // ← Change this
  DOC_ID: 'SUPER_ADMIN_FIXED'
};
```

After changing, the next login will update Firestore with the new password.

## ✅ Test It

1. **Login:**
   - Username: `superadmin`
   - Password: `SuperAdmin@2024`
   - Should login successfully

2. **Check Admin Account Management:**
   - Go to Admin Account Management
   - ✅ Should NOT see the super admin account
   - ✅ Should only see regular admins (if any)

3. **Check Firestore:**
   - Go to Firebase Console → Firestore Database
   - Open `admins` collection
   - ✅ Should see document: `SUPER_ADMIN_FIXED`
   - ✅ Should have username: `superadmin`

## 📝 Summary

✅ **Super admin in Firestore** - Not in localStorage  
✅ **Fixed credentials** - Username and password are fixed  
✅ **Hidden from list** - Super admin doesn't see their own account  
✅ **Auto-created** - Created automatically on first use  

Your super admin is ready to use! 🚀
