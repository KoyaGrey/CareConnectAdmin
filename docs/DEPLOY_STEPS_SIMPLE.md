# Deploy CareConnect Admin – Simple Steps

---

## PART A: Fix the email API (in your other project)

Your admin portal will call an API to send emails. That API lives in your **CareConnect Android** project on Vercel. You need to allow the admin site to call it.

**Where:** Open the **CareConnect Android** project (the one that has the send-verification-email code). Not the admin project.

**What to do:**

1. Find the file that sends the verification email. It is probably named something like:
   - `sendVerificationEmail.js`
   - or inside an `api` folder, e.g. `api/sendVerificationEmail.js`

2. Open that file. At the **very top** of the function that handles the request (often called `handler`), add these lines **before** any other code:

   ```
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

   if (req.method === 'OPTIONS') {
     return res.status(200).end();
   }
   ```

3. Save the file. Push to Git (or upload to Vercel) so that the CareConnect Android project **redeploys**. Wait until the deployment is finished.

**Why:** Without this, the browser will block the admin portal when it tries to send the email.

---

## PART B: Test that the admin app builds

**Where:** This project – CareConnectAdmin. Open a terminal in the **frontend** folder.

**What to do:**

1. Open terminal.
2. Go to the frontend folder:
   ```
   cd frontend
   ```
3. Run:
   ```
   npm run build
   ```
4. If you see "build complete" or similar with no red errors, you're good. If you see errors, fix them before deploying.

---

## PART C: Deploy the admin portal to Vercel

**Where:** [vercel.com](https://vercel.com) – create a **new** project (do not use the CareConnect Android project).

**What to do:**

1. Log in to Vercel.

2. Click **Add New** → **Project**.

3. Import your **CareConnectAdmin** repo (connect GitHub/GitLab if needed, then select the CareConnectAdmin repository).

4. **Important – set the folder:**
   - Find **Root Directory**. Click **Edit**.
   - Type: `frontend`
   - Confirm. This tells Vercel that the app to build is inside the `frontend` folder.

5. **Add environment variable:**
   - Before deploying, open **Environment Variables** (or **Configure**).
   - Add one variable:
     - **Name:** `VITE_VERIFICATION_EMAIL_API_URL`
     - **Value:** `https://care-connect-android.vercel.app/api/sendVerificationEmail`
   - Save.

6. Click **Deploy**. Wait until it finishes.

7. Open the URL Vercel gives you (e.g. `https://something.vercel.app`). Try logging in and adding an admin to test.

---

## Summary

| Part | What you're doing |
|------|-------------------|
| **A** | In CareConnect **Android** project: add 6 lines to the email API file, then redeploy that project. |
| **B** | In CareConnect **Admin** project: run `npm run build` in the `frontend` folder and fix any errors. |
| **C** | In Vercel: create a **new** project from CareConnectAdmin, set root to `frontend`, add the one env var, then deploy. |

If something is unclear, say which part (A, B, or C) and which step number, and we can go through it line by line.
