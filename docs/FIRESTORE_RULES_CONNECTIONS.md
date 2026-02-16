# Firestore Rules: Allowing Admin to Read Connections

The admin dashboard needs to **read** the `connections` collection to show "Connected Patient" / "Connected Caregiver" in account details.

## Why "No patient connected" appeared

If your rule for `connections` looks like this:

```txt
allow read: if request.auth != null
  && (resource.data.caregiverId == request.auth.uid
      || resource.data.patientId == request.auth.uid);
```

then **only the caregiver or the patient** on that connection can read each document. The admin portal is signed in as an **admin** user (different Firebase Auth UID). So when the dashboard runs a query on `connections`, Firestore denies read on every document and the query returns empty — hence "No patient connected" even when the device shows connected.

## Fix: Allow authenticated users to read connections

Update the `connections` block so that **any authenticated user** can read (admin, caregiver, and patient can all read connection docs). Create/update/delete stay restricted to caregiver and patient.

**Replace** your current `connections` block with:

```txt
// Connections: caregiver–patient links (QR code flow)
match /connections/{connectionId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.caregiverId == request.auth.uid;
  allow update, delete: if request.auth != null
    && (resource.data.caregiverId == request.auth.uid
        || resource.data.patientId == request.auth.uid);
}
```

Only the **read** rule is changed: from "caregiver or patient on this doc" to "any logged-in user". Create/update/delete are unchanged.

After you deploy these rules, the admin dashboard’s query on `connections` will succeed and "Connected Patient" / "Connected Caregiver" will show correctly.

## Optional: Restrict read to admins only

If you want only admins to read connections (not every authenticated user), you need a way for rules to know "this UID is an admin". For example:

1. Create a collection that maps **auth UID → admin**, e.g. `admin_auth/{authUid}` with a document for each admin’s Firebase Auth UID.
2. In the `connections` rule, use `get()` to check that document:

```txt
allow read: if request.auth != null
  && (resource.data.caregiverId == request.auth.uid
      || resource.data.patientId == request.auth.uid
      || get(/databases/$(database)/documents/admin_auth/$(request.auth.uid)).data != null);
```

You would need to create/update `admin_auth/{uid}` when admins are added (e.g. in your admin-creation flow). The simpler approach above (allow read for any authenticated user) is usually enough if only your app’s users sign in.
