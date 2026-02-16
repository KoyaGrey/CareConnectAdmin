# Block archived caregivers/patients from logging in (in the CareConnect app)

When an admin or superadmin **archives** a caregiver or patient in the admin portal, that user should **not** be able to log in to the **CareConnect app** (Android or web). This doc describes how the admin side works and what to implement in the app.

---

## What happens when admin archives a user

In the **admin portal** (this repo):

1. The user's document is **copied** to the **`archived`** collection (with all original fields plus `reason`, `archivedAt`, `originalCollection`, `originalId`).
2. The document is **deleted** from **`caregivers`** or **`patients`**.

So after archiving:

- **`caregivers`** / **`patients`**: the user's document **no longer exists**.
- **`archived`**: a document exists with the same data (e.g. `authUid`, `email`, `fullName`) and:
  - `originalCollection`: `"caregivers"` or `"patients"`
  - `originalId`: the previous document ID

---

## What the CareConnect app should do

The app (where **caregivers** and **patients** log in) should treat “archived” like the admin portal treats “inactive/archived” for admins: **block login and show a clear message**.

### Option A: “Profile not found” is enough (minimal)

1. User signs in with **Firebase Auth** (email/password or Google).
2. App loads the user’s profile from Firestore:
   - Caregiver: e.g. query **`caregivers`** where `authUid == FirebaseAuth.currentUser.uid` (or by email if that’s how you look up).
   - Patient: same idea for **`patients`**.
3. If **no document is found**:
   - **Sign the user out** (Firebase Auth sign out).
   - Show a message like: **“Your account is no longer active. Please contact your administrator.”**

Because archived users are **deleted** from `caregivers`/`patients`, they will get “no document” and can be blocked this way. You don’t have to query `archived` unless you want a specific “archived” message.

### Option B: Explicit “archived” check (recommended)

Same as above, but when no profile is found in **`caregivers`** or **`patients`**, **check the `archived` collection** so you can show a specific “archived” message.

1. User signs in with **Firebase Auth**.
2. App tries to load profile from **`caregivers`** or **`patients`** (by `authUid` or email, depending on role).
3. **If a document is found** → continue as normal (home screen, etc.).
4. **If no document is found**:
   - Query **`archived`** for a document where:
     - `originalCollection` is `"caregivers"` or `"patients"` (depending on app type), and  
     - `authUid == FirebaseAuth.currentUser.uid` (or match by email if you use email for lookup).
   - **If a document is found in `archived`**:
     - Sign the user out.
     - Show: **“Your account has been archived. Please contact your administrator.”**
   - **If no document is found in `archived`**:
     - Sign the user out.
     - Show: **“Account not found.”** (or your generic “no profile” message).

That way, archived users see a clear “archived” message; other “not found” cases can be handled separately.

---

## Firestore query for “is this user archived?” (app side)

Archived documents look like:

- `originalCollection`: `"caregivers"` or `"patients"`
- `originalId`: string (e.g. `"CG-001"`)
- `authUid`: same as in the original caregiver/patient doc (Firebase Auth UID)
- `email`, `fullName`, etc.: copied from the original doc

**Example (pseudo-code) for the app:**

- After sign-in, get `uid = FirebaseAuth.currentUser.uid`.
- Query:
  - Collection: **`archived`**
  - Where:  
    - `originalCollection` in `["caregivers", "patients"]` (or one of them if the app is caregiver-only or patient-only)  
    - `authUid` == `uid`
- If the query returns at least one document → user is archived → sign out and show “Your account has been archived…”.

If the app uses **email** instead of `authUid` for lookup, use the same idea but with an `email` field (archived docs also contain the original `email`).

---

## Firestore rules (app must be able to read `archived` for this)

For the app to query **`archived`** (to show “archived” message), your rules must allow the signed-in user to read the relevant archived doc. For example, you might allow read if the document’s `authUid` equals `request.auth.uid`. Your current rules may already allow `allow read: if true` on `archived`; if you tighten them later, keep a rule that lets the user read their own archived record (e.g. by `authUid` or email) so the “archived” check keeps working.

---

## Summary

| Where | What |
|-------|------|
| **Admin portal** | Already archives by moving the doc to `archived` and deleting from `caregivers`/`patients`. No change needed here. |
| **CareConnect app** | After Firebase Auth sign-in, if the user’s profile is not in `caregivers`/`patients`, either (A) treat as “no longer active” and sign out, or (B) check `archived` and if found, sign out and show “Your account has been archived.” |
| **Firestore rules** | Ensure the app can read the user’s own archived document (e.g. by `authUid` == `request.auth.uid`) if you use Option B. |

This mirrors the admin-portal flow where an inactive/archived admin cannot log in; the same idea is applied to caregivers and patients in the app.
