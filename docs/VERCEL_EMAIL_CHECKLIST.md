# Vercel: Why verification email might not arrive

When you click **Add Admin** and the email never arrives, check the following.

---

## 1. See what the API actually did

- **In the admin portal:** After clicking **Add Admin**, check the **success/error message** in the modal. If the email API failed, you’ll now see the real error (e.g. `404`, `500`, or a message from the API).
- **In the browser:** Open **DevTools (F12) → Network**. Click **Add Admin** again. Find the request to `sendVerificationEmail` (or your API URL). Check:
  - **Status:** 200 = OK, 404 = wrong URL, 500 = server error, (failed) = often CORS.
  - **Response:** What the API returned (error message or body).

---

## 2. In Vercel (care-connect-android project)

### A) API route exists and path is correct

- In your **CareConnect Android** repo (the one deployed to [care-connect-android on Vercel](https://vercel.com/ezra-orizals-projects/care-connect-android)), you should have something like:
  - `api/sendVerificationEmail.js` or
  - `api/sendVerificationEmail/index.js`
- The admin portal calls:  
  `https://care-connect-android.vercel.app/api/sendVerificationEmail`  
  So the file must live under `api/` and the path must match. If your file is named differently (e.g. `sendEmail.js`), either rename it or change `VITE_VERIFICATION_EMAIL_API_URL` in the admin’s `.env` to match.

### B) Environment variables (email service)

- The API usually sends email via a service (EmailJS, SendGrid, Resend, etc.). Those need **API keys or secrets**.
- In Vercel: **Project → Settings → Environment Variables**.
- Add the variables your `sendVerificationEmail` code uses (e.g. `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, or the ones for your provider).
- **Redeploy** after adding or changing env vars (Vercel uses them at build/deploy time).

### C) CORS (calls from admin portal)

- The admin app runs on a **different origin** (e.g. `http://localhost:5173` or your admin domain). Browsers block cross-origin requests unless the API allows it.
- In your `api/sendVerificationEmail` (or equivalent), you must:
  - Send back header: `Access-Control-Allow-Origin: *` or your admin origin (e.g. `http://localhost:5173`).
  - Respond to **OPTIONS** (preflight) with 200 and the same CORS headers.
- If you don’t, the Network tab will show the request as **(failed)** or a CORS error, and the email won’t send.

### D) Check function logs

- In Vercel: **Project → Deployments → select latest → Logs** (or **Functions**).
- Trigger **Add Admin** again and see if the `sendVerificationEmail` function runs and what it logs (errors, “email sent”, etc.).

---

## 3. Quick checklist

| Check | Where |
|-------|--------|
| Modal shows the real error after Add Admin | Admin portal UI |
| Request to sendVerificationEmail in Network tab (status + response) | Browser DevTools → Network |
| `api/sendVerificationEmail.js` (or same path) exists in CareConnect repo | Your CareConnect Android / Vercel source |
| Env vars for email service (EmailJS, etc.) set in Vercel | Vercel → Settings → Environment Variables |
| CORS headers in API response (and OPTIONS handled) | Your `api/sendVerificationEmail` code |
| Redeploy after changing env vars | Vercel → Deployments |
| Function logs when you click Add Admin | Vercel → Deployments → Logs |

---

## 4. Request format the admin portal sends

The admin portal sends a **POST** with JSON:

```json
{
  "email": "newadmin@example.com",
  "verification_link": "https://your-admin-site.com/verify-admin?token=...",
  "token": "...",
  "role": "admin"
}
```

Your Vercel API must accept this (and optionally use `role === 'admin'` to change the email template). If the Android app sent different field names, the same API can support both by reading `email`, `verification_link`, and `token` from the body.
