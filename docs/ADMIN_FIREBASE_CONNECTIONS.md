# CareConnect Admin: Firebase Structure for Caregiver–Patient Connections

This document explains how the CareConnect Admin web dashboard can read and display **Assigned Patient** for each caregiver. Connections are created by the Android app when a caregiver scans a patient's QR code—the admin does not assign; it only displays what devices/accounts are connected.

---

## Firebase Collections

### 1. `caregivers`
Each document has ID like `CG-001`, `CG-036`, etc.

| Field        | Type   | Description                    |
|-------------|--------|--------------------------------|
| documentId  | string | e.g. "CG-036"                  |
| fullName    | string | Caregiver name                 |
| email       | string | Caregiver email                |
| authUid     | string | Firebase Auth UID              |
| role        | string | "caregiver"                    |
| patients    | array  | List of patient doc IDs (e.g. `["PT-001"]`) |

### 2. `patients`
Each document has ID like `PT-001`, `PT-002`, etc.

| Field      | Type   | Description                      |
|------------|--------|----------------------------------|
| documentId | string | e.g. "PT-001"                    |
| fullName   | string | Patient name                     |
| email      | string | Patient email                    |
| authUid    | string | Firebase Auth UID                |
| role       | string | "patient"                        |
| caregivers | array  | List of caregiver doc IDs (e.g. `["CG-036"]`) |

### 3. `connections` (main table for admin display)

This is the primary source for **who is connected to whom**. One document per caregiver–patient pair.

| Field          | Type     | Description                        |
|----------------|----------|------------------------------------|
| caregiverId    | string   | Caregiver auth UID                 |
| caregiverDocId | string   | Caregiver document ID (e.g. CG-036)|
| caregiverName  | string   | Caregiver full name                |
| patientId      | string   | Patient auth UID                   |
| patientDocId   | string   | Patient document ID (e.g. PT-001)  |
| patientName    | string   | Patient full name                  |
| status         | string   | "connected"                        |
| connectedAt    | Timestamp| When the connection was created    |

**Document ID format:** `{caregiverAuthUid}_{patientAuthUid}`

---

## How to Get "Assigned Patient" for a Caregiver

To show "Assigned Patient" in the Caregiver Details modal (e.g. for CG-036):

### Option A: Query by caregiver document ID (recommended)

```javascript
// For caregiver CG-036
const connectionsRef = db.collection('connections');
const snapshot = await connectionsRef
  .where('caregiverDocId', '==', 'CG-036')
  .limit(1)
  .get();

if (snapshot.empty) {
  // Not assigned
  assignedPatient = 'Not assigned';
} else {
  const conn = snapshot.docs[0].data();
  assignedPatient = conn.patientName;  // or conn.patientDocId for ID
}
```

### Option B: Query by caregiver auth UID

```javascript
const snapshot = await db.collection('connections')
  .where('caregiverId', '==', caregiverAuthUid)
  .limit(1)
  .get();
```

---

## Summary for Admin Dashboard

| Caregiver state | Query result              | Display              |
|-----------------|---------------------------|----------------------|
| Has patient     | 1 connection document     | Patient name (e.g. "Juan Dela Cruz") |
| No patient      | Empty snapshot            | "Not assigned"       |

The same structure works in reverse: for a patient details view, query `connections` where `patientDocId == 'PT-001'` to get the assigned caregiver.

---

## Notes

- Connections are created/removed only by the Android app (QR scan / disconnect).
- The admin dashboard is read-only for connections; it just displays the current state from Firebase.
- Ensure Firestore rules or your backend (Firebase Admin SDK) allows the admin to read `caregivers`, `patients`, and `connections`.
