/**
 * Firestore Service
 * Handles all Firestore operations for the admin portal.
 * See the TABLE OF CONTENTS below to find functions by area (Caregivers, Patients, Archive, Admins, Logs).
 */

import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names (matching Android app)
const COLLECTIONS = {
  CAREGIVERS: 'caregivers',
  PATIENTS: 'patients',
  ARCHIVED: 'archived', // For archived accounts
  ADMINS: 'admins', // For admin portal accounts
  PENDING_ADMINS: 'pending_admins', // Admin accounts waiting for email verification
  LOGS: 'logs' // For system activity logs
};

// Fixed Super Admin Credentials
const SUPER_ADMIN_CREDENTIALS = {
  USERNAME: 'superadmin',
  PASSWORD: 'SuperAdmin@2024', // Fixed password - change this to your desired password
  DOC_ID: 'SUPER_ADMIN_FIXED' // Fixed document ID in Firestore
};

// -----------------------------------------------------------------------------
// TABLE OF CONTENTS (search for these section headers to jump to code)
// -----------------------------------------------------------------------------
// CAREGIVERS .......... getCaregivers, subscribeToCaregivers, getCaregiverById, updateCaregiver
// PATIENTS ............ getPatients, subscribeToPatients, getPatientById, updatePatient
// ARCHIVE ............. archiveCaregiver, archivePatient, subscribeToArchivedItems,
//                       removeDuplicateArchives, restoreArchivedItem
// ADMINS .............. initializeSuperAdmin, checkAdminAccountStatus, authenticateAdmin,
//                       getAdminByEmail, getAdmins, addAdmin, addPendingAdmin,
//                       getPendingAdminByToken, verifyPendingAdmin, getPendingAdmins,
//                       sendAdminVerificationEmail, updateAdmin, archiveAdmin, getCurrentAdminInfo
// LOGS ................ createLogEntry, getLogs, subscribeToLogs
// -----------------------------------------------------------------------------

// -------- CAREGIVERS --------

/**
 * Helper function to map caregiver data from Firestore
 */
const mapCaregiverData = (doc) => {
  const data = doc.data();
  return {
    id: doc.id, // Firebase document ID (now sequential: CG-001, CG-002, etc.)
    uid: data.authUid || doc.id, // Auth UID for linking to Firebase Auth
    documentId: data.documentId || doc.id, // Sequential ID (CG-001)
    name: data.fullName || data.name || 'Unknown',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status || 'Active',
    lastActive: data.lastActive?.toDate?.() ? 
      new Date(data.lastActive.toDate()).toLocaleString() : 
      (data.lastActive || 'Unknown'),
    assignedPatient: data.assignedPatient || 'Not assigned',
    type: 'caregiver',
    role: data.role || 'caregiver',
    createdAt: data.createdAt?.toDate?.() || null,
    idFileUrl: data.idFileUrl || null
  };
};

/**
 * Get all caregivers from Firestore (one-time fetch)
 * @returns {Promise<Array>} Array of caregiver documents
 */
export const getCaregivers = async () => {
  try {
    console.log('Fetching caregivers from Firestore...');
    const caregiversRef = collection(db, COLLECTIONS.CAREGIVERS);
    const snapshot = await getDocs(caregiversRef);
    
    console.log(`Found ${snapshot.docs.length} caregivers`);
    
    const caregivers = snapshot.docs.map(mapCaregiverData);
    
    return caregivers;
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    throw error;
  }
};

/**
 * Test Firestore connection
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    console.log('Database:', db);
    console.log('Collection name:', COLLECTIONS.CAREGIVERS);
    
    const caregiversRef = collection(db, COLLECTIONS.CAREGIVERS);
    console.log('Collection reference created:', caregiversRef);
    
    const snapshot = await getDocs(caregiversRef);
    console.log('✅ Firestore connection successful!');
    console.log(`Found ${snapshot.docs.length} documents in '${COLLECTIONS.CAREGIVERS}' collection`);
    
    if (snapshot.docs.length > 0) {
      console.log('Sample document:', snapshot.docs[0].id, snapshot.docs[0].data());
    }
    
    return { success: true, count: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('⚠️ PERMISSION DENIED - Check Firestore security rules!');
      console.error('Go to Firebase Console → Firestore → Rules');
      console.error('Add rule: allow read: if true; (for testing only)');
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Subscribe to real-time updates for caregivers
 * @param {Function} callback - Callback function that receives the caregivers array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCaregivers = (callback) => {
  try {
    console.log('Setting up real-time listener for caregivers...');
    console.log('Database:', db);
    console.log('Collection:', COLLECTIONS.CAREGIVERS);
    
    const caregiversRef = collection(db, COLLECTIONS.CAREGIVERS);
    console.log('Collection reference:', caregiversRef);
    
    let previousDocIds = new Set();
    let isFirstSnapshot = true;
    
    const unsubscribe = onSnapshot(
      caregiversRef,
      {
        includeMetadataChanges: true // Include metadata changes to catch all updates
      },
      (snapshot) => {
        const currentDocIds = new Set(snapshot.docs.map(doc => doc.id));
        const currentCount = snapshot.docs.length;
        
        console.log(`✅ Caregivers snapshot received: ${currentCount} documents`);
        console.log(`Snapshot metadata - fromCache: ${snapshot.metadata.fromCache}, hasPendingWrites: ${snapshot.metadata.hasPendingWrites}`);
        console.log(`Previous count: ${previousDocIds.size}, Current count: ${currentCount}`);
        
        // Skip comparison on first snapshot (all docs are "added")
        if (!isFirstSnapshot) {
          // Detect deletions by comparing with previous snapshot
          const deletedIds = [];
          previousDocIds.forEach((docId) => {
            if (!currentDocIds.has(docId)) {
              deletedIds.push(docId);
              console.log(`🗑️ Caregiver deleted (by comparison): ${docId}`);
            }
          });
          
          // Detect additions
          currentDocIds.forEach((docId) => {
            if (!previousDocIds.has(docId)) {
              const doc = snapshot.docs.find(d => d.id === docId);
              if (doc) {
                const data = doc.data();
                console.log(`➕ Caregiver added (by comparison): ${docId} (${data.fullName || data.name || 'Unknown'})`);
              }
            }
          });
        } else {
          console.log('📋 Initial snapshot - loading existing caregivers');
          isFirstSnapshot = false;
        }
        
        // Log document changes (additions, modifications, deletions)
        // This is the PRIMARY way to detect changes
        const changes = snapshot.docChanges();
        if (changes.length > 0) {
          console.log(`📊 Document changes detected: ${changes.length}`);
          changes.forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              console.log(`  ➕ Added: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
            } else if (change.type === 'modified') {
              const data = change.doc.data();
              console.log(`  ✏️ Modified: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
            } else if (change.type === 'removed') {
              const data = change.doc.data();
              console.log(`  🗑️ REMOVED: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
              console.log(`  ⚠️ This document should be removed from UI!`);
            }
          });
        } else if (!isFirstSnapshot) {
          console.log('📊 No document changes detected in this snapshot');
        }
        
        // Update previous document IDs for next comparison
        previousDocIds = new Set(currentDocIds);
        
        if (snapshot.docs.length === 0) {
          console.warn('⚠️ No caregivers found in Firestore!');
          console.warn('Possible reasons:');
          console.warn('1. No accounts created yet in Android app');
          console.warn('2. Firestore security rules blocking access');
          console.warn('3. Wrong collection name (check: "caregivers")');
          console.warn('4. Data in different Firebase project');
        } else {
          console.log(`📄 Current caregivers: ${snapshot.docs.length}`);
          console.log('Document IDs:', Array.from(currentDocIds));
        }
        
        const caregivers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapCaregiverData(doc);
        });
        
        console.log(`📤 Sending ${caregivers.length} caregivers to UI`);
        callback(caregivers);
      },
      (error) => {
        console.error('❌ Error in caregivers listener:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
          console.error('⚠️ PERMISSION DENIED!');
          console.error('Your Firestore security rules are blocking access.');
          console.error('Go to Firebase Console → Firestore Database → Rules');
          console.error('Temporary rule for testing:');
          console.error('  match /caregivers/{document=**} { allow read: if true; }');
          console.error('  match /patients/{document=**} { allow read: if true; }');
        }
        
        callback([]); // Return empty array on error
      }
    );
    
    console.log('✅ Listener set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up caregivers listener:', error);
    throw error;
  }
};

/**
 * Helper function to map patient data from Firestore
 */
const mapPatientData = (doc) => {
  const data = doc.data();
  return {
    id: doc.id, // Firebase document ID (now sequential: PT-001, PT-002, etc.)
    uid: data.authUid || doc.id, // Auth UID for linking to Firebase Auth
    documentId: data.documentId || doc.id, // Sequential ID (PT-001)
    name: data.fullName || data.name || 'Unknown',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status || 'Active',
    lastActive: data.lastActive?.toDate?.() ? 
      new Date(data.lastActive.toDate()).toLocaleString() : 
      (data.lastActive || 'Unknown'),
    type: 'patient',
    role: data.role || 'patient',
    createdAt: data.createdAt?.toDate?.() || null
  };
};

// -------- PATIENTS --------

/**
 * Get all patients from Firestore (one-time fetch)
 * @returns {Promise<Array>} Array of patient documents
 */
export const getPatients = async () => {
  try {
    console.log('Fetching patients from Firestore...');
    const patientsRef = collection(db, COLLECTIONS.PATIENTS);
    const snapshot = await getDocs(patientsRef);
    
    console.log(`Found ${snapshot.docs.length} patients`);
    
    const patients = snapshot.docs.map(mapPatientData);
    
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for patients
 * @param {Function} callback - Callback function that receives the patients array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPatients = (callback) => {
  try {
    console.log('Setting up real-time listener for patients...');
    console.log('Database:', db);
    console.log('Collection:', COLLECTIONS.PATIENTS);
    
    const patientsRef = collection(db, COLLECTIONS.PATIENTS);
    console.log('Collection reference:', patientsRef);
    
    let previousDocIds = new Set();
    let isFirstSnapshot = true;
    
    const unsubscribe = onSnapshot(
      patientsRef,
      {
        includeMetadataChanges: true // Include metadata changes to catch all updates
      },
      (snapshot) => {
        const currentDocIds = new Set(snapshot.docs.map(doc => doc.id));
        const currentCount = snapshot.docs.length;
        
        console.log(`✅ Patients snapshot received: ${currentCount} documents`);
        console.log(`Snapshot metadata - fromCache: ${snapshot.metadata.fromCache}, hasPendingWrites: ${snapshot.metadata.hasPendingWrites}`);
        console.log(`Previous count: ${previousDocIds.size}, Current count: ${currentCount}`);
        
        // Skip comparison on first snapshot (all docs are "added")
        if (!isFirstSnapshot) {
          // Detect deletions by comparing with previous snapshot
          const deletedIds = [];
          previousDocIds.forEach((docId) => {
            if (!currentDocIds.has(docId)) {
              deletedIds.push(docId);
              console.log(`🗑️ Patient deleted (by comparison): ${docId}`);
            }
          });
          
          // Detect additions
          currentDocIds.forEach((docId) => {
            if (!previousDocIds.has(docId)) {
              const doc = snapshot.docs.find(d => d.id === docId);
              if (doc) {
                const data = doc.data();
                console.log(`➕ Patient added (by comparison): ${docId} (${data.fullName || data.name || 'Unknown'})`);
              }
            }
          });
        } else {
          console.log('📋 Initial snapshot - loading existing patients');
          isFirstSnapshot = false;
        }
        
        // Log document changes (additions, modifications, deletions)
        // This is the PRIMARY way to detect changes
        const changes = snapshot.docChanges();
        if (changes.length > 0) {
          console.log(`📊 Document changes detected: ${changes.length}`);
          changes.forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              console.log(`  ➕ Added: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
            } else if (change.type === 'modified') {
              const data = change.doc.data();
              console.log(`  ✏️ Modified: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
            } else if (change.type === 'removed') {
              const data = change.doc.data();
              console.log(`  🗑️ REMOVED: ${change.doc.id} (${data.fullName || data.name || 'Unknown'})`);
              console.log(`  ⚠️ This document should be removed from UI!`);
            }
          });
        } else if (!isFirstSnapshot) {
          console.log('📊 No document changes detected in this snapshot');
        }
        
        // Update previous document IDs for next comparison
        previousDocIds = new Set(currentDocIds);
        
        if (snapshot.docs.length === 0) {
          console.warn('⚠️ No patients found in Firestore!');
          console.warn('Possible reasons:');
          console.warn('1. No accounts created yet in Android app');
          console.warn('2. Firestore security rules blocking access');
          console.warn('3. Wrong collection name (check: "patients")');
          console.warn('4. Data in different Firebase project');
        } else {
          console.log(`📄 Current patients: ${snapshot.docs.length}`);
          console.log('Document IDs:', Array.from(currentDocIds));
        }
        
        const patients = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapPatientData(doc);
        });
        
        console.log(`📤 Sending ${patients.length} patients to UI`);
        callback(patients);
      },
      (error) => {
        console.error('❌ Error in patients listener:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
          console.error('⚠️ PERMISSION DENIED!');
          console.error('Your Firestore security rules are blocking access.');
          console.error('Go to Firebase Console → Firestore Database → Rules');
          console.error('Temporary rule for testing:');
          console.error('  match /caregivers/{document=**} { allow read: if true; }');
          console.error('  match /patients/{document=**} { allow read: if true; }');
        }
        
        callback([]); // Return empty array on error
      }
    );
    
    console.log('✅ Listener set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up patients listener:', error);
    throw error;
  }
};

/**
 * Get a single caregiver by ID
 * @param {string} caregiverId - The caregiver document ID
 * @returns {Promise<Object|null>} Caregiver document or null
 */
export const getCaregiverById = async (caregiverId) => {
  try {
    const caregiverRef = doc(db, COLLECTIONS.CAREGIVERS, caregiverId);
    const caregiverSnap = await getDoc(caregiverRef);
    
    if (caregiverSnap.exists()) {
      const data = caregiverSnap.data();
      return {
        id: caregiverSnap.id,
        uid: caregiverSnap.id,
        name: data.fullName || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        status: 'Active',
        lastActive: data.lastActive || 'Unknown',
        assignedPatient: data.assignedPatient || 'Not assigned',
        type: 'caregiver',
        role: data.role || 'caregiver',
        createdAt: data.createdAt?.toDate?.() || null,
        idFileUrl: data.idFileUrl || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching caregiver:', error);
    throw error;
  }
};

/**
 * Get a single patient by ID
 * @param {string} patientId - The patient document ID
 * @returns {Promise<Object|null>} Patient document or null
 */
export const getPatientById = async (patientId) => {
  try {
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (patientSnap.exists()) {
      const data = patientSnap.data();
      return {
        id: patientSnap.id,
        uid: patientSnap.id,
        name: data.fullName || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        status: 'Active',
        lastActive: data.lastActive || 'Unknown',
        type: 'patient',
        role: data.role || 'patient',
        createdAt: data.createdAt?.toDate?.() || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

// -------- ARCHIVE --------

/**
 * Archive a caregiver (move to archived collection)
 * @param {string} caregiverId - The caregiver document ID
 * @param {string} reason - Reason for archiving
 * @returns {Promise<void>}
 */
export const archiveCaregiver = async (caregiverId, reason) => {
  try {
    console.log('Starting archive process for caregiver:', caregiverId);
    console.log('Reason:', reason);
    
    // Check if already archived (prevent duplicates)
    const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
    const existingArchiveQuery = query(
      archivedRef,
      where('originalCollection', '==', COLLECTIONS.CAREGIVERS),
      where('originalId', '==', caregiverId)
    );
    const existingArchiveSnap = await getDocs(existingArchiveQuery);
    
    if (!existingArchiveSnap.empty) {
      console.warn('Caregiver already archived, skipping duplicate archive');
      throw new Error('This caregiver is already archived. Please check the archive page.');
    }
    
    // Get the raw caregiver data from Firestore (not mapped)
    const caregiverRef = doc(db, COLLECTIONS.CAREGIVERS, caregiverId);
    const caregiverSnap = await getDoc(caregiverRef);
    
    if (!caregiverSnap.exists()) {
      throw new Error('Caregiver not found');
    }
    
    const caregiverData = caregiverSnap.data();
    console.log('Caregiver data retrieved:', Object.keys(caregiverData));
    
    // Add to archived collection with original Firestore data
    const archivedData = {
      ...caregiverData, // Raw Firestore data
      reason,
      archivedAt: Timestamp.now(),
      originalCollection: COLLECTIONS.CAREGIVERS,
      originalId: caregiverId
    };
    
    console.log('Adding to archived collection...');
    await addDoc(collection(db, COLLECTIONS.ARCHIVED), archivedData);
    console.log('Successfully added to archived collection');
    
    // Delete from caregivers collection
    console.log('Deleting from caregivers collection...');
    await deleteDoc(caregiverRef);
    console.log('Successfully deleted from caregivers collection');
    
    console.log('Caregiver archived successfully');
    
    // Log the archive action
    const caregiverName = caregiverData.fullName || caregiverData.name || caregiverId;
    createLogEntry('ARCHIVE', 'caregiver', caregiverId, caregiverName, {
      reason: reason,
      originalCollection: COLLECTIONS.CAREGIVERS
    }).catch(err => console.warn('Failed to log archive:', err));
  } catch (error) {
    console.error('Error archiving caregiver:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules for "archived" collection and "caregivers" collection.');
    } else if (error.message) {
      throw new Error(`Failed to archive caregiver: ${error.message}`);
    } else {
      throw new Error('Failed to archive caregiver. Please check browser console for details.');
    }
  }
};

/**
 * Archive a patient (move to archived collection)
 * @param {string} patientId - The patient document ID
 * @param {string} reason - Reason for archiving
 * @returns {Promise<void>}
 */
export const archivePatient = async (patientId, reason) => {
  try {
    console.log('Starting archive process for patient:', patientId);
    console.log('Reason:', reason);
    
    // Check if already archived (prevent duplicates)
    const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
    const existingArchiveQuery = query(
      archivedRef,
      where('originalCollection', '==', COLLECTIONS.PATIENTS),
      where('originalId', '==', patientId)
    );
    const existingArchiveSnap = await getDocs(existingArchiveQuery);
    
    if (!existingArchiveSnap.empty) {
      console.warn('Patient already archived, skipping duplicate archive');
      throw new Error('This patient is already archived. Please check the archive page.');
    }
    
    // Get the raw patient data from Firestore (not mapped)
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      throw new Error('Patient not found');
    }
    
    const patientData = patientSnap.data();
    console.log('Patient data retrieved:', Object.keys(patientData));
    
    // Add to archived collection with original Firestore data
    const archivedData = {
      ...patientData, // Raw Firestore data
      reason,
      archivedAt: Timestamp.now(),
      originalCollection: COLLECTIONS.PATIENTS,
      originalId: patientId
    };
    
    console.log('Adding to archived collection...');
    await addDoc(collection(db, COLLECTIONS.ARCHIVED), archivedData);
    console.log('Successfully added to archived collection');
    
    // Delete from patients collection
    console.log('Deleting from patients collection...');
    await deleteDoc(patientRef);
    console.log('Successfully deleted from patients collection');
    
    console.log('Patient archived successfully');
    
    // Log the archive action
    const patientName = patientData.fullName || patientData.name || patientId;
    createLogEntry('ARCHIVE', 'patient', patientId, patientName, {
      reason: reason,
      originalCollection: COLLECTIONS.PATIENTS
    }).catch(err => console.warn('Failed to log archive:', err));
  } catch (error) {
    console.error('Error archiving patient:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules for "archived" collection and "patients" collection.');
    } else if (error.message) {
      throw new Error(`Failed to archive patient: ${error.message}`);
    } else {
      throw new Error('Failed to archive patient. Please check browser console for details.');
    }
  }
};

/**
 * Map archived data to consistent format for display
 * @param {Object} data - Raw archived document data
 * @param {string} docId - Document ID
 * @returns {Object} Mapped archived item
 */
const mapArchivedData = (data, docId) => {
  // Determine type from originalCollection
  let type = 'unknown';
  if (data.originalCollection === COLLECTIONS.CAREGIVERS) {
    type = 'caregiver';
  } else if (data.originalCollection === COLLECTIONS.PATIENTS) {
    type = 'patient';
  } else if (data.originalCollection === COLLECTIONS.ADMINS) {
    type = 'admin';
  }
  
  // Get name - try different possible field names
  const name = data.fullName || data.name || 'Unknown';
  
  // Convert archivedAt timestamp properly
  let archivedAtDate = null;
  if (data.archivedAt) {
    if (data.archivedAt.toDate && typeof data.archivedAt.toDate === 'function') {
      // Firestore Timestamp object
      archivedAtDate = data.archivedAt.toDate();
    } else if (data.archivedAt instanceof Date) {
      // Already a Date object
      archivedAtDate = data.archivedAt;
    } else if (data.archivedAt.seconds) {
      // Timestamp with seconds property
      archivedAtDate = new Date(data.archivedAt.seconds * 1000);
    } else if (typeof data.archivedAt === 'string' || typeof data.archivedAt === 'number') {
      // String or number timestamp
      archivedAtDate = new Date(data.archivedAt);
    }
  }
  
  // Create mapped object for display
  const mapped = {
    id: docId,
    name: name,
    type: type,
    reason: data.reason || 'No reason provided',
    archivedAt: archivedAtDate,
    originalCollection: data.originalCollection || 'unknown',
    originalId: data.originalId || docId
  };
  
  // Include all original data for restore, but don't override mapped fields
  // This ensures restore has access to all original fields
  return {
    ...data, // Original Firestore data (for restore)
    ...mapped // Mapped fields (for display)
  };
};

/**
 * Subscribe to archived items with real-time updates
 * @param {Function} callback - Callback function that receives archived items array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToArchivedItems = (callback) => {
  const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
  
  const unsubscribe = onSnapshot(
    archivedRef,
    (snapshot) => {
      try {
        const archived = snapshot.docs.map(doc => {
          const data = doc.data();
          return mapArchivedData(data, doc.id);
        });
        console.log('Archived items mapped:', archived.length);
        callback(archived);
      } catch (error) {
        console.error('Error mapping archived data:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('Error in archived items listener:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

// (Archive section continues: removeDuplicateArchives, restoreArchivedItem)

/**
 * Remove duplicate archives (keeps the most recent one)
 * @param {string} originalCollection - The original collection name
 * @param {string} originalId - The original document ID
 * @returns {Promise<number>} Number of duplicates removed
 */
export const removeDuplicateArchives = async (originalCollection, originalId) => {
  try {
    const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
    const duplicateQuery = query(
      archivedRef,
      where('originalCollection', '==', originalCollection),
      where('originalId', '==', originalId)
    );
    
    const snapshot = await getDocs(duplicateQuery);
    
    if (snapshot.empty || snapshot.docs.length <= 1) {
      return 0; // No duplicates
    }
    
    // Sort by archivedAt (most recent first)
    const docs = snapshot.docs.sort((a, b) => {
      const aData = a.data().archivedAt;
      const bData = b.data().archivedAt;
      
      let aTime = 0;
      let bTime = 0;
      
      // Handle Firestore Timestamp
      if (aData?.toDate && typeof aData.toDate === 'function') {
        aTime = aData.toDate().getTime();
      } else if (aData?.seconds) {
        aTime = aData.seconds * 1000;
      } else if (aData instanceof Date) {
        aTime = aData.getTime();
      }
      
      if (bData?.toDate && typeof bData.toDate === 'function') {
        bTime = bData.toDate().getTime();
      } else if (bData?.seconds) {
        bTime = bData.seconds * 1000;
      } else if (bData instanceof Date) {
        bTime = bData.getTime();
      }
      
      return bTime - aTime; // Most recent first
    });
    
    // Keep the first (most recent), delete the rest
    const duplicatesToDelete = docs.slice(1);
    let deletedCount = 0;
    
    for (const duplicateDoc of duplicatesToDelete) {
      await deleteDoc(doc(db, COLLECTIONS.ARCHIVED, duplicateDoc.id));
      deletedCount++;
    }
    
    console.log(`Removed ${deletedCount} duplicate archives for ${originalId}`);
    return deletedCount;
  } catch (error) {
    console.error('Error removing duplicate archives:', error);
    throw error;
  }
};

/**
 * Restore an archived item back to its original collection
 * @param {string} archivedId - The archived document ID
 * @returns {Promise<void>}
 */
export const restoreArchivedItem = async (archivedId) => {
  try {
    console.log('Starting restore process for archived item:', archivedId);
    
    // Get the archived document
    const archivedRef = doc(db, COLLECTIONS.ARCHIVED, archivedId);
    const archivedSnap = await getDoc(archivedRef);
    
    if (!archivedSnap.exists()) {
      throw new Error('Archived item not found');
    }
    
    const archivedData = archivedSnap.data();
    console.log('Archived data retrieved:', Object.keys(archivedData));
    
    const originalCollection = archivedData.originalCollection;
    const originalId = archivedData.originalId;
    
    if (!originalCollection || !originalId) {
      throw new Error('Cannot restore: missing original collection or ID');
    }
    
    console.log('Restoring to:', originalCollection, 'with ID:', originalId);
    
    // Clean up the data - remove archive-specific and mapped fields
    const cleanedData = {};
    
    // List of fields to exclude (archive-specific and mapped display fields)
    // Note: For admins, 'name' is the actual Firestore field, not a mapped field
    // For caregivers/patients, we use 'fullName' in Firestore, so 'name' is mapped
    const excludeFields = [
      'reason',
      'archivedAt',
      'originalCollection',
      'originalId',
      'id', // Mapped field
      'type', // Mapped field
      'uid' // Mapped field
    ];
    
    // Only exclude 'name' for caregivers and patients (they use 'fullName' in Firestore)
    // For admins, 'name' is the actual field name, so we keep it
    if (originalCollection !== COLLECTIONS.ADMINS) {
      excludeFields.push('name'); // Mapped field (we use fullName in Firestore for caregivers/patients)
    }
    
    // Copy all fields except excluded ones
    for (const [key, value] of Object.entries(archivedData)) {
      if (!excludeFields.includes(key)) {
        cleanedData[key] = value;
      }
    }
    
    // CRITICAL: For admins, ensure 'name' field is preserved
    // If 'name' was excluded but this is an admin, restore it from archivedData
    if (originalCollection === COLLECTIONS.ADMINS) {
      if (archivedData.name && !cleanedData.name) {
        console.log('Restoring name field for admin:', archivedData.name);
        cleanedData.name = archivedData.name;
      }
      // Also check for fullName as fallback (in case it was stored that way)
      if (!cleanedData.name && archivedData.fullName) {
        console.log('Using fullName as name for admin:', archivedData.fullName);
        cleanedData.name = archivedData.fullName;
      }
    }
    
    console.log('Cleaned data fields:', Object.keys(cleanedData));
    console.log('Admin name in cleaned data:', cleanedData.name);
    console.log('Original archived data name:', archivedData.name);
    
    // Restore to original collection
    const originalRef = doc(db, originalCollection, originalId);
    
    // Check if document already exists (shouldn't, but safety check)
    const existingDoc = await getDoc(originalRef);
    if (existingDoc.exists()) {
      console.warn(`Document ${originalId} already exists in ${originalCollection}`);
      throw new Error(`Document ${originalId} already exists in ${originalCollection}. Cannot restore.`);
    }
    
    console.log('Creating document in original collection...');
    console.log('Document ID:', originalId);
    console.log('Collection:', originalCollection);
    console.log('Data to restore (name field):', cleanedData.name);
    
    // Final verification: For admins, ensure name field exists
    if (originalCollection === COLLECTIONS.ADMINS && !cleanedData.name) {
      console.error('WARNING: Admin restore data missing name field!');
      console.error('Archived data keys:', Object.keys(archivedData));
      console.error('Cleaned data keys:', Object.keys(cleanedData));
      console.error('Archived data name:', archivedData.name);
      console.error('Archived data fullName:', archivedData.fullName);
      
      // Try to get name from archivedData if it exists
      if (archivedData.name) {
        cleanedData.name = archivedData.name;
        console.log('Restored name from archivedData:', cleanedData.name);
      } else if (archivedData.fullName) {
        cleanedData.name = archivedData.fullName;
        console.log('Using fullName as name:', cleanedData.name);
      } else {
        console.error('ERROR: Cannot restore admin without name field!');
        throw new Error('Cannot restore admin: name field is missing from archived data.');
      }
    }
    
    // Create document in original collection with cleaned data
    await setDoc(originalRef, cleanedData);
    console.log('Successfully created document in original collection');
    console.log('Final restored data name:', cleanedData.name);
    
    // If there are duplicate archives for the same item, delete all of them
    const archivedCollection = collection(db, COLLECTIONS.ARCHIVED);
    const duplicateQuery = query(
      archivedCollection,
      where('originalCollection', '==', originalCollection),
      where('originalId', '==', originalId)
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    
    // Delete all duplicate archives
    const deletePromises = duplicateSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Deleted ${duplicateSnap.docs.length} archive entry/entries from archived collection`);
    
    console.log(`Successfully restored ${originalId} to ${originalCollection}`);
    
    // Log the restore action
    const entityName = archivedData.name || archivedData.fullName || originalId;
    // Map collection name to entity type (remove 's' from plural)
    const entityType = originalCollection === COLLECTIONS.ADMINS ? 'admin' :
                      originalCollection === COLLECTIONS.CAREGIVERS ? 'caregiver' :
                      originalCollection === COLLECTIONS.PATIENTS ? 'patient' : 'unknown';
    createLogEntry('RESTORE', entityType, originalId, entityName, {
      originalCollection: originalCollection,
      restoredFrom: 'archived'
    }).catch(err => console.warn('Failed to log restore:', err));
  } catch (error) {
    console.error('Error restoring archived item:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules for write access to the original collection and delete access to the archived collection.');
    } else if (error.message) {
      throw new Error(`Failed to restore item: ${error.message}`);
    } else {
      throw new Error('Failed to restore item. Please check browser console for details.');
    }
  }
};

/**
 * Update caregiver status or other fields
 * @param {string} caregiverId - The caregiver document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateCaregiver = async (caregiverId, updates) => {
  try {
    const caregiverRef = doc(db, COLLECTIONS.CAREGIVERS, caregiverId);
    await updateDoc(caregiverRef, updates);
    console.log('Caregiver updated successfully');
  } catch (error) {
    console.error('Error updating caregiver:', error);
    throw error;
  }
};

/**
 * Update patient status or other fields
 * @param {string} patientId - The patient document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updatePatient = async (patientId, updates) => {
  try {
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    await updateDoc(patientRef, updates);
    console.log('Patient updated successfully');
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// -------- ADMINS --------

/**
 * Initialize the fixed super admin in Firestore
 * Creates the super admin account if it doesn't exist
 * @returns {Promise<void>}
 */
export const initializeSuperAdmin = async () => {
  try {
    const superAdminRef = doc(db, COLLECTIONS.ADMINS, SUPER_ADMIN_CREDENTIALS.DOC_ID);
    const superAdminSnap = await getDoc(superAdminRef);
    
    const superAdminData = {
      username: SUPER_ADMIN_CREDENTIALS.USERNAME,
      password: SUPER_ADMIN_CREDENTIALS.PASSWORD, // In production, this should be hashed
      name: 'Super Administrator',
      email: 'superadmin@careconnect.com',
      role: 'SUPER_ADMIN',
      type: 'superadmin',
      status: 'Active',
      isFixed: true,
      isProtected: true,
      createdAt: Timestamp.now(),
      lastActive: Timestamp.now()
    };
    
    if (!superAdminSnap.exists()) {
      // Create the fixed super admin using setDoc (creates or overwrites)
      await setDoc(superAdminRef, superAdminData);
      console.log('Super admin initialized in Firestore');
    } else {
      // Ensure the existing super admin has the correct credentials and flags
      const existingData = superAdminSnap.data();
      if (existingData.username !== SUPER_ADMIN_CREDENTIALS.USERNAME || 
          existingData.password !== SUPER_ADMIN_CREDENTIALS.PASSWORD ||
          !existingData.isFixed) {
        await updateDoc(superAdminRef, {
          username: SUPER_ADMIN_CREDENTIALS.USERNAME,
          password: SUPER_ADMIN_CREDENTIALS.PASSWORD,
          isFixed: true,
          isProtected: true
        });
        console.log('Super admin credentials updated');
      }
    }
  } catch (error) {
    console.error('Error initializing super admin:', error);
    throw error;
  }
};

/**
 * Check admin account status (for login validation)
 * @param {string} username - The username
 * @returns {Promise<Object>} { isArchived: boolean, isInactive: boolean, adminData: object|null }
 */
export const checkAdminAccountStatus = async (username) => {
  try {
    const normalizedUsername = username.trim().toLowerCase();
    
    // Skip check for super admin
    if (normalizedUsername === SUPER_ADMIN_CREDENTIALS.USERNAME.toLowerCase()) {
      return { isArchived: false, isInactive: false, adminData: null };
    }
    
    // Check if admin is archived
    const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
    const archivedQuery = query(
      archivedRef,
      where('originalCollection', '==', COLLECTIONS.ADMINS)
    );
    const archivedSnapshot = await getDocs(archivedQuery);
    
    for (const archivedDoc of archivedSnapshot.docs) {
      const archivedData = archivedDoc.data();
      if (archivedData.username && archivedData.username.toLowerCase() === normalizedUsername) {
        return { 
          isArchived: true, 
          isInactive: false, 
          adminData: archivedData 
        };
      }
    }
    
    // Check if admin exists and is inactive
    const adminsRef = collection(db, COLLECTIONS.ADMINS);
    const adminsSnapshot = await getDocs(adminsRef);
    
    for (const adminDoc of adminsSnapshot.docs) {
      const adminData = adminDoc.data();
      if (adminDoc.id === SUPER_ADMIN_CREDENTIALS.DOC_ID) continue;
      
      if (adminData.username && adminData.username.toLowerCase() === normalizedUsername) {
        const isInactive = adminData.status === 'Inactive';
        return { 
          isArchived: false, 
          isInactive: isInactive, 
          adminData: adminData 
        };
      }
    }
    
    return { isArchived: false, isInactive: false, adminData: null };
  } catch (error) {
    console.error('Error checking admin account status:', error);
    return { isArchived: false, isInactive: false, adminData: null };
  }
};

/**
 * Authenticate admin user against Firestore
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} Admin data with role, or null if invalid
 */
export const authenticateAdmin = async (username, password) => {
  try {
    // Normalize inputs (trim whitespace, lowercase username for comparison)
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    console.log('Authenticating:', { 
      inputUsername: username, 
      normalizedUsername,
      expectedUsername: SUPER_ADMIN_CREDENTIALS.USERNAME,
      passwordLength: normalizedPassword.length,
      expectedPasswordLength: SUPER_ADMIN_CREDENTIALS.PASSWORD.length
    });
    
    // Check for fixed super admin first (hardcoded check - works even if Firestore fails)
    if (normalizedUsername === SUPER_ADMIN_CREDENTIALS.USERNAME.toLowerCase()) {
      console.log('Super admin username matched, checking password...');
      if (normalizedPassword === SUPER_ADMIN_CREDENTIALS.PASSWORD) {
        console.log('Super admin password matched! Authenticating...');
        
        // Try to update/create in Firestore (non-blocking)
        try {
          const superAdminRef = doc(db, COLLECTIONS.ADMINS, SUPER_ADMIN_CREDENTIALS.DOC_ID);
          const superAdminSnap = await getDoc(superAdminRef);
          
          if (superAdminSnap.exists()) {
            // Update last active
            await updateDoc(superAdminRef, {
              lastActive: Timestamp.now()
            });
            console.log('Super admin last active updated in Firestore');
          } else {
            // Create the super admin if it doesn't exist
            console.log('Super admin not found in Firestore, creating...');
            await initializeSuperAdmin();
          }
        } catch (firestoreError) {
          console.warn('Could not update super admin in Firestore (non-critical):', firestoreError);
          // Continue anyway - authentication still works
        }
        
        // Return super admin data (works even if Firestore fails)
        console.log('Returning super admin data');
        const adminData = {
          id: SUPER_ADMIN_CREDENTIALS.DOC_ID,
          username: SUPER_ADMIN_CREDENTIALS.USERNAME,
          role: 'SUPER_ADMIN',
          name: 'Super Administrator',
          email: 'superadmin@careconnect.com',
          isFixed: true
        };
        
        // Log login with actual admin data (async, non-blocking)
        createLogEntry('LOGIN', 'admin', adminData.id, adminData.name, {
          role: adminData.role
        }, adminData).catch(err => console.warn('Failed to log login:', err));
        
        return adminData;
      } else {
        console.log('Super admin password mismatch');
        console.log('Expected:', SUPER_ADMIN_CREDENTIALS.PASSWORD);
        console.log('Got:', normalizedPassword);
        throw new Error('Invalid password for super admin');
      }
    }
    
    console.log('Not super admin, checking other admins in Firestore...');
    
    // Check other admins in Firestore
    try {
      const adminsRef = collection(db, COLLECTIONS.ADMINS);
      const snapshot = await getDocs(adminsRef);
      
      for (const adminDoc of snapshot.docs) {
        const adminData = adminDoc.data();
        // Skip the fixed super admin (already checked above)
        if (adminDoc.id === SUPER_ADMIN_CREDENTIALS.DOC_ID) continue;
        
        // Case-insensitive username comparison
        const adminUsername = adminData.username ? adminData.username.toLowerCase() : '';
        if (adminUsername === normalizedUsername && adminData.password === password) {
          // Check if account is inactive
          if (adminData.status === 'Inactive') {
            throw new Error('ACCOUNT_INACTIVE');
          }
          
          // Update last active
          try {
            await updateDoc(adminDoc.ref, {
              lastActive: Timestamp.now()
            });
          } catch (updateError) {
            console.warn('Could not update last active (non-critical):', updateError);
          }
          
          const returnedAdminData = {
            id: adminDoc.id,
            username: adminData.username,
            role: adminData.role || 'ADMIN',
            name: adminData.name,
            email: adminData.email,
            status: adminData.status || 'Active',
            isFixed: false
          };
          
          // Log login with actual admin data (async, non-blocking)
          createLogEntry('LOGIN', 'admin', returnedAdminData.id, returnedAdminData.name, {
            role: returnedAdminData.role,
            status: returnedAdminData.status
          }, returnedAdminData).catch(err => console.warn('Failed to log login:', err));
          
          return returnedAdminData;
        }
      }
      
      // Check if admin is archived (only if not found in active admins)
      const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
      const archivedQuery = query(
        archivedRef,
        where('originalCollection', '==', COLLECTIONS.ADMINS)
      );
      const archivedSnapshot = await getDocs(archivedQuery);
      
      for (const archivedDoc of archivedSnapshot.docs) {
        const archivedData = archivedDoc.data();
        // Case-insensitive username comparison
        const archivedUsername = archivedData.username ? archivedData.username.toLowerCase() : '';
        if (archivedUsername === normalizedUsername && archivedData.password === password) {
          throw new Error('ACCOUNT_ARCHIVED');
        }
      }
    } catch (firestoreError) {
      console.error('Error accessing Firestore:', firestoreError);
      // Re-throw specific errors
      if (firestoreError.message === 'ACCOUNT_INACTIVE' || firestoreError.message === 'ACCOUNT_ARCHIVED') {
        throw firestoreError;
      }
      throw new Error('Cannot connect to database. Please check your internet connection.');
    }
    
    throw new Error('Invalid username or password');
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Find an admin by email (e.g. for Google sign-in). Excludes archived/inactive checks; caller should handle.
 * @param {string} email - Admin email (case-insensitive match)
 * @returns {Promise<Object|null>} Admin data or null if not found
 */
export const getAdminByEmail = async (email) => {
  if (!email || !email.trim()) return null;
  const normalizedEmail = email.trim().toLowerCase();
  const adminsRef = collection(db, COLLECTIONS.ADMINS);
  const snapshot = await getDocs(adminsRef);
  for (const adminDoc of snapshot.docs) {
    const data = adminDoc.data();
    const adminEmail = (data.email || '').trim().toLowerCase();
    if (adminEmail === normalizedEmail) {
      return {
        id: adminDoc.id,
        username: data.username || '',
        role: data.role || 'ADMIN',
        name: data.name || 'Admin User',
        email: data.email || '',
        status: data.status || 'Active',
        isFixed: adminDoc.id === SUPER_ADMIN_CREDENTIALS.DOC_ID
      };
    }
  }
  return null;
};

/**
 * Get all admin accounts from Firestore (excluding super admin)
 * @returns {Promise<Array>} Array of admin documents (without super admin)
 */
export const getAdmins = async () => {
  try {
    const adminsRef = collection(db, COLLECTIONS.ADMINS);
    const snapshot = await getDocs(adminsRef);
    
    const admins = snapshot.docs
      .filter(adminDoc => {
        // Filter out the fixed super admin
        const data = adminDoc.data();
        return adminDoc.id !== SUPER_ADMIN_CREDENTIALS.DOC_ID && 
               data.username !== SUPER_ADMIN_CREDENTIALS.USERNAME;
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Sequential ID (AD-001, AD-002, etc.)
          documentId: data.documentId || doc.id, // Sequential ID
          name: data.name || 'Unknown',
          email: data.email || '',
          username: data.username || '',
          status: data.status || 'Active',
          lastActive: data.lastActive?.toDate?.() ? 
            new Date(data.lastActive.toDate()).toLocaleString() : 'Unknown',
          role: data.role || 'ADMIN',
          type: data.type || 'admin',
          createdAt: data.createdAt?.toDate?.() || null
        };
      });
    
    return admins;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Add a new admin to Firestore
 * @param {Object} adminData - Admin data (name, email, username, password)
 * @returns {Promise<string>} The document ID of the created admin
 */
/**
 * Initialize the admin counter
 * If counter doesn't exist, create it with count: 0
 * If it exists, check existing admins and set to highest sequential number
 * @returns {Promise<number>} The current count
 */
const initializeAdminCounter = async () => {
  const counterRef = doc(db, 'counters', 'admins');
  
  try {
    const counterDoc = await getDoc(counterRef);
    
    // If counter doesn't exist, check existing admins to find the highest sequential ID
    if (!counterDoc.exists()) {
      console.log('Counter does not exist, checking existing admins...');
      const adminsRef = collection(db, COLLECTIONS.ADMINS);
      const snapshot = await getDocs(adminsRef);
      
      // Find the highest sequential admin ID (AD-XXX format)
      let maxSequentialNumber = 0;
      snapshot.docs.forEach(adminDoc => {
        const adminId = adminDoc.id;
        // Skip super admin
        if (adminId === SUPER_ADMIN_CREDENTIALS.DOC_ID) return;
        
        // Check if it's a sequential ID (AD-XXX format)
        const match = adminId.match(/^AD-(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxSequentialNumber) {
            maxSequentialNumber = number;
          }
        }
      });
      
      // Create counter with the highest number found (or 0 if no sequential admins exist)
      await setDoc(counterRef, { count: maxSequentialNumber });
      console.log('Admin counter initialized to:', maxSequentialNumber);
      return maxSequentialNumber;
    }
    
    // Counter exists, return current value
    const currentCount = counterDoc.data().count || 0;
    return currentCount;
  } catch (error) {
    console.error('Error initializing admin counter:', error);
    // If initialization fails, create counter with 0
    try {
      await setDoc(counterRef, { count: 0 });
      return 0;
    } catch (setError) {
      console.error('Failed to create counter:', setError);
      return 0;
    }
  }
};

/**
 * Get the next sequential number for admins (AD-001, AD-002, etc.)
 * Uses Firestore transaction to ensure atomic increment
 * @returns {Promise<number>} Next admin number
 */
const getNextAdminNumber = async () => {
  const counterRef = doc(db, 'counters', 'admins');
  
  try {
    // First, ensure counter exists
    const counterDoc = await getDoc(counterRef);
    if (!counterDoc.exists()) {
      console.log('Counter does not exist, initializing...');
      await initializeAdminCounter();
    }
    
    // Verify counter exists before transaction
    const verifyDoc = await getDoc(counterRef);
    if (!verifyDoc.exists()) {
      console.warn('Counter still does not exist after initialization, creating with 0');
      await setDoc(counterRef, { count: 0 });
    }
    
    // Now use transaction to atomically increment
    const result = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      // Should exist now, but handle edge case
      if (!counterDoc.exists()) {
        console.warn('Counter does not exist in transaction, creating with 0');
        transaction.set(counterRef, { count: 0 });
        return 1;
      }
      
      const currentCount = counterDoc.data().count || 0;
      console.log('Current counter value:', currentCount);
      const newCount = currentCount + 1;
      console.log('Incrementing counter to:', newCount);
      transaction.set(counterRef, { count: newCount });
      return newCount;
    });
    
    console.log('Transaction successful! Next admin number:', result);
    
    // Verify the counter was actually updated
    const verifyAfter = await getDoc(counterRef);
    if (verifyAfter.exists()) {
      console.log('Counter after transaction:', verifyAfter.data().count);
    }
    
    return result;
  } catch (error) {
    console.error('Error getting next admin number:', error);
    console.error('Error details:', error.message, error.code);
    
    // Fallback: try to initialize and get next number manually
    try {
      console.log('Attempting fallback method...');
      const currentCount = await initializeAdminCounter();
      console.log('Fallback: Current count:', currentCount);
      const newCount = currentCount + 1;
      await setDoc(counterRef, { count: newCount });
      console.log('Fallback: Next admin number:', newCount);
      return newCount;
    } catch (retryError) {
      console.error('Fallback failed:', retryError);
      console.error('Fallback error details:', retryError.message, retryError.code);
      // Last resort: return 1 (will create AD-001)
      console.warn('Using emergency fallback: returning 1');
      return 1;
    }
  }
};

export const addAdmin = async (adminData) => {
  try {
    // Prevent creating another super admin
    if (adminData.username.toLowerCase() === SUPER_ADMIN_CREDENTIALS.USERNAME.toLowerCase()) {
      throw new Error('Username "superadmin" is reserved for the system account');
    }
    
    // Check if name, username, or email already exists
    const adminsRef = collection(db, COLLECTIONS.ADMINS);
    const snapshot = await getDocs(adminsRef);
    
    for (const adminDoc of snapshot.docs) {
      const data = adminDoc.data();
      // Skip super admin when checking
      if (adminDoc.id === SUPER_ADMIN_CREDENTIALS.DOC_ID) continue;
      
      // Check for duplicate full name (case-insensitive, trimmed)
      const existingName = data.name || data.fullName;
      const newName = adminData.name || adminData.fullName;
      if (existingName && newName && 
          existingName.toLowerCase().trim() === newName.toLowerCase().trim()) {
        throw new Error(`Full name "${newName}" already exists`);
      }
      
      // Check for duplicate username (case-insensitive)
      if (data.username && data.username.toLowerCase() === adminData.username.toLowerCase()) {
        throw new Error(`Username "${adminData.username}" already exists`);
      }
      
      // Check for duplicate email (case-insensitive)
      if (data.email && data.email.toLowerCase() === adminData.email.toLowerCase()) {
        throw new Error(`Email "${adminData.email}" is already in use`);
      }
    }
    
    // Ensure counter exists (only initialize if it doesn't exist, don't reset it)
    const counterRef = doc(db, 'counters', 'admins');
    const counterDoc = await getDoc(counterRef);
    if (!counterDoc.exists()) {
      console.log('Counter does not exist, initializing...');
      await initializeAdminCounter();
    }
    
    // Get next sequential number (this will increment the counter)
    const nextNumber = await getNextAdminNumber();
    const documentId = `AD-${String(nextNumber).padStart(3, '0')}`;
    console.log('Using admin document ID:', documentId);
    
    // Check if document with this ID already exists (shouldn't happen, but safety check)
    const adminRef = doc(db, COLLECTIONS.ADMINS, documentId);
    const existingAdminDoc = await getDoc(adminRef);
    if (existingAdminDoc.exists()) {
      console.error('Document ID already exists:', documentId);
      throw new Error(`Admin ID ${documentId} already exists. Please try again.`);
    }
    
    const newAdmin = {
      name: adminData.name,
      email: adminData.email,
      username: adminData.username,
      password: adminData.password, // In production, hash this
      role: 'ADMIN', // Always ADMIN, never SUPER_ADMIN
      type: 'admin',
      status: 'Active',
      isFixed: false,
      isProtected: false,
      documentId: documentId, // Store the sequential ID
      createdAt: Timestamp.now(),
      lastActive: Timestamp.now()
    };
    
    // Use setDoc with specific document ID instead of addDoc
    await setDoc(adminRef, newAdmin);
    
    console.log('Admin added successfully with ID:', documentId);
    console.log('Counter should now be at:', nextNumber);
    
    // Verify counter was incremented
    const verifyCounter = await getDoc(counterRef);
    if (verifyCounter.exists()) {
      console.log('Counter after creation:', verifyCounter.data().count);
    }
    
    // Log the admin creation
    createLogEntry('ADMIN_CREATED', 'admin', documentId, adminData.name, {
      email: adminData.email,
      username: adminData.username
    }).catch(err => console.warn('Failed to log admin creation:', err));
    
    return documentId;
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

/**
 * Generate a random token for email verification (UUID-like)
 */
const generateVerificationToken = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Add a pending admin (waiting for email verification). Call this when superadmin clicks "Add Admin".
 * Admin will be created in `admins` only after they click the verification link.
 * @param {Object} adminData - { name, email, username, password }
 * @param {Object} createdByInfo - { id, username, name } of superadmin (for logging)
 * @returns {Promise<{ token: string, expiresAt: number }>}
 */
export const addPendingAdmin = async (adminData, createdByInfo = null) => {
  const email = (adminData.email || '').trim().toLowerCase();
  const username = (adminData.username || '').trim();
  if (!email || !username) throw new Error('Email and username are required.');

  // Check pending_admins for same email or username
  const pendingRef = collection(db, COLLECTIONS.PENDING_ADMINS);
  const pendingSnap = await getDocs(query(pendingRef, where('verified', '==', false)));
  for (const d of pendingSnap.docs) {
    const data = d.data();
    if ((data.email || '').toLowerCase() === email) throw new Error(`A verification email was already sent to ${adminData.email}. Ask them to verify or wait for the link to expire.`);
    if ((data.username || '').toLowerCase() === username.toLowerCase()) throw new Error(`Username "${username}" is already pending verification.`);
  }

  const token = generateVerificationToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const docRef = doc(db, COLLECTIONS.PENDING_ADMINS, token);
  const pendingData = {
    name: adminData.name,
    email,
    username,
    password: adminData.password,
    verificationToken: token,
    expiresAt,
    createdAt: Timestamp.now(),
    verified: false,
    createdBy: createdByInfo ? { id: createdByInfo.id, username: createdByInfo.username, name: createdByInfo.name } : null,
  };

  await setDoc(docRef, pendingData);
  return { token, expiresAt };
};

/**
 * Get a pending admin by verification token (for the verify page)
 * @param {string} token
 * @returns {Promise<Object|null>} { name, email, username, password, ... } or null
 */
export const getPendingAdminByToken = async (token) => {
  if (!token || !token.trim()) return null;
  const pendingRef = doc(db, COLLECTIONS.PENDING_ADMINS, token.trim());
  const snap = await getDoc(pendingRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { id: snap.id, ...data };
};

/**
 * Verify a pending admin: create the admin in `admins` and mark pending as verified.
 * @param {string} token
 * @returns {Promise<{ adminId: string, name: string }>}
 */
export const verifyPendingAdmin = async (token) => {
  const pending = await getPendingAdminByToken(token);
  if (!pending) throw new Error('Invalid or expired verification link.');
  if (pending.verified) throw new Error('This link has already been used. You can log in.');
  if (pending.expiresAt && Date.now() > pending.expiresAt) throw new Error('This verification link has expired. Please ask the superadmin to add you again.');

  const { name, email, username, password } = pending;
  if (!name || !email || !username || !password) throw new Error('Invalid signup data.');

  // Create the admin in the main admins collection (reuse addAdmin logic)
  const adminId = await addAdmin({ name, email, username, password });

  // Mark pending as verified
  const pendingRef = doc(db, COLLECTIONS.PENDING_ADMINS, token);
  await updateDoc(pendingRef, {
    verified: true,
    verifiedAt: Timestamp.now(),
    adminId,
  });

  return { adminId, name };
};

/**
 * Get all pending admins (for superadmin "Pending" section)
 * @returns {Promise<Array<{ id, name, email, username, createdAt }>>}
 */
export const getPendingAdmins = async () => {
  const ref = collection(db, COLLECTIONS.PENDING_ADMINS);
  const q = query(ref, where('verified', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => {
      const data = d.data();
      const expiresAt = data.expiresAt;
      const expired = expiresAt && Date.now() > expiresAt;
      return {
        id: d.id,
        name: data.name || '',
        email: data.email || '',
        username: data.username || '',
        createdAt: data.createdAt?.toDate?.() || null,
        expiresAt: expiresAt || null,
        expired,
      };
    })
    .filter((p) => !p.expired); // Optionally hide expired in UI
};

/**
 * Send verification email for a pending admin. Calls the same API as CareConnect app (EmailJS via Vercel).
 * Set VITE_VERIFICATION_EMAIL_API_URL in .env to your API URL (e.g. Vercel serverless).
 * @param {string} email
 * @param {string} verificationLink - Full URL the admin will click
 * @param {string} token
 * @returns {Promise<void>}
 */
export const sendAdminVerificationEmail = async (email, verificationLink, token) => {
  const apiUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VERIFICATION_EMAIL_API_URL;
  const url = (typeof apiUrl === 'string' && apiUrl.trim()) ? apiUrl.trim() : null;
  if (!url) {
    console.warn('VITE_VERIFICATION_EMAIL_API_URL not set. Verification email not sent. Link:', verificationLink);
    return;
  }

  const body = JSON.stringify({
    email,
    verification_link: verificationLink,
    token,
    role: 'admin',
  });

  const headers = { 'Content-Type': 'application/json' };
  const apiKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VERIFICATION_EMAIL_API_KEY;
  if (typeof apiKey === 'string' && apiKey.trim()) headers['X-API-Key'] = apiKey.trim();

  const res = await fetch(url, { method: 'POST', headers, body });
  const text = await res.text();
  if (!res.ok) {
    let errMsg = text;
    try {
      const j = JSON.parse(text);
      if (j && j.error) errMsg = j.error;
    } catch (_) {}
    throw new Error(errMsg || `Email API returned ${res.status}`);
  }
};

/**
 * Update an admin in Firestore
 * @param {string} adminId - The admin document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateAdmin = async (adminId, updates) => {
  try {
    // Prevent updating the fixed super admin
    if (adminId === SUPER_ADMIN_CREDENTIALS.DOC_ID) {
      throw new Error('Cannot update the fixed super admin account');
    }
    
    // Prevent changing username to 'superadmin'
    if (updates.username && updates.username.toLowerCase() === SUPER_ADMIN_CREDENTIALS.USERNAME.toLowerCase()) {
      throw new Error('Username "superadmin" is reserved for the system account');
    }
    
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    const adminSnap = await getDoc(adminRef);
    const oldAdminData = adminSnap.exists() ? adminSnap.data() : {};
    
    await updateDoc(adminRef, {
      ...updates,
      role: 'ADMIN' // Ensure role stays as ADMIN
    });
    console.log('Admin updated successfully');
    
    // Log the update, especially status changes
    const adminName = updates.name || oldAdminData.name || 'Unknown Admin';
    const logDetails = {};
    
    if (updates.status && updates.status !== oldAdminData.status) {
      logDetails.statusChange = {
        from: oldAdminData.status || 'Unknown',
        to: updates.status
      };
      createLogEntry('STATUS_CHANGED', 'admin', adminId, adminName, logDetails).catch(err => console.warn('Failed to log status change:', err));
    } else {
      createLogEntry('ADMIN_UPDATED', 'admin', adminId, adminName, {
        updatedFields: Object.keys(updates)
      }).catch(err => console.warn('Failed to log admin update:', err));
    }
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

/**
 * Archive an admin (move to archived collection)
 * @param {string} adminId - The admin document ID
 * @param {string} reason - Reason for archiving
 * @returns {Promise<void>}
 */
export const archiveAdmin = async (adminId, reason) => {
  try {
    console.log('Starting archive process for admin:', adminId);
    console.log('Reason:', reason);
    
    // Prevent archiving the fixed super admin
    if (adminId === SUPER_ADMIN_CREDENTIALS.DOC_ID) {
      throw new Error('Cannot archive the fixed super admin account');
    }
    
    // Check if already archived (prevent duplicates)
    const archivedRef = collection(db, COLLECTIONS.ARCHIVED);
    const existingArchiveQuery = query(
      archivedRef,
      where('originalCollection', '==', COLLECTIONS.ADMINS),
      where('originalId', '==', adminId)
    );
    const existingArchiveSnap = await getDocs(existingArchiveQuery);
    
    if (!existingArchiveSnap.empty) {
      console.warn('Admin already archived, skipping duplicate archive');
      throw new Error('This admin is already archived. Please check the archive page.');
    }
    
    // Get the admin data
    const adminRef = doc(db, COLLECTIONS.ADMINS, adminId);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      throw new Error('Admin not found');
    }
    
    const adminData = adminSnap.data();
    console.log('Admin data retrieved:', Object.keys(adminData));
    
    // Add to archived collection
    const archivedData = {
      ...adminData,
      reason,
      archivedAt: Timestamp.now(),
      originalCollection: COLLECTIONS.ADMINS,
      originalId: adminId
    };
    
    console.log('Adding to archived collection...');
    await addDoc(collection(db, COLLECTIONS.ARCHIVED), archivedData);
    console.log('Successfully added to archived collection');
    
    // Delete from admins collection
    console.log('Deleting from admins collection...');
    await deleteDoc(adminRef);
    console.log('Successfully deleted from admins collection');
    
    console.log('Admin archived successfully');
    
    // Log the archive action
    createLogEntry('ARCHIVE', 'admin', adminId, adminData.name || 'Unknown Admin', {
      reason: reason,
      originalCollection: COLLECTIONS.ADMINS
    }).catch(err => console.warn('Failed to log archive:', err));
  } catch (error) {
    console.error('Error archiving admin:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules for "archived" collection and "admins" collection.');
    } else if (error.message) {
      throw new Error(`Failed to archive admin: ${error.message}`);
    } else {
      throw new Error('Failed to archive admin. Please check browser console for details.');
    }
  }
};

/**
 * Get current admin info from sessionStorage/localStorage and role
 * Uses sessionStorage first (tab-specific) to prevent cross-tab interference
 * @returns {Object|null} Admin info or null
 */
export const getCurrentAdminInfo = async () => {
  try {
    // Check if localStorage/sessionStorage is available
    if (typeof localStorage === 'undefined') {
      return null;
    }
    
    // Get role from sessionStorage first (tab-specific), then localStorage
    let userRole = null;
    if (typeof sessionStorage !== 'undefined') {
      userRole = sessionStorage.getItem('sessionRole');
    }
    if (!userRole) {
      userRole = localStorage.getItem('userRole');
    }
    
    const adminProfile = localStorage.getItem('adminProfile');
    
    // If superadmin, get info from SUPER_ADMIN_CREDENTIALS or Firestore
    if (userRole === 'SUPER_ADMIN') {
      try {
        const superAdminRef = doc(db, COLLECTIONS.ADMINS, SUPER_ADMIN_CREDENTIALS.DOC_ID);
        const superAdminSnap = await getDoc(superAdminRef);
        if (superAdminSnap.exists()) {
          const data = superAdminSnap.data();
          return {
            id: SUPER_ADMIN_CREDENTIALS.DOC_ID,
            username: SUPER_ADMIN_CREDENTIALS.USERNAME,
            name: data.name || 'Super Administrator'
          };
        }
        // Fallback to credentials
        return {
          id: SUPER_ADMIN_CREDENTIALS.DOC_ID,
          username: SUPER_ADMIN_CREDENTIALS.USERNAME,
          name: 'Super Administrator'
        };
      } catch (error) {
        // Fallback to credentials if Firestore fails
        return {
          id: SUPER_ADMIN_CREDENTIALS.DOC_ID,
          username: SUPER_ADMIN_CREDENTIALS.USERNAME,
          name: 'Super Administrator'
        };
      }
    }
    
    // For regular admins, use adminProfile - but verify it matches the role
    if (adminProfile && userRole === 'ADMIN') {
      const profile = JSON.parse(adminProfile);
      if (profile && profile.adminId) {
        return {
          id: profile.adminId || '',
          username: profile.username || '',
          name: profile.fullName || 'Unknown Admin'
        };
      }
    }
    
    return null;
  } catch (error) {
    // Silently fail - don't log errors that might interfere with normal operation
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error getting current admin info:', error);
    }
    return null;
  }
};

/**
 * Create a system log entry
 * @param {string} action - The action performed (e.g., 'LOGIN', 'ARCHIVE', 'RESTORE', 'ADMIN_CREATED', 'ADMIN_UPDATED', 'STATUS_CHANGED')
 * @param {string} entityType - Type of entity (e.g., 'admin', 'caregiver', 'patient')
 * @param {string} entityId - ID of the entity
 * @param {string} entityName - Name of the entity
 * @param {Object} details - Additional details about the action
 * @returns {Promise<void>}
 */
// Track recent log entries to prevent duplicates (within 2 seconds)
const recentLogs = new Map();
const LOG_DEBOUNCE_MS = 2000;

/**
 * Create a system log entry
 * @param {string} action - The action performed
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @param {string} entityName - Name of the entity
 * @param {Object} details - Additional details
 * @param {Object} adminInfo - Optional admin info to use (for LOGIN actions, pass the actual adminData)
 * @returns {Promise<void>}
 */
// -------- LOGS --------

export const createLogEntry = async (action, entityType, entityId, entityName, details = {}, adminInfo = null) => {
  // Make this truly non-blocking - don't await, just fire and forget
  Promise.resolve().then(async () => {
    try {
      let currentAdmin;
      
      // If adminInfo is provided (e.g., from LOGIN), use it directly - this is the correct way
      if (adminInfo) {
        currentAdmin = {
          id: adminInfo.id || '',
          username: adminInfo.username || '',
          name: adminInfo.name || 'Unknown Admin'
        };
      } else {
        // Otherwise, get from current session (uses sessionStorage for role)
        currentAdmin = await getCurrentAdminInfo();
      }
      
      const adminName = currentAdmin ? currentAdmin.name : 'System';
      const adminUsername = currentAdmin ? currentAdmin.username : 'system';
      const adminId = currentAdmin ? currentAdmin.id : 'system';

      // Create a unique key for this log entry to prevent duplicates
      const logKey = `${action}-${entityType}-${entityId}-${adminId}-${Date.now()}`;
      const recentKey = `${action}-${entityType}-${entityId}-${adminId}`;
      
      // Check if we recently logged the same action (within debounce time)
      const now = Date.now();
      const lastLogTime = recentLogs.get(recentKey);
      if (lastLogTime && (now - lastLogTime) < LOG_DEBOUNCE_MS) {
        // Skip duplicate log entry
        if (process.env.NODE_ENV === 'development') {
          console.log('Skipping duplicate log entry:', action, entityType, entityName);
        }
        return;
      }
      
      // Mark this log as recent
      recentLogs.set(recentKey, now);
      
      // Clean up old entries (keep map size reasonable)
      if (recentLogs.size > 100) {
        const entries = Array.from(recentLogs.entries());
        entries.slice(0, 50).forEach(([key]) => recentLogs.delete(key));
      }

      const logData = {
        action,
        entityType,
        entityId,
        entityName,
        performedBy: {
          id: adminId,
          username: adminUsername,
          name: adminName
        },
        details,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, COLLECTIONS.LOGS), logData);
      if (process.env.NODE_ENV === 'development') {
        console.log('Log entry created:', action, entityType, entityName, 'by', adminName);
      }
    } catch (error) {
      // Silently fail - don't let logging errors affect the app
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error creating log entry (non-critical):', error);
      }
    }
  }).catch(() => {
    // Silently catch any errors in the promise chain
  });
};

/**
 * Get all system logs
 * @param {number} limitCount - Maximum number of logs to retrieve (default: 100)
 * @returns {Promise<Array>} Array of log entries
 */
export const getLogs = async (limitCount = 100) => {
  try {
    const logsRef = collection(db, COLLECTIONS.LOGS);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        performedBy: data.performedBy || { name: 'Unknown', username: 'unknown' },
        details: data.details || {},
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      };
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
};

/**
 * Subscribe to system logs (real-time updates)
 * @param {Function} callback - Callback function that receives log entries
 * @param {number} limitCount - Maximum number of logs to retrieve (default: 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLogs = (callback, limitCount = 100) => {
  try {
    const logsRef = collection(db, COLLECTIONS.LOGS);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityName: data.entityName,
          performedBy: data.performedBy || { name: 'Unknown', username: 'unknown' },
          details: data.details || {},
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });
      callback(logs);
    }, (error) => {
      console.error('Error in logs subscription:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up logs subscription:', error);
    return () => {}; // Return no-op unsubscribe function
  }
};

// Export super admin credentials for use in auth.js
export { SUPER_ADMIN_CREDENTIALS };
