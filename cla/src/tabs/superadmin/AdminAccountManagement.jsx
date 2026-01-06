import React, { useState, useMemo } from 'react';
import AdminLayout from '../AdminLayout';
import ArchiveModal from '../../component/ArchiveModal';

function AdminAccountManagement() {
  const [admins, setAdmins] = useState([
    { id: 'ADM-001', name: 'Emman Dator', email: 'dator.emman@careconnect.com', username: 'adminemman', status: 'Active', lastActive: 'Just now', role: 'ADMIN', createdAt: '2024-01-15' },
    { id: 'ADM-002', name: 'Majan Taganna', email: 'majan.taganna@careconnect.com', username: 'adminmajan', status: 'Active', lastActive: '1 hour ago', role: 'ADMIN', createdAt: '2024-02-20' },
    { id: 'ADM-003', name: 'Clarissa Arzadon', email: 'cla.arzadon@careconnect.com', username: 'admincla', status: 'Inactive', lastActive: '3 days ago', role: 'ADMIN', createdAt: '2024-03-10' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    const words = name.trim().split(/\s+/);
    for (const word of words) {
      if (word.length < 2) return 'Each word must be at least 2 letters';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    const [localPart, domain] = email.split('@');
    if (localPart.length < 2) return 'Email must have at least 2 characters before the domain';
    if (!domain || !domain.includes('.')) return 'Email must have a proper domain';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 capital letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least 1 special character';
    return '';
  };

  // Handle name input with auto-capitalization and character restrictions
  const handleNameChange = (e) => {
    let value = e.target.value;
    
    // Remove special characters and numbers
    value = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Auto-capitalize first letter of each word
    value = value.split(' ').map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    setFormData({ ...formData, name: value });
    setErrors({ ...errors, name: validateName(value) });
  };

  // Handle email input
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    setErrors({ ...errors, email: validateEmail(value) });
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setErrors({ ...errors, password: validatePassword(value) });
  };

  const filteredAdmins = useMemo(
    () =>
      admins.filter((admin) => {
        const haystack = `${admin.name} ${admin.email} ${admin.username} ${admin.id}`.toLowerCase();
        return haystack.includes(searchTerm);
      }),
    [admins, searchTerm]
  );

  const handleAddAdmin = () => {
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
      });
      return;
    }

    const newAdmin = {
      id: `ADM-${String(admins.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      username: formData.username,
      status: 'Active',
      lastActive: 'Just now',
      role: 'ADMIN',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAdmins([...admins, newAdmin]);
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', username: '', password: '' });
    setErrors({ name: '', email: '', password: '' });
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = () => {
    setAdmins(admins.map(admin => 
      admin.id === selectedAdmin.id 
        ? { ...admin, name: formData.name, email: formData.email, username: formData.username }
        : admin
    ));
    setIsEditModalOpen(false);
    setSelectedAdmin(null);
    setFormData({ name: '', email: '', username: '', password: '' });
  };

  const handleDeleteAdmin = (id) => {
    const admin = admins.find(a => a.id === id);
    setArchiveModal({
      isOpen: true,
      title: 'Archive Admin Account',
      message: 'Are you sure you want to archive this admin account? This will move it to the archive list.',
      onConfirm: (reason) => {
        const archivedItem = {
          ...admin,
          reason,
          archivedAt: new Date().toISOString()
        };
        const currentArchive = JSON.parse(localStorage.getItem('archivedItems') || '[]');
        localStorage.setItem('archivedItems', JSON.stringify([...currentArchive, archivedItem]));
        setAdmins(admins.filter(a => a.id !== id));
      },
    });
  };

  const openDetails = (admin) => setSelectedAdmin(admin);
  const closeDetails = () => setSelectedAdmin(null);

  return (
    <AdminLayout pageTitle="Admin Account Management" onSearchChange={handleSearchChange}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#143F81] text-white rounded-lg hover:bg-[#1a4fa3] font-medium"
        >
          + Add New Admin
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#143F81] px-6 py-4">
          <h2 className="text-white font-bold text-lg">Admin Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-sm font-medium text-[#143F81] hover:underline text-left"
                      onClick={() => openDetails(admin)}
                    >
                      {admin.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.lastActive}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="text-[#143F81] hover:text-blue-800"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Archive"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Details Modal */}
      {selectedAdmin && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#143F81] mb-4">Admin Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Name</p>
                <p className="text-gray-900">{selectedAdmin.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Email</p>
                <p className="text-gray-900">{selectedAdmin.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Username</p>
                <p className="text-gray-900">{selectedAdmin.username}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">ID</p>
                <p className="text-gray-900">{selectedAdmin.id}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="font-semibold text-gray-700">Status</p>
                  <p className="text-gray-900">{selectedAdmin.status}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Last Active</p>
                  <p className="text-gray-900">{selectedAdmin.lastActive}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Created At</p>
                <p className="text-gray-900">{selectedAdmin.createdAt}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                onClick={closeDetails}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3]"
                onClick={() => handleEditAdmin(selectedAdmin)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#143F81] mb-4">Add New Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                  placeholder="admin_user"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ name: '', email: '', username: '', password: '' });
                  setErrors({ name: '', email: '', password: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3]"
                onClick={handleAddAdmin}
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#143F81] mb-4">Edit Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAdmin(null);
                  setFormData({ name: '', email: '', username: '', password: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3]"
                onClick={handleUpdateAdmin}
              >
                Update
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

export default AdminAccountManagement;

