import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../component/ConfirmationModal';
import EditProfileModal from '../component/EditProfileModal';

function AdminLayout({ pageTitle = 'Overview', children, onSearchChange }) {
  const navLinkBase =
    'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors';
  const navInactive = 'text-blue-200 hover:bg-blue-800';
  const navActive = 'bg-blue-600 text-white';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@careconnect.com',
    username: 'admin'
  });
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    setIsAccountMenuOpen(false);
  };

  const handleSaveProfile = (newData) => {
    setAdminProfile(newData);
    // In a real app, this would be an API call
    console.log('Profile updated:', newData);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    navigate('/tab/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Dark Blue */}
      <div className="w-64 bg-[#143F81] flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-800">
          <div className="mb-1">
            <span className="text-white font-semibold text-lg">CareConnect</span>
          </div>
          <p className="text-blue-200 text-xs">Welcome, Admin</p>
        </div>

        {/* Navigation Menu (Dashboard, Caregivers, Patients) */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/tab/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
          >
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/tab/caregivers"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
          >
            <span className="font-medium">Caregivers</span>
          </NavLink>

          <NavLink
            to="/tab/patients"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
          >
            <span className="font-medium">Patients</span>
          </NavLink>

          <NavLink
            to="/tab/archive"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
          >
            <span className="font-medium">Archive</span>
          </NavLink>
        </nav>

        {/* Settings / Reports / Subscribe removed as requested */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{pageTitle}</span>
          </div>

          {/* Search + Account dropdown */}
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143F81] focus:border-transparent w-64"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((o) => !o)}
              className="w-10 h-10 bg-[#143F81] rounded-full flex items-center justify-center text-white font-bold relative"
            >
              AD
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-12 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleProfileClick}
                >
                  Edit Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogoutClick}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={adminProfile}
      />
    </div>
  );
}

export default AdminLayout;