import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../component/ConfirmationModal';
import EditProfileModal from '../component/EditProfileModal';
import { getCurrentRole, logout, ROLES } from '../utils/auth';
import CareConnectWheelchairLogo from '../component/img/CareConnectWheelchairLogo.png';

function AdminLayout({
  pageTitle = 'Overview',
  children,
  onSearchChange
}) 
{
 
  const role = getCurrentRole() || ROLES.ADMIN; // fallback to "ADMIN"

  const navLinkBase =
    'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors';
  const navInactive = 'text-blue-200 hover:bg-blue-800';                    
  const navActive = 'bg-blue-600 text-white';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    logout(); // Use centralized logout utility
    navigate('/tab/login', { replace: true });
  };

  const handleNavLinkClick = () => {
    // Close sidebar on mobile when a nav link is clicked
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Left Sidebar - Dark Blue */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#143F81] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-800 relative">
          {/* Close Button - Visible only on mobile/tablet */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mb-1 flex items-center gap-2">
            <img 
              src={CareConnectWheelchairLogo} 
              alt="CareConnect Logo" 
              className="h-8 w-8"
            />
            <span className="text-white font-semibold text-lg">CareConnect</span>
          </div>
          <p className="text-blue-200 text-xs">
          Welcome, {role === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Admin'}</p>

        </div>

        {/* Navigation Menu (Dashboard, Caregivers, Patients) */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to={role === 'SUPER_ADMIN' ? '/superadmin/dashboard' : '/admin/dashboard'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to={role === 'SUPER_ADMIN' ? '/superadmin/caregivers' : '/admin/caregivers'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Caregivers</span>
          </NavLink>

          <NavLink
            to={role === 'SUPER_ADMIN' ? '/superadmin/patients' : '/admin/patients'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Patients</span>
          </NavLink>

          <NavLink
            to={role === 'SUPER_ADMIN' ? '/superadmin/archive' : '/admin/archive'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Archive</span>
          </NavLink>

          {role === ROLES.SUPER_ADMIN && (
            <NavLink
              to="/superadmin/admins"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navActive : navInactive}`
              }
              onClick={handleNavLinkClick}
            >
              <span className="font-medium">Manage Admins</span>
            </NavLink>
          )}
            
        </nav>

        {/* Settings / Reports / Subscribe removed as requested */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white w-full lg:w-auto">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Hamburger Menu Button + Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Visible on mobile/tablet */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#143F81]"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{pageTitle}</span>
            </div>
          </div>

          {/* Search + Account dropdown */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143F81] focus:border-transparent w-32 sm:w-48 md:w-64"
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
              {role === ROLES.SUPER_ADMIN ? 'SA' : 'AD'}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
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