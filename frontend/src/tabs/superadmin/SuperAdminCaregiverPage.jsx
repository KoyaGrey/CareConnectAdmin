import React, { useMemo, useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import ArchiveModal from '../../component/ArchiveModal';
import Pagination from '../../component/Pagination';
import { subscribeToCaregivers, archiveCaregiver, getConnectedPatientForCaregiver } from '../../utils/firestoreService';

function SuperAdminCaregiverPage() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listener for caregivers
  useEffect(() => {
    console.log('Setting up real-time listener for caregivers...');
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCaregivers((caregiversData) => {
      console.log('Caregivers updated:', caregiversData.length);
      setCaregivers(caregiversData);
      setLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('Cleaning up caregivers listener...');
      unsubscribe();
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [connectedPatient, setConnectedPatient] = useState(null);
  const [connectedPatientLoading, setConnectedPatientLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [nameSort, setNameSort] = useState('asc');
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  useEffect(() => {
    if (!selectedAccount?.id) {
      setConnectedPatient(null);
      setConnectedPatientLoading(false);
      return;
    }
    let cancelled = false;
    setConnectedPatient(null);
    setConnectedPatientLoading(true);
    getConnectedPatientForCaregiver(selectedAccount.id, selectedAccount.uid)
      .then((patient) => { if (!cancelled) setConnectedPatient(patient); })
      .catch((e) => { if (!cancelled) setConnectedPatient(null); console.error(e); })
      .finally(() => { if (!cancelled) setConnectedPatientLoading(false); });
    return () => { cancelled = true; };
  }, [selectedAccount?.id]);

  const filteredCaregivers = useMemo(
    () => {
      const filtered = caregivers.filter((c) => {
        const haystack = `${c.name} ${c.email} ${c.id} ${c.assignedPatient}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
      
      // Sort by name
      const sorted = [...filtered].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameSort === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
      
      return sorted;
    },
    [caregivers, searchTerm, statusFilter, nameSort]
  );

  const paginatedCaregivers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCaregivers.slice(startIndex, endIndex);
  }, [filteredCaregivers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCaregivers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, nameSort]);

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

  const openDetails = (account) => setSelectedAccount(account);
  const closeDetails = () => setSelectedAccount(null);

  if (loading) {
    return (
      <AdminLayout pageTitle="Caregivers" onSearchChange={handleSearchChange}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading caregivers...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Caregivers" onSearchChange={handleSearchChange}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Caregivers" onSearchChange={handleSearchChange}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#143F81] px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Caregiver Accounts</h2>
          <div className="flex items-center gap-2">
            <label className="text-white text-sm font-medium">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-white font-bold bg-[#143F81]"
              style={{
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              <option value="All" className="text-white font-bold bg-[#143F81]">All</option>
              <option value="Active" className="text-white font-bold bg-[#143F81]">Active</option>
              <option value="Inactive" className="text-white font-bold bg-[#143F81]">Inactive</option>
            </select>
            <label className="text-white text-sm font-medium ml-2">Sort by Name:</label>
            <select
              value={nameSort}
              onChange={(e) => setNameSort(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-white font-bold bg-[#143F81]"
              style={{
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              <option value="asc" className="text-white font-bold bg-[#143F81]">Ascending</option>
              <option value="desc" className="text-white font-bold bg-[#143F81]">Descending</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCaregivers.map((caregiver) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteCaregiver(caregiver.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCaregivers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCaregivers.length}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#143F81] mb-4">Caregiver Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Name</p>
                <p className="text-gray-900">{selectedAccount.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Email</p>
                <p className="text-gray-900">{selectedAccount.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">ID</p>
                <p className="text-gray-900">{selectedAccount.id}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Connected Patient</p>
                {connectedPatientLoading ? (
                  <p className="text-gray-500">Loading patient...</p>
                ) : connectedPatient ? (
                  <div className="text-gray-900 mt-1">
                    <p>{connectedPatient.name}</p>
                    {connectedPatient.email && <p className="text-gray-600">{connectedPatient.email}</p>}
                    {connectedPatient.phone && <p className="text-gray-600">{connectedPatient.phone}</p>}
                    <p className="text-gray-500 text-xs mt-1">ID: {connectedPatient.id}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No patient connected</p>
                )}
              </div>
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
                className="px-4 py-2 rounded-md bg-[#143F81] text-white hover:bg-blue-700"
                onClick={closeDetails}
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

export default SuperAdminCaregiverPage;
