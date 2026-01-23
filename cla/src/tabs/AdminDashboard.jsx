import React, { useMemo, useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ArchiveModal from '../component/ArchiveModal';
import { subscribeToCaregivers, subscribeToPatients, archiveCaregiver, archivePatient, testFirestoreConnection } from '../utils/firestoreService';

function AdminDashboard() {
  const [caregivers, setCaregivers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listeners for Firestore data
  useEffect(() => {
    console.log('=== AdminDashboard: Setting up Firestore listeners ===');
    setLoading(true);
    setError(null);
    
    let unsubscribeCaregivers = null;
    let unsubscribePatients = null;

    // First, test the connection
    testFirestoreConnection()
      .then((result) => {
        if (!result.success) {
          const errorMsg = result.code === 'permission-denied' 
            ? 'Permission denied. Please update Firestore security rules to allow read access. See FIRESTORE_TROUBLESHOOTING.md'
            : `Firestore connection failed: ${result.error || result.code}`;
          setError(errorMsg);
          setLoading(false);
          console.error('Connection test failed:', result);
          return;
        }
        
        console.log('✅ Connection test passed! Found', result.count, 'caregivers');
        setError(null);

        // Subscribe to caregivers updates
        unsubscribeCaregivers = subscribeToCaregivers((caregiversData) => {
          console.log('AdminDashboard: Caregivers updated:', caregiversData.length);
          setCaregivers(caregiversData);
          if (caregiversData.length === 0) {
            console.warn('No caregivers found. Check Firestore data and security rules.');
          }
          setLoading(false);
        });

        // Subscribe to patients updates
        unsubscribePatients = subscribeToPatients((patientsData) => {
          console.log('AdminDashboard: Patients updated:', patientsData.length);
          setPatients(patientsData);
          if (patientsData.length === 0) {
            console.warn('No patients found. Check Firestore data and security rules.');
          }
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error('Error in connection test:', err);
        setError(`Failed to connect to Firestore: ${err.message}. Check browser console for details.`);
        setLoading(false);
      });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('AdminDashboard: Cleaning up real-time listeners...');
      if (unsubscribeCaregivers) unsubscribeCaregivers();
      if (unsubscribePatients) unsubscribePatients();
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null); // for read-only details modal
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };


  const filteredCaregivers = useMemo(
    () =>
      caregivers.filter((c) => {
        const haystack = `${c.name} ${c.email} ${c.id} ${c.assignedPatient}`.toLowerCase();
        return haystack.includes(searchTerm);
      }),
    [caregivers, searchTerm]
  );

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const haystack = `${p.name} ${p.id || ''}`.toLowerCase();
        return haystack.includes(searchTerm);
      }),
    [patients, searchTerm]
  );

  const handleDeleteCaregiver = (id) => {
    const item = caregivers.find(c => c.id === id);
    setArchiveModal({
      isOpen: true,
      title: 'Archive Caregiver',
      message: 'Are you sure you want to archive this caregiver account? This will move it to the archive list.',
      onConfirm: async (reason) => {
        try {
          await archiveCaregiver(id, reason);
          // Data will automatically update via real-time listener
        } catch (err) {
          console.error('Error archiving caregiver:', err);
          alert(err.message || 'Failed to archive caregiver. Please check browser console for details.');
        }
      },
    });
  };

  const handleDeletePatient = (id) => {
    const item = patients.find(p => p.id === id);
    setArchiveModal({
      isOpen: true,
      title: 'Archive Patient',
      message: 'Are you sure you want to archive this patient account? This will move it to the archive list.',
      onConfirm: async (reason) => {
        try {
          await archivePatient(id, reason);
          // Data will automatically update via real-time listener
        } catch (err) {
          console.error('Error archiving patient:', err);
          alert(err.message || 'Failed to archive patient. Please check browser console for details.');
        }
      },
    });
  };

  const openDetails = (account) => {
    setSelectedAccount(account);
  };

  const closeDetails = () => setSelectedAccount(null);

  const totalCaregivers = caregivers.length;
  const totalPatients = patients.length;
  const activeToday = patients.filter((p) => p.status === 'Active').length; // just example

  if (loading) {
    return (
      <AdminLayout pageTitle="Overview" onSearchChange={handleSearchChange}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Overview" onSearchChange={handleSearchChange}>
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <p className="text-red-600 font-bold text-lg mb-4">⚠️ Error Loading Data</p>
          <p className="text-red-600 mb-2">{error}</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl">
            <p className="font-semibold mb-2">Common fixes:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check Firestore security rules (Firebase Console → Firestore → Rules)</li>
              <li>Verify Firebase connection in browser console (F12)</li>
              <li>Check if data exists in Firestore (Firebase Console → Firestore → Data)</li>
              <li>See FIRESTORE_TROUBLESHOOTING.md for detailed help</li>
            </ol>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
    pageTitle="Overview"
    onSearchChange={handleSearchChange}
  >
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Caregivers Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 font-medium text-sm">Total Caregivers</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-900 text-2xl font-bold">{totalCaregivers}</p>
        </div>

        {/* Total Patients Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 font-medium text-sm">Total Patients</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-900 text-2xl font-bold">{totalPatients}</p>
        </div>

        {/* Active Today Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 font-medium text-sm">Active Today</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-900 text-2xl font-bold">{activeToday}</p>
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 font-medium text-sm">System Status</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold">Online</p>
        </div>
      </div>

      {/* Tables Section - Full Tables with All Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caregiver Accounts Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#143F81] px-6 py-4">
            <h2 className="text-white font-bold text-lg">Caregiver Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCaregivers.map((caregiver) => (
                  <tr key={caregiver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-sm font-medium text-[#143F81] hover:underline text-left"
                        onClick={() => openDetails(caregiver)}
                      >
                        {caregiver.name}
                      </button>
                      <div className="text-sm text-gray-500">{caregiver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          caregiver.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {caregiver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caregiver.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Accounts Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#143F81] px-6 py-4">
            <h2 className="text-white font-bold text-lg">Patient Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-sm font-medium text-[#143F81] hover:underline text-left"
                        onClick={() => openDetails(patient)}
                      >
                        {patient.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Read-only Account Details Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#143F81] mb-4">
              {selectedAccount.type === 'caregiver' ? 'Caregiver Details' : 'Patient Details'}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Name</p>
                <p className="text-gray-900">{selectedAccount.name}</p>
              </div>

              {selectedAccount.email && (
                <div>
                  <p className="font-semibold text-gray-700">Email</p>
                  <p className="text-gray-900">{selectedAccount.email}</p>
                </div>
              )}

              {selectedAccount.id && (
                <div>
                  <p className="font-semibold text-gray-700">ID</p>
                  <p className="text-gray-900">{selectedAccount.id}</p>
                </div>
              )}

              {selectedAccount.assignedPatient && (
                <div>
                  <p className="font-semibold text-gray-700">Assigned Patient</p>
                  <p className="text-gray-900">{selectedAccount.assignedPatient}</p>
                </div>
              )}

              <div className="flex gap-6">
                <div>
                  <p className="font-semibold text-gray-700">Status</p>
                  <p className="text-gray-900">{selectedAccount.status}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Last Active</p>
                  <p className="text-gray-900">{selectedAccount.lastActive}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={closeDetails}
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ArchiveModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={archiveModal.onConfirm}
        title={archiveModal.title}
        message={archiveModal.message}
      />
    </AdminLayout>
  );
}

export default AdminDashboard;