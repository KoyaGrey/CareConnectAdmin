# Backend

Reserved for backend code (e.g. Firebase Cloud Functions, Node/Express API).

**Run from this folder:**
- `npm run dev` – development (add your dev command in `package.json`)
- `npm start` – production start (add your start command in `package.json`)

The CareConnect Admin app currently uses **Firebase / Firestore** from the frontend. When you add a backend, update the scripts in `package.json` and run:

```bash
cd backend
npm install   # when you add dependencies
npm run dev   # or npm start
```
