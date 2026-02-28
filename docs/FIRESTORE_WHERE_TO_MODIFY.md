# Where to modify Firestore data

## In the app (admin portal)

- **Admin accounts:** Super Admin → **Admin Account Management**. Use **Edit** on an admin to change name, email, username, or password. Use **Add Admin** to create new admins (with email verification).
- **Super admin profile/password:** Log in as super admin → click your name (top right) → **Edit Profile**. You can change name, email, and password.
- **Caregivers / Patients / Archive:** Use the respective Super Admin pages (Caregivers, Patients, Archive) to view, archive, or restore. You do not edit Firestore documents by hand for these unless you need a one-off fix.

## In Firebase Console (manual edits)

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Open **Build** → **Firestore Database**.
3. Navigate to the collection (e.g. `admins`, `caregivers`, `patients`, `archived`, `pending_admins`).
4. Open a document and edit fields. **Save** when done.

Use this when you need to fix data by hand (e.g. typo in email, or restore a field). For passwords, prefer changing them via the admin portal (Edit Profile or Edit Admin) so they are hashed correctly.

---

## Passwords are stored hashed (hidden)

Admin and pending-admin **passwords are hashed** (SHA-256) before being saved to Firestore. So:

- In **Firestore** (Firebase Console) you will see a long hex string (64 characters) in the `password` field, not the actual password. That is intentional so passwords are not visible.
- **Changing a password** should be done in the app: **Edit Profile** (for super admin) or **Edit** on an admin in Admin Account Management. Do not paste a new plain password into Firestore; the app expects a hash there.
- **Legacy:** If a document still has a plain-text password (from before this change), login continues to work. The next time that admin’s password is updated via the app, it will be stored hashed.

Summary: you can modify Firestore in the **admin portal** (preferred) or in the **Firebase Console** for one-off fixes. Passwords are hidden in Firestore because they are stored as hashes.
