import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import ArchiveModal from '../../component/ArchiveModal';
import Pagination from '../../component/Pagination';
import ErrorModal from '../../component/ErrorModal';
import SuccessModal from '../../component/SuccessModal';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getAdmins, addAdmin, addPendingAdmin, updateAdmin, archiveAdmin, initializeSuperAdmin, sendAdminVerificationEmail, getPendingAdmins, getCurrentAdminInfo, removePendingAdmin, subscribeToPendingAdmins } from '../../utils/firestoreService';

function AdminAccountManagement() {
  const [admins, setAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    confirmPassword: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [nameSort, setNameSort] = useState('asc'); // 'asc' or 'desc'
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    copyLink: ''
  });
  const [resendingId, setResendingId] = useState(null);
  const [copiedPendingId, setCopiedPendingId] = useState(null);
  const [removingPendingId, setRemovingPendingId] = useState(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Fetch admins and pending admins from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await initializeSuperAdmin();
        const [adminsData, pendingData] = await Promise.all([getAdmins(), getPendingAdmins()]);
        setAdmins(adminsData);
        setPendingAdmins(pendingData);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setError('Failed to load admin accounts. Please check your Firebase connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time listener: when an admin verifies, they disappear from the pending list automatically
    const unsubscribe = subscribeToPendingAdmins((pendingData) => {
      setPendingAdmins(pendingData);
    });
    return () => unsubscribe();
  }, []);

  const handleSearchChange = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // name validation
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    // Check for digits
    if (/\d/.test(name)) return 'Name cannot contain digits';
    // Check for special characters (allow only letters and spaces)
    if (/[^a-zA-Z\s]/.test(name)) return 'Name cannot contain special characters';
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
    
    // Check if domain is one of the allowed domains
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
    if (!allowedDomains.includes(domain.toLowerCase())) {
      return 'Email must be from @gmail.com, @outlook.com, or @yahoo.com';
    }
    
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

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateUsername = (username) => {
    if (!username.trim()) return 'Username is required';
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

  // Handle username input
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    setErrors({ ...errors, username: validateUsername(value) });
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    const updatedFormData = { ...formData, password: value };
    setFormData(updatedFormData);
    setErrors({ 
      ...errors, 
      password: validatePassword(value),
      confirmPassword: formData.confirmPassword ? validateConfirmPassword(formData.confirmPassword, value) : errors.confirmPassword
    });
  };

  // Handle password input for edit mode (optional password)
  const handleEditPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    // Only validate if password is provided
    setErrors({ 
      ...errors, 
      password: value ? validatePassword(value) : ''
    });
  };

  // Handle confirm password input
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
    setErrors({ ...errors, confirmPassword: validateConfirmPassword(value, formData.password) });
  };

  const filteredAdmins = useMemo(
    () => {
      const filtered = admins.filter((admin) => {
        const haystack = `${admin.name} ${admin.email} ${admin.username} ${admin.id}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || admin.status === statusFilter;
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
    [admins, searchTerm, statusFilter, nameSort]
  );

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAdmins.slice(startIndex, endIndex);
  }, [filteredAdmins, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  // Reset to page 1 when search term, filter, or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, nameSort]);

  const handleAddAdmin = async () => {
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    
    if (nameError || emailError || usernameError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        username: usernameError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    // Check for duplicates in existing admins
    const duplicateName = admins.find(admin =>
      admin.name && admin.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );
    const duplicateUsername = admins.find(admin =>
      admin.username && admin.username.toLowerCase() === formData.username.toLowerCase()
    );
    const duplicateEmail = admins.find(admin =>
      admin.email && admin.email.toLowerCase() === formData.email.toLowerCase()
    );

    // Check for duplicate in pending (same email already awaiting verification)
    const duplicatePendingEmail = pendingAdmins.find(p =>
      (p.email || '').toLowerCase() === (formData.email || '').trim().toLowerCase()
    );
    const duplicatePendingUsername = pendingAdmins.find(p =>
      (p.username || '').toLowerCase() === (formData.username || '').trim().toLowerCase()
    );

    if (duplicateName) {
      setErrorModal({
        isOpen: true,
        title: 'Duplicate Full Name',
        message: `Full name "${formData.name}" already exists. Please use a different name.`
      });
      setErrors(prev => ({ ...prev, name: 'Full name already exists' }));
      return;
    }

    if (duplicateUsername) {
      setErrorModal({
        isOpen: true,
        title: 'Duplicate Username',
        message: `Username "${formData.username}" already exists. Please choose a different username.`
      });
      setErrors(prev => ({ ...prev, username: 'Username already exists' }));
      return;
    }

    if (duplicateEmail) {
      setErrorModal({
        isOpen: true,
        title: 'Duplicate Email',
        message: `Email "${formData.email}" is already registered as an admin. Please use a different email address.`
      });
      setErrors(prev => ({ ...prev, email: 'Email already exists' }));
      return;
    }

    if (duplicatePendingEmail) {
      setErrorModal({
        isOpen: true,
        title: 'Email Already Pending',
        message: `A verification link was already sent to "${formData.email}". They must use that link to verify, or wait for it to expire (24 hours) before you can add them again. You can resend the link from the "Pending verification" section below.`
      });
      setErrors(prev => ({ ...prev, email: 'Email already pending verification' }));
      return;
    }

    if (duplicatePendingUsername) {
      setErrorModal({
        isOpen: true,
        title: 'Username Already Pending',
        message: `Username "${formData.username}" is already pending verification. Use a different username or wait for the existing link to expire.`
      });
      setErrors(prev => ({ ...prev, username: 'Username already pending' }));
      return;
    }

    try {
      setIsAddingAdmin(true);
      const createdBy = await getCurrentAdminInfo();
      const { token } = await addPendingAdmin(
        {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        },
        createdBy ? { id: createdBy.id, username: createdBy.username, name: createdBy.name } : null
      );

      const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
      const verificationLink = `${origin}/verify-admin?token=${encodeURIComponent(token)}`;

      let emailSent = false;
      try {
        await sendAdminVerificationEmail(formData.email, verificationLink, token);
        emailSent = true;
      } catch (emailErr) {
        console.warn('Verification email send failed:', emailErr);
        setSuccessModal({
          isOpen: true,
          title: 'Pending admin created',
          message: `Verification email could not be sent (${emailErr.message}). Share the link below with ${formData.email} to verify.`,
          copyLink: verificationLink
        });
      }

      const [adminsData, pendingData] = await Promise.all([getAdmins(), getPendingAdmins()]);
      setAdmins(adminsData);
      setPendingAdmins(pendingData);

      setIsAddingAdmin(false);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '', status: 'Active' });
      setErrors({ name: '', email: '', username: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);

      if (emailSent) {
        setSuccessModal({
          isOpen: true,
          title: 'Verification email sent',
          message: `A verification email was sent to ${formData.email}. The admin will appear in the list once they click "Verify email" in that message.`
        });
      }
    } catch (err) {
      console.error('Error adding admin:', err);
      setIsAddingAdmin(false);
      setErrorModal({
        isOpen: true,
        title: 'Failed to Add Admin',
        message: err.message || 'Failed to add admin. Please try again.'
      });
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: '',
      status: admin.status,
    });
    setErrors({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async () => {
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const usernameError = validateUsername(formData.username);
    const passwordError = formData.password ? validatePassword(formData.password) : '';
    
    if (nameError || emailError || usernameError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        username: usernameError,
        password: passwordError,
        confirmPassword: '',
      });
      return;
    }

    try {
      const updates = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        status: formData.status
      };
      
      // Only update password if provided
      if (formData.password) {
        updates.password = formData.password;
      }
      
      await updateAdmin(selectedAdmin.id, updates);
      
      // Refresh the list
      const data = await getAdmins();
      setAdmins(data);
      
      setIsEditModalOpen(false);
      setSelectedAdmin(null);
      setFormData({ name: '', email: '', username: '', password: '', status: 'Active' });
      setErrors({ name: '', email: '', username: '', password: '', confirmPassword: '' });
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        title: 'Admin Updated',
        message: `Admin account has been updated successfully!`
      });
    } catch (err) {
      console.error('Error updating admin:', err);
      setErrorModal({
        isOpen: true,
        title: 'Failed to Update Admin',
        message: err.message || 'Failed to update admin. Please try again.'
      });
    }
  };

  const handleDeleteAdmin = (id) => {
    const admin = admins.find(a => a.id === id);
    setArchiveModal({
      isOpen: true,
      title: 'Archive Admin Account',
      message: 'Are you sure you want to archive this admin account? This will move it to the archive list.',
      onConfirm: async (reason) => {
        try {
          await archiveAdmin(id, reason);
          // Refresh the list
          const data = await getAdmins();
          setAdmins(data);
          
          // Show success modal
          setSuccessModal({
            isOpen: true,
            title: 'Admin Archived',
            message: 'Admin account has been archived successfully!'
          });
        } catch (err) {
          console.error('Error archiving admin:', err);
          setErrorModal({
            isOpen: true,
            title: 'Failed to Archive Admin',
            message: err.message || 'Failed to archive admin. Please try again.'
          });
        }
      },
    });
  };

  const openDetails = (admin) => setSelectedAdmin(admin);
  const closeDetails = () => setSelectedAdmin(null);

  if (loading) {
    return (
      <AdminLayout pageTitle="Admin Account Management" onSearchChange={handleSearchChange}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600">Loading admin accounts...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Admin Account Management" onSearchChange={handleSearchChange}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#143F81] text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

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

      {pendingAdmins.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2">Pending verification</h3>
          <p className="text-sm text-amber-800 mb-3">These admins have been sent a verification email. They will appear in the list below once they click the link in the email.</p>
          <ul className="space-y-3 text-sm">
            {pendingAdmins.map((p) => {
              const verificationLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-admin?token=${encodeURIComponent(p.id)}`;
              const isResending = resendingId === p.id;
              const justCopied = copiedPendingId === p.id;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-2 text-amber-900">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-amber-700">({p.email})</span>
                  <span className="text-amber-600">— {p.expired ? 'link expired' : 'verification email sent'}</span>
                  <span className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={async () => {
                        setResendingId(p.id);
                        try {
                          await sendAdminVerificationEmail(p.email, verificationLink, p.id);
                          setSuccessModal({ isOpen: true, title: 'Email resent', message: `Verification email resent to ${p.email}.`, copyLink: '' });
                          const [adminsData, pendingData] = await Promise.all([getAdmins(), getPendingAdmins()]);
                          setAdmins(adminsData);
                          setPendingAdmins(pendingData);
                        } catch (err) {
                          setErrorModal({ isOpen: true, title: 'Resend failed', message: err.message || 'Could not resend email. You can copy the link and send it manually.' });
                        } finally {
                          setResendingId(null);
                        }
                      }}
                      className="px-2 py-1 rounded bg-amber-200 text-amber-900 hover:bg-amber-300 disabled:opacity-50 text-xs font-medium"
                    >
                      {isResending ? 'Sending…' : 'Resend email'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(verificationLink);
                          setCopiedPendingId(p.id);
                          setTimeout(() => setCopiedPendingId(null), 2000);
                        } catch (_) {}
                      }}
                      className="px-2 py-1 rounded bg-amber-200 text-amber-900 hover:bg-amber-300 text-xs font-medium"
                    >
                      {justCopied ? 'Copied!' : 'Copy link'}
                    </button>
                    <button
                      type="button"
                      disabled={removingPendingId === p.id}
                      onClick={async () => {
                        if (!window.confirm(`Remove pending admin "${p.name}" (${p.email})? You can add them again to send a new verification email.`)) return;
                        setRemovingPendingId(p.id);
                        try {
                          await removePendingAdmin(p.id);
                          setSuccessModal({ isOpen: true, title: 'Pending removed', message: `You can now add ${p.email} again to send a new verification email.`, copyLink: '' });
                          const [adminsData, pendingData] = await Promise.all([getAdmins(), getPendingAdmins()]);
                          setAdmins(adminsData);
                          setPendingAdmins(pendingData);
                        } catch (err) {
                          setErrorModal({ isOpen: true, title: 'Remove failed', message: err.message || 'Could not remove pending admin.' });
                        } finally {
                          setRemovingPendingId(null);
                        }
                      }}
                      className="px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 text-xs font-medium"
                    >
                      {removingPendingId === p.id ? 'Removing…' : 'Remove'}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#143F81] px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Admin Accounts</h2>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAdmins.map((admin) => (
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
        {filteredAdmins.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAdmins.length}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Admin Details Modal - Card Style */}
      {selectedAdmin && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30" onClick={closeDetails}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#143F81]">Admin Details</h2>
              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
                  <p className="text-base font-medium text-gray-900">{selectedAdmin.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-base text-gray-900">{selectedAdmin.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Username</p>
                  <p className="text-base text-gray-900">{selectedAdmin.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin ID</p>
                  <p className="text-base font-mono text-gray-900">{selectedAdmin.id || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedAdmin.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAdmin.status || 'N/A'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-base text-gray-900">{selectedAdmin.role || 'ADMIN'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Active</p>
                <p className="text-sm text-gray-900">{selectedAdmin.lastActive || 'Never'}</p>
              </div>

              {selectedAdmin.createdAt && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created At</p>
                  <p className="text-sm text-gray-900">
                    {selectedAdmin.createdAt instanceof Date 
                      ? selectedAdmin.createdAt.toLocaleString()
                      : selectedAdmin.createdAt
                    }
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                onClick={closeDetails}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3] transition-colors"
                onClick={() => {
                  closeDetails();
                  handleEditAdmin(selectedAdmin);
                }}
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
            {isAddingAdmin ? (
              <div className="py-10 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#143F81] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 text-center">Adding admin and sending verification email...</p>
                <p className="text-gray-500 text-sm text-center">This may take a few seconds.</p>
              </div>
            ) : (
            <>
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
                  placeholder="Juan Dela Cruz"
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
                  placeholder="admin@gmail.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent using 'superadmin' as username
                    if (value.toLowerCase() === 'superadmin') {
                      setErrors({ ...errors, username: 'Username "superadmin" is reserved for the system account' });
                    } else {
                      handleUsernameChange(e);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="adminjuan"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                <p className="text-gray-500 text-xs mt-1">Note: "superadmin" is reserved for the system account</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                onClick={() => {
                  if (isAddingAdmin) return;
                  setIsAddModalOpen(false);
                  setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '' });
                  setErrors({ name: '', email: '', username: '', password: '', confirmPassword: '' });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                disabled={isAddingAdmin}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#143F81] text-white text-sm font-medium hover:bg-[#1a4fa3] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddAdmin}
                disabled={isAddingAdmin}
              >
                Add Admin
              </button>
            </div>
            </>
            )}
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
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent changing username to 'superadmin'
                    if (value.toLowerCase() === 'superadmin') {
                      setErrors({ ...errors, username: 'Username "superadmin" is reserved for the system account' });
                      return;
                    }
                    handleUsernameChange(e);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleEditPasswordChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showEditPassword ? "Hide password" : "Show password"}
                  >
                    {showEditPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAdmin(null);
                  setFormData({ name: '', email: '', username: '', password: '', status: 'Active' });
                  setErrors({ name: '', email: '', username: '', password: '', confirmPassword: '' });
                  setShowEditPassword(false);
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

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '', copyLink: '' })}
        title={successModal.title}
        message={successModal.message}
        copyLink={successModal.copyLink}
      />
    </AdminLayout>
  );
}

export default AdminAccountManagement;

