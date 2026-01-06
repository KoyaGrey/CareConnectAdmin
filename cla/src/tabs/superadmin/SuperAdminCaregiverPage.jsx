import React, { useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout';
import ArchiveModal from '../../component/ArchiveModal';

function SuperAdminCaregiverPage() {
  const [caregivers, setCaregivers] = useState([
    { id: 'CG-001', name: 'Sarah Johnson', email: 'sarah.j@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Zaldy Largo', type: 'caregiver' },
    { id: 'CG-002', name: 'Michael Zaldivar', email: 'michael.z@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Clint Fundano', type: 'caregiver' },
    { id: 'CG-003', name: 'Ronald Mingoy', email: 'ronald.m@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Regan Pria', type: 'caregiver' },
    { id: 'CG-004', name: 'Jacob Manuel', email: 'jacob.m@careconnect.com', status: 'Inactive', lastActive: '2 days ago', assignedPatient: 'Rennel Bontilao', type: 'caregiver' },
    { id: 'CG-005', name: 'Robert Altares', email: 'robert.a@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Renz Lapera', type: 'caregiver' },
    { id: 'CG-006', name: 'Raymund Padon', email: 'raymund.p@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Eduard Dula', type: 'caregiver' },
    { id: 'CG-007', name: 'James Largo', email: 'james.l@careconnect.com', status: 'Active', lastActive: 'Just now', assignedPatient: 'Daniel Gutierrez', type: 'caregiver' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const addToArchive = (item, reason) => {
      const archivedItem = {
          ...item,
          reason,
          archivedAt: new Date().toISOString()
      };
      const currentArchive = JSON.parse(localStorage.getItem('archivedItems') || '[]');
      localStorage.setItem('archivedItems', JSON.stringify([...currentArchive, archivedItem]));
  };

  const filteredCaregivers = useMemo(
    () =>
      caregivers.filter((c) => {
        const haystack = `${c.name} ${c.email} ${c.id} ${c.assignedPatient}`.toLowerCase();
        return haystack.includes(searchTerm);
      }),
    [caregivers, searchTerm]
  );

  const handleDeleteCaregiver = (id) => {
    const item = caregivers.find(c => c.id === id);
    setArchiveModal({
      isOpen: true,
      title: 'Archive Caregiver',
      message: 'Are you sure you want to archive this caregiver account? This will move it to the archive list.',
      onConfirm: (reason) => {
        addToArchive(item, reason);
        setCaregivers((prev) => prev.filter((c) => c.id !== id));
      },
    });
  };

  const openDetails = (account) => setSelectedAccount(account);
  const closeDetails = () => setSelectedAccount(null);

  return (
    <AdminLayout pageTitle="Caregivers" onSearchChange={handleSearchChange}>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
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
                <p className="font-semibold text-gray-700">Assigned Patient</p>
                <p className="text-gray-900">{selectedAccount.assignedPatient}</p>
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
