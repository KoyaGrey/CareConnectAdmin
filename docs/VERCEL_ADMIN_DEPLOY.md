# Deploy CareConnect Admin to Vercel

Use this to put the **admin portal** online so the verification link in emails works. This is a **new** Vercel project (separate from care-connect-android).

---

## Step 1: Open Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New** → **Project**.

---

## Step 2: Import your repo

1. If your CareConnectAdmin code is on **GitHub/GitLab/Bitbucket**, connect that account if needed, then **Import** the **CareConnectAdmin** repository.
2. If the code is only on your PC, push it to GitHub first, then import that repo in Vercel.

---

## Step 3: Configure the project

Vercel will detect the repo. You must set the **root** so it builds the frontend:

1. Find **Root Directory**.
2. Click **Edit** and set it to: **`frontend`**
3. Leave **Build Command** as `npm run build` (default).
4. Leave **Output Directory** as `dist` (Vite default).

---

## Step 4: Add environment variables

Before clicking Deploy:

1. Expand **Environment Variables** (or **Configure**).
2. Add these variables (same flow as CareConnect-Android email verification):

   | Name | Value | Notes |
   |------|--------|--------|
   | `VITE_VERIFICATION_EMAIL_API_URL` | `https://care-connect-android.vercel.app/api/sendVerificationEmail` | Same API as the CareConnect app (`api/sendVerificationEmail.js`). |
   | `VITE_VERIFICATION_EMAIL_API_KEY` | *(same as CareConnect Vercel)* | Copy the value of **ASSISTANCE_API_KEY** from the **CareConnect-Android** Vercel project (Settings → Environment Variables). The admin app sends it as `X-API-Key`; the API rejects requests if it doesn’t match. |

If your CareConnect API uses a different URL, use that instead. The API key must always match the CareConnect project’s `ASSISTANCE_API_KEY`.

---

## Step 5: Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. Vercel will give you a URL, e.g. `https://careconnect-admin-xxx.vercel.app`.

---

## Step 6: Test

1. Open that URL and log in (e.g. as superadmin).
2. Add an admin and check that the verification email is sent (if the API + CORS are set up).
3. Open the link from the email (or use “Copy link” from the pending section). It should open your **deployed** admin URL and the verify page.

---

## Checklist

| Step | Done |
|------|------|
| New Vercel project created | ☐ |
| Repo imported (CareConnectAdmin) | ☐ |
| Root Directory = `frontend` | ☐ |
| `VITE_VERIFICATION_EMAIL_API_URL` set | ☐ |
| `VITE_VERIFICATION_EMAIL_API_KEY` set (same as CareConnect `ASSISTANCE_API_KEY`) | ☐ |
| Deploy successful | ☐ |
| Login and add-admin tested on live URL | ☐ |

---

## Optional: Custom domain

In the Vercel project: **Settings** → **Domains** → add your domain (e.g. `admin.yoursite.com`). Then the verification link in emails can use that URL instead of `*.vercel.app`.
