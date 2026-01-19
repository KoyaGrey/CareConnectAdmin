# Create Firestore Database - Step by Step

## Step 1: Click "Create Database"

1. You should see a button that says **"Create database"**
2. Click it

## Step 2: Choose Security Rules

You'll see two options:
- **"Start in production mode"** - More secure, but requires rules setup
- **"Start in test mode"** - Less secure, but easier to start

**For now, choose: "Start in test mode"**

This will allow you to read/write data for 30 days, which is perfect for getting started.

## Step 3: Choose Location

1. Select a **location** for your database
2. Choose the location **closest to you** or your users
3. Common options:
   - `us-central` (United States)
   - `europe-west` (Europe)
   - `asia-southeast1` (Southeast Asia)
   - etc.

**Important:** Once you choose a location, you can't change it later (without creating a new database).

## Step 4: Enable

1. Click **"Enable"** or **"Create"** button
2. Wait for Firebase to create your database
3. This usually takes 1-2 minutes

## Step 5: After Creation

Once the database is created:

1. You'll see the **"Data"** tab (showing empty collections)
2. You'll see the **"Rules"** tab (this is what you need!)
3. Click on the **"Rules"** tab

## Step 6: Update Rules

In the Rules tab, you'll see test mode rules that look like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 31);
    }
  }
}
```

**Replace ALL of it** with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin portal to read all caregivers
    match /caregivers/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.id;
    }
    
    // Allow admin portal to read all patients
    match /patients/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.id;
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

## Step 7: Publish Rules

1. Click the **"Publish"** button (top right)
2. Wait for confirmation: "Rules published successfully"

## Step 8: Test Your Admin Portal

1. Go back to your admin portal
2. Refresh the page (Ctrl+F5)
3. Open browser console (F12)
4. You should see: "✅ Firestore connection successful!"
5. Data should now appear!

## Important Notes

- **Test mode** allows read/write for 30 days
- After 30 days, you'll need to update rules (or use production mode)
- The location you choose affects latency (choose closest to users)
- Once created, you can't change the location (but you can create a new database)

## After Database is Created

Your Android app should automatically start saving data to Firestore when users sign up. The admin portal will then be able to read that data!

## If You Get Errors

If you see any errors during creation:
1. Make sure you have billing enabled (Firestore requires a Blaze plan, but has a free tier)
2. Check your internet connection
3. Try refreshing the page and starting again

Let me know once you've created the database and we can test the admin portal!
