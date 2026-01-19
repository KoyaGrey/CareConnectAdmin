# Test Super Admin Login

## Quick Test Steps

1. **Open your browser's Developer Tools:**
   - Press `F12` or right-click → Inspect
   - Go to **Console** tab

2. **Try to login:**
   - Username: `superadmin`
   - Password: `SuperAdmin@2024`
   - Click Login

3. **Check the Console for these messages:**
   - ✅ "Starting authentication..."
   - ✅ "Attempting login with username: superadmin"
   - ✅ "Super admin username matched, checking password..."
   - ✅ "Super admin password matched! Authenticating..."
   - ✅ "Authentication successful. Role: SUPER_ADMIN"
   - ✅ "Login success: SUPER_ADMIN"

4. **If you see errors, look for:**
   - ❌ "Super admin password mismatch"
   - ❌ "Authentication error: ..."
   - ❌ "Cannot connect to database"
   - ❌ "Permission denied"

## Common Issues

### Issue: "Super admin password mismatch"

**Check:**
- Are you typing: `SuperAdmin@2024` (exact, no spaces)
- Password is case-sensitive
- Make sure no extra characters

### Issue: "Cannot connect to database"

**Check:**
1. Open `src/utils/firebase.js`
2. Verify `appId` is correct (should be web app ID)
3. Check browser console for Firebase errors

### Issue: "Permission denied"

**Check Firestore Rules:**
- Go to Firebase Console → Firestore → Rules
- Make sure `admins` collection allows read/write

## Manual Test in Console

Open browser console and type:

```javascript
// Test if credentials are correct
const username = 'superadmin';
const password = 'SuperAdmin@2024';
console.log('Username match:', username === 'superadmin');
console.log('Password match:', password === 'SuperAdmin@2024');
```

Both should return `true`.

## Still Not Working?

Please share:
1. **All console messages** (copy/paste or screenshot)
2. **Any error messages** shown
3. **What happens** when you click Login (does it show an alert? does nothing happen?)

This will help me fix it!
