# Reset Admin Counter to Start Sequential IDs from AD-001

## Problem
The admin counter in Firestore is currently at a high value (2604), causing new admins to get IDs like `AD-2604` instead of sequential IDs starting from `AD-001`.

## Solution

You have two options:

### Option 1: Reset Counter to 0 (Start Fresh)
This will make the next admin get `AD-001`, regardless of existing admins.

**Steps:**
1. Go to **Firebase Console → Firestore Database**
2. Navigate to `counters` collection
3. Find the `admins` document
4. Edit the document and change `count` to `0`
5. Save

**OR use the browser console in your admin portal:**

```javascript
// Open browser console (F12) and run:
import { doc, setDoc } from 'firebase/firestore';
import { db } from './src/utils/firebase';

const counterRef = doc(db, 'counters', 'admins');
await setDoc(counterRef, { count: 0 });
console.log('Counter reset to 0');
```

### Option 2: Set Counter Based on Existing Admins (Recommended)
This will set the counter to match the highest existing sequential admin ID, so the next admin gets the correct next number.

**Steps:**
1. Go to **Firebase Console → Firestore Database**
2. Navigate to `admins` collection
3. Find the highest sequential ID (e.g., if you have `AD-001`, `AD-002`, `AD-003`, the highest is `3`)
4. Go to `counters` collection → `admins` document
5. Set `count` to that number (e.g., `3`)
6. Save

**Next admin created will get:** `AD-004`

## Quick Fix (Manual)

1. **Open Firebase Console**
2. **Go to Firestore Database**
3. **Click on `counters` collection**
4. **Click on `admins` document**
5. **Change the `count` field to `0`**
6. **Click "Update"**

The next admin you create will get `AD-001`!

## Verify

After resetting:
1. Create a new admin account
2. Check the admin ID - it should be `AD-001` (or the next sequential number)
3. Create another admin - should be `AD-002`

## Note

- Existing admins with old IDs (like `AD-2604`) will keep their IDs
- Only **new** admins will get sequential IDs starting from the counter value
- The counter automatically increments each time you create a new admin
