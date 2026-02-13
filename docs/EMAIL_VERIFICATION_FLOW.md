# Admin email verification flow (aligned with CareConnect-Android)

The admin portal uses the **same** email verification API and pattern as the CareConnect-Android app.

## CareConnect-Android flow (reference)

1. **Pending signup** – User signs up → data stored in Firestore `pending_signups` with doc ID = verification token (UUID). Fields: fullName, email, phone, password, role, verificationToken, expiresAt, createdAt, verified.
2. **Send email** – App calls Vercel API `api/sendVerificationEmail.js` with POST body: `{ email, verification_link, token, role }`. Optional header `X-API-Key` must match Vercel env `ASSISTANCE_API_KEY`. The API uses EmailJS to send the email.
3. **Verification link** – Link points to Firebase Hosting `verify.html?token=...&role=...`, which opens the Android app via deep link. The app’s `EmailVerificationActivity` reads `pending_signups` by token, creates the real account (caregiver/patient), and marks the pending doc as verified.

## Admin portal flow (same API, same pattern)

1. **Pending admin** – Superadmin adds an admin → data stored in Firestore `pending_admins` with doc ID = verification token (UUID). Fields: name, email, username, password, verificationToken, expiresAt, createdAt, verified, createdBy.
2. **Send email** – Admin app calls the **same** Vercel API with the **same** body shape: `{ email, verification_link, token, role: 'admin' }`. Same header `X-API-Key` (use `VITE_VERIFICATION_EMAIL_API_KEY` = CareConnect’s `ASSISTANCE_API_KEY`).
3. **Verification link** – Link points to the **admin portal** (e.g. `https://your-admin.vercel.app/verify-admin?token=...`). The `VerifyAdmin` page reads `pending_admins` by token, creates the real admin in `admins`, and marks the pending doc as verified.

## What you need to configure

| In CareConnect-Android Vercel project | In Admin portal (.env or Vercel) |
|-------------------------------------|-----------------------------------|
| `ASSISTANCE_API_KEY` (optional but recommended) | `VITE_VERIFICATION_EMAIL_API_KEY` = **same value** |
| – | `VITE_VERIFICATION_EMAIL_API_URL` = `https://care-connect-android.vercel.app/api/sendVerificationEmail` (or your CareConnect API URL) |

The EmailJS template (in CareConnect) receives `to_email`, `verification_link`, `token`, and `role`. For admins, `role` is `'admin'`; you can show “CareConnect Admin” in the template when `role === 'admin'` if you want.
