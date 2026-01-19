# How to Delete Accounts from Admin Portal

## Method: Delete Document in Firestore

To remove an account from the admin portal, you need to **delete the entire document** in Firestore Database.

## Steps

### Step 1: Go to Firestore Database
1. Go to: https://console.firebase.google.com/
2. Select project: `careconnect-42772`
3. Click **"Firestore Database"** in left sidebar
4. Click **"Data"** tab

### Step 2: Find the Account
1. Click on the collection:
   - **`caregivers`** - for caregiver accounts
   - **`patients`** - for patient accounts
2. Find the document (account) you want to delete
3. Click on the document to open it

### Step 3: Delete the Document
1. Click the **"Delete document"** button (usually at the top or in a menu)
2. Confirm deletion
3. The document will be removed

### Step 4: Verify Deletion
1. Go back to the collection view
2. The document should be gone
3. **The admin portal will automatically update** (no refresh needed!)

## Important Notes

- ✅ **Delete the entire document** - not just individual fields
- ✅ **Real-time update** - admin portal updates automatically
- ✅ **Works for both** caregivers and patients
- ⚠️ **Permanent** - deletion cannot be undone (unless you have backups)

## What Happens

1. You delete document in Firestore
2. Firestore sends update to all active listeners
3. Admin portal receives the update
4. Account disappears from the list automatically
5. Count updates automatically

## Alternative: Use Archive Feature

Instead of deleting, you can also:
- Use the **"Archive"** feature in the admin portal
- This moves accounts to the `archived` collection
- Accounts can be restored later if needed

## Summary

✅ **Delete document in Firestore → Automatically removed from admin portal**
- No refresh needed
- Works in real-time
- Simple and effective!
