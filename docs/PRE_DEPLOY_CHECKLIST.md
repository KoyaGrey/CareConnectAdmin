# Before deploying CareConnect Admin to Vercel

Do these **before** you create the new Vercel project and deploy.

---

## 1. CareConnect API (care-connect-android on Vercel)

- [ ] **CORS** is added to `api/sendVerificationEmail` so the admin portal (your new URL) can call it.  
  See `docs/VERCEL_API_CORS_ADD.txt`.
- [ ] **Redeploy** that project after adding CORS so the change is live.

---

## 2. Firebase

- [ ] **Firestore rules** include `pending_admins` (you already did this).
- [ ] **Firebase config** in `frontend/src/utils/firebase.js` is correct for production (same project; no change needed if it already works locally).

---

## 3. Repo and build

- [ ] Code is committed and pushed (if you connect Vercel to Git).
- [ ] **Build works locally:** in `frontend` run:
  ```bash
  npm run build
  ```
  Fix any errors before deploying.

---

## 4. What you’ll do in the new Vercel project (when you deploy)

When you create the **new** project for CareConnect Admin:

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` (if your repo has a `frontend` folder at the root) |
| **Build Command** | `npm run build` (Vercel usually detects this) |
| **Output Directory** | `dist` (Vite default; Vercel usually detects this) |

**Environment variables** to add in that project:

| Name | Value |
|------|--------|
| `VITE_VERIFICATION_EMAIL_API_URL` | `https://care-connect-android.vercel.app/api/sendVerificationEmail` |
| `VITE_VERIFICATION_EMAIL_API_KEY` | (only if your API requires it) |

*(Do not commit `.env` to Git; it’s in `.gitignore`. Add these in Vercel → Project → Settings → Environment Variables.)*

---

## 5. After first deploy

- [ ] Open the deployed URL and log in (e.g. superadmin).
- [ ] Add a test admin and check that the verification email is sent.
- [ ] Click the link in the email (or copy from the success message) and confirm it opens the deployed site and verification works.

---

## Quick order

1. Add CORS to care-connect-android API → redeploy that project.  
2. Run `npm run build` in `frontend` and fix any errors.  
3. Create new Vercel project → set Root Directory to `frontend` → add env vars → deploy.  
4. Test login, add admin, and verification flow on the deployed URL.
