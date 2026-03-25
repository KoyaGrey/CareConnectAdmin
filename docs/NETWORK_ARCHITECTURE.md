# CareConnect Admin — Network Architecture

This document describes how components of the **CareConnect Admin** project connect over the network. Diagrams use [Mermaid](https://mermaid.js.org/) (render in GitHub, VS Code, or [mermaid.live](https://mermaid.live)).

---

## 1. High-level network view

The admin portal is a **browser-based SPA** that talks mostly **directly to Google Firebase**. A small **Node** server exists for health checks only. Admin verification email may go through an **optional HTTP API** (e.g. on Vercel) to EmailJS.

```mermaid
flowchart TB
  subgraph Clients["Clients"]
    Browser["Admin / Super Admin<br/>(React SPA, Vite)"]
    Mobile["CareConnect mobile app<br/>(same Firebase project)"]
  end

  subgraph Local["Developer machine (optional)"]
    DevFE["Vite dev server<br/>(e.g. :5173)"]
    NodeBE["Node backend<br/>(:3001 — health only)"]
  end

  subgraph Google["Google Cloud / Firebase"]
    FirebaseAuth["Firebase Authentication<br/>(Google Sign-In)"]
    Firestore["Cloud Firestore<br/>(admins, caregivers, patients, …)"]
    FStorage["Firebase Storage<br/>(optional: e.g. caregiver ID files)"]
  end

  subgraph Optional["Optional services"]
    VercelAPI["Verification email API<br/>(e.g. Vercel serverless)"]
    EmailJS["EmailJS<br/>(transactional email)"]
  end

  Browser -->|"HTTPS"| FirebaseAuth
  Browser -->|"HTTPS (Firestore SDK)"| Firestore
  Browser -.->|"HTTPS (if used)"| FStorage
  Browser -.->|"POST JSON + API key"| VercelAPI
  VercelAPI --> EmailJS

  Mobile -->|"HTTPS"| Firestore
  Mobile -.-> FirebaseAuth

  DevFE --> Browser
  NodeBE -.->|"Not used by SPA today"| Browser
```

---

## 2. Data flows (admin portal)

```mermaid
sequenceDiagram
  participant U as Admin browser
  participant FA as Firebase Auth
  participant FS as Cloud Firestore
  participant API as Email API (optional)

  Note over U,FS: Login — username/password
  U->>FS: Read admins collection, verify credentials
  U->>FS: Update lastActive on admin doc

  Note over U,FA: Login — Google
  U->>FA: signInWithPopup (Google)
  FA-->>U: ID token / user email
  U->>FS: getAdminByEmail, load role & profile

  Note over U,FS: Day-to-day (dashboard, lists, archive, logs)
  U->>FS: Real-time listeners & reads/writes<br/>(caregivers, patients, admins, logs, …)

  Note over U,API: New admin — email verification (if configured)
  U->>FS: Write pending_admins + token
  U->>API: POST verification email
  API-->>U: 200 OK
  U->>FS: After link: promote to admins
```

---

## 3. Deployment-style topology

Typical production layout (exact hosts depend on your setup):

```mermaid
flowchart LR
  subgraph Internet
    AdminUser[Admin users]
  end

  subgraph Host["Static hosting<br/>(Firebase Hosting, Netlify, Vercel, etc.)"]
    SPA[Built React app<br/>index.html + assets]
  end

  AdminUser -->|HTTPS| SPA
  SPA -->|wss/https Firestore & Auth| Firebase[(Firebase project)]

  subgraph OptionalProd["Optional"]
    EmailAPI[Verification email API]
  end
  SPA -->|HTTPS POST| EmailAPI
```

---

## 4. Legend

| Connection | Purpose |
|------------|---------|
| **Browser ↔ Firestore** | All admin data: caregivers, patients, admins, archive, connections, logs, pending admins. |
| **Browser ↔ Firebase Auth** | Google OAuth for admins linked by email in Firestore. |
| **Browser ↔ Email API** | Sends admin verification link (`VITE_VERIFICATION_EMAIL_API_URL`). |
| **Node :3001** | Health endpoint only; **not** on the critical path for the React app. |
| **Mobile app ↔ Firestore** | Same project; caregiver/patient docs updated from the field app. |

---

## Environment variables (network-related)

| Variable | Role |
|----------|------|
| `VITE_VERIFICATION_EMAIL_API_URL` | Base URL of the POST endpoint that triggers verification email. |
| `VITE_VERIFICATION_EMAIL_API_KEY` | `X-API-Key` for that API (when required). |

Firebase config is embedded in the frontend (`firebase.js`); Firestore security rules control who can read/write which collections.
