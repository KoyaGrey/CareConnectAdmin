# Admin email verification

When a superadmin adds an admin (full name, email, username, password, confirm password), the account is created as **pending**. A verification email is sent to the admin's email. After the admin clicks **Verify email** in that message, the account is activated and appears in the Admin Accounts list.

## Flow

1. Superadmin fills the form and clicks **Add Admin**.
2. A document is saved in the **`pending_admins`** collection (token as document ID).
3. The app sends a verification email (if the API is configured) with a link:  
   `https://your-domain.com/verify-admin?token=...`
4. The admin opens the link and lands on the **Verify Admin** page. The app looks up the token, creates the admin in **`admins`**, and marks the pending doc as verified.
5. The admin can then log in with username/password.

## Sending the verification email

The app calls the **same API** as the CareConnect app: POST body `{ email, verification_link, token, role: "admin" }`.

- Set **`VITE_VERIFICATION_EMAIL_API_URL`** in your `.env` to your API URL (e.g. your Vercel serverless endpoint that uses `api/sendVerificationEmail.js`).
- Optional: **`VITE_VERIFICATION_EMAIL_API_KEY`** for `X-API-Key` header if your API requires it.

If the URL is not set, the verification email is not sent. The success modal will still show, and you can copy the verification link from the browser console or from the modal message (if we show it when send fails) and send it to the admin manually.

## Firestore rules

Allow the admin portal to read/write **`pending_admins`** (e.g. only from your admin app or via your backend). Example (adjust to your auth model):

```
match /pending_admins/{token} {
  // Allow read for anyone with the token (used by verify-admin page; token is secret).
  allow get: if true;
  allow list: if false;
  allow create: if true;  // Or restrict to your admin/superadmin logic
  allow update, delete: if true;  // Or restrict
}
```

Ensure **`admins`** rules still allow creating new documents when the verify page completes (or use a Cloud Function to create the admin after verification).
