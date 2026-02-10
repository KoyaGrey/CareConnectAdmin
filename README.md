# CareConnect Admin

- **frontend/** – React (Vite) app. Run: `cd frontend` then `npm install` and `npm run dev`
- **backend/** – Backend code. Run: `cd backend` then `npm run dev` (or `npm start` when you add a server)
- **docs/** – Project and setup documentation

## Quick start

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:** (when you add backend code)
```bash
cd backend
npm install
npm run dev
```

## Removing the legacy `cla` folder

If the old **cla** folder is still present, remove it so only **frontend**, **backend**, and **docs** remain:

- **Option 1:** In PowerShell at the project root: `.\remove-cla.ps1`
- **Option 2:** In File Explorer, delete the **cla** folder (close the IDE/terminal first if the delete fails)
