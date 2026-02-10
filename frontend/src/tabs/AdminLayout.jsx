import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../component/ConfirmationModal';
import EditProfileModal from '../component/EditProfileModal';
import SuccessModal from '../component/SuccessModal';
import { getCurrentRole, logout, ROLES } from '../utils/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { SUPER_ADMIN_CREDENTIALS, createLogEntry } from '../utils/firestoreService';
import CareConnectWheelChairLogo from '../component/img/CareConnectWheelChairLogo.png';

function AdminLayout({
  pageTitle = 'Overview',
  children,
  onSearchChange
}) 
{
  // Use state to preserve role across re-renders - initialize once and don't let it be overwritten
  const [role, setRole] = useState(() => {
    const storedRole = getCurrentRole();
    return storedRole || ROLES.ADMIN;
  });
  
  // Store initial role in sessionStorage (tab-specific) to prevent cross-tab interference
  const [sessionRole] = useState(() => {
    const storedRole = getCurrentRole();
    if (storedRole && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sessionRole', storedRole);
      return storedRole;
    }
    // Try to get from sessionStorage if localStorage was overwritten
    if (typeof sessionStorage !== 'undefined') {
      const sessionStored = sessionStorage.getItem('sessionRole');
      if (sessionStored) {
        return sessionStored;
      }
    }
    return storedRole || ROLES.ADMIN;
  });

  // Function to get role - prioritize sessionStorage (tab-specific) over localStorage (shared)
  const getRole = () => {
    // First check sessionStorage (tab-specific)
    if (typeof sessionStorage !== 'undefined') {
      const sessionStored = sessionStorage.getItem('sessionRole');
      if (sessionStored) {
        return sessionStored;
      }
    }
    // Fallback to localStorage
    const storedRole = getCurrentRole();
    return storedRole || ROLES.ADMIN;
  };

  // Only update role on mount, never let it be overwritten by localStorage changes from other tabs
  useEffect(() => {
    // Set sessionStorage on mount to preserve this tab's role
    const currentRole = getCurrentRole();
    if (currentRole && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sessionRole', currentRole);
      setRole(currentRole);
    } else if (typeof sessionStorage !== 'undefined') {
      // If localStorage was cleared, try to restore from sessionStorage
      const sessionStored = sessionStorage.getItem('sessionRole');
      if (sessionStored) {
        setRole(sessionStored);
      }
    }
  }, []); // Only run once on mount

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
    fullName: '',
    email: '',
    username: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const navigate = useNavigate();

  // Fetch current admin profile data on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoadingProfile(true);
        
        // Get role first (from sessionStorage or localStorage)
        const currentRole = getRole();
        
        // For superadmin, ALWAYS fetch from Firestore or use credentials, NEVER from localStorage
        // This prevents cross-tab interference where another tab's login overwrites localStorage
        if (currentRole === ROLES.SUPER_ADMIN) {
          try {
            // Fetch super admin data from Firestore
            const superAdminRef = doc(db, 'admins', SUPER_ADMIN_CREDENTIALS.DOC_ID);
            const superAdminSnap = await getDoc(superAdminRef);
            
            let profileData;
            if (superAdminSnap.exists()) {
              const data = superAdminSnap.data();
              profileData = {
                fullName: data.name || 'Super Administrator',
                email: data.email || 'superadmin@careconnect.com',
                username: data.username || SUPER_ADMIN_CREDENTIALS.USERNAME
              };
            } else {
              // Fallback to default super admin data
              profileData = {
                fullName: 'Super Administrator',
                email: 'superadmin@careconnect.com',
                username: SUPER_ADMIN_CREDENTIALS.USERNAME
              };
            }
            
            setAdminProfile(profileData);
            
            // Store in sessionStorage for this tab (tab-specific)
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('adminProfile', JSON.stringify({
                ...profileData,
                adminId: SUPER_ADMIN_CREDENTIALS.DOC_ID
              }));
            }
          } catch (error) {
            console.error('Error fetching super admin profile:', error);
            // Fallback to credentials
            const profileData = {
              fullName: 'Super Administrator',
              email: 'superadmin@careconnect.com',
              username: SUPER_ADMIN_CREDENTIALS.USERNAME
            };
            setAdminProfile(profileData);
            
            // Store in sessionStorage for this tab
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('adminProfile', JSON.stringify({
                ...profileData,
                adminId: SUPER_ADMIN_CREDENTIALS.DOC_ID
              }));
            }
          }
        } else {
          // For regular admins, check sessionStorage first (tab-specific), then localStorage
          let storedProfile = null;
          if (typeof sessionStorage !== 'undefined') {
            storedProfile = sessionStorage.getItem('adminProfile');
          }
          if (!storedProfile) {
            storedProfile = localStorage.getItem('adminProfile');
          }
          
          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              setAdminProfile({
                fullName: profile.fullName || 'Admin User',
                email: profile.email || '',
                username: profile.username || ''
              });
            } catch (e) {
              console.warn('Failed to parse stored profile:', e);
              // Fallback
              setAdminProfile({
                fullName: 'Admin User',
                email: 'admin@careconnect.com',
                username: 'admin'
              });
            }
          } else {
            // Fallback
            setAdminProfile({
              fullName: 'Admin User',
              email: 'admin@careconnect.com',
              username: 'admin'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // Fallback to default
        const currentRole = getRole();
        setAdminProfile({
          fullName: currentRole === ROLES.SUPER_ADMIN ? 'Super Administrator' : 'Admin User',
          email: currentRole === ROLES.SUPER_ADMIN ? 'superadmin@careconnect.com' : 'admin@careconnect.com',
          username: currentRole === ROLES.SUPER_ADMIN ? SUPER_ADMIN_CREDENTIALS.USERNAME : 'admin'
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchAdminProfile();
  }, []); // Run once on mount

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    setIsAccountMenuOpen(false);
  };

  const handleSaveProfile = async (newData) => {
    try {
      const currentRole = getRole();
      let adminId = null;
      
      // Get adminId from sessionStorage first (tab-specific), then localStorage
      let storedProfile = null;
      if (typeof sessionStorage !== 'undefined') {
        storedProfile = sessionStorage.getItem('adminProfile');
      }
      if (!storedProfile) {
        storedProfile = localStorage.getItem('adminProfile');
      }
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        adminId = profile.adminId;
      }
      
      // Update in Firestore
      if (currentRole === ROLES.SUPER_ADMIN) {
        // Update super admin - always use SUPER_ADMIN_CREDENTIALS.DOC_ID
        adminId = SUPER_ADMIN_CREDENTIALS.DOC_ID;
        const superAdminRef = doc(db, 'admins', SUPER_ADMIN_CREDENTIALS.DOC_ID);
        await updateDoc(superAdminRef, {
          name: newData.fullName,
          email: newData.email,
          username: newData.username,
          ...(newData.password && { password: newData.password })
        });
      } else if (adminId) {
        // Update regular admin
        const adminRef = doc(db, 'admins', adminId);
        await updateDoc(adminRef, {
          name: newData.fullName,
          email: newData.email,
          username: newData.username,
          ...(newData.password && { password: newData.password })
        });
      }
      
      // Update local state
      setAdminProfile(newData);
      
      // Update both sessionStorage (tab-specific) and localStorage
      const profileData = {
        ...newData,
        adminId: adminId || SUPER_ADMIN_CREDENTIALS.DOC_ID
      };
      
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('adminProfile', JSON.stringify(profileData));
      }
      localStorage.setItem('adminProfile', JSON.stringify(profileData));
      
      console.log('Profile updated successfully:', newData);
      
      // Close edit profile modal
      setIsProfileModalOpen(false);
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Close edit profile modal
      setIsProfileModalOpen(false);
      
      // Show error modal
      setSuccessModal({
        isOpen: true,
        title: 'Update Failed',
        message: `Failed to update profile: ${error.message || 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    // Log logout action before clearing data (non-blocking)
    // Get profile from sessionStorage first (tab-specific), then localStorage
    let adminProfile = null;
    if (typeof sessionStorage !== 'undefined') {
      adminProfile = sessionStorage.getItem('adminProfile');
    }
    if (!adminProfile) {
      adminProfile = localStorage.getItem('adminProfile');
    }
    
    if (adminProfile) {
      try {
        const profile = JSON.parse(adminProfile);
        const currentRole = getRole();
        
        // Prepare adminInfo object to pass directly to createLogEntry
        // This ensures the correct admin is logged, even if session is being cleared
        const adminInfo = {
          id: profile.adminId || '',
          username: profile.username || '',
          name: profile.fullName || 'Unknown Admin'
        };
        
        // For superadmin, ensure we use the correct ID
        if (currentRole === ROLES.SUPER_ADMIN) {
          adminInfo.id = SUPER_ADMIN_CREDENTIALS.DOC_ID;
          adminInfo.username = SUPER_ADMIN_CREDENTIALS.USERNAME;
        }
        
        // Pass adminInfo directly to createLogEntry (6th parameter)
        // This prevents it from trying to get admin info after logout has started
        createLogEntry('LOGOUT', 'admin', adminInfo.id, adminInfo.name, {
          username: adminInfo.username
        }, adminInfo).catch(() => {
          // Silently fail - don't block logout
        });
      } catch (error) {
        // Silently fail - don't block logout
        console.warn('Error logging logout:', error);
      }
    }
    
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
              src={CareConnectWheelChairLogo} 
              alt="CareConnect Logo" 
              className="h-8 w-8"
            />
            <span className="text-white font-semibold text-lg">CareConnect</span>
          </div>
          <p className="text-blue-200 text-xs">
          Welcome, {getRole() === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Admin'}</p>

        </div>

        {/* Navigation Menu (Dashboard, Caregivers, Patients) */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to={getRole() === ROLES.SUPER_ADMIN ? '/superadmin/dashboard' : '/admin/dashboard'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to={getRole() === ROLES.SUPER_ADMIN ? '/superadmin/caregivers' : '/admin/caregivers'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Caregivers</span>
          </NavLink>

          <NavLink
            to={getRole() === ROLES.SUPER_ADMIN ? '/superadmin/patients' : '/admin/patients'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Patients</span>
          </NavLink>

          <NavLink
            to={getRole() === ROLES.SUPER_ADMIN ? '/superadmin/archive' : '/admin/archive'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Archive</span>
          </NavLink>

          <NavLink
            to={getRole() === ROLES.SUPER_ADMIN ? '/superadmin/logs' : '/admin/logs'}
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navActive : navInactive}`
            }
            onClick={handleNavLinkClick}
          >
            <span className="font-medium">Logs</span>
          </NavLink>

          {getRole() === ROLES.SUPER_ADMIN && (
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
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between gap-1 sm:gap-2 min-w-0">
          {/* Hamburger Menu Button + Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1 overflow-hidden">
            {/* Hamburger Menu Button - Visible on mobile/tablet */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#143F81] flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
            
            {/* Breadcrumb - Show only page title on very small screens */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden md:inline">Dashboard</span>
              <span className="text-gray-300 hidden md:inline">/</span>
              <span className="text-gray-900 font-medium truncate">{pageTitle}</span>
            </div>
          </div>

          {/* Search + Account dropdown */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 relative flex-shrink-0">
            {/* Search - Smaller on mobile, hide on very small screens if needed */}
            <div className="hidden sm:block relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 md:pl-10 pr-2 md:pr-3 lg:pr-4 py-1.5 md:py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143F81] focus:border-transparent w-20 sm:w-32 md:w-48 lg:w-64 text-xs sm:text-sm"
              />
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute left-2 md:left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Account button - Always visible, ensure it doesn't shrink */}
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((o) => !o)}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-[#143F81] rounded-full flex items-center justify-center text-white font-bold relative flex-shrink-0 text-xs sm:text-sm"
              title={adminProfile.fullName || (getRole() === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Admin')}
            >
              {(() => {
                // Get initials from admin's full name
                if (adminProfile.fullName && adminProfile.fullName.trim()) {
                  const nameParts = adminProfile.fullName.trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    // First letter of first name + first letter of last name
                    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
                  } else if (nameParts.length === 1) {
                    // If only one word, use first two letters
                    return nameParts[0].substring(0, 2).toUpperCase();
                  }
                }
                // Fallback to role-based initials if name not available
                return getRole() === ROLES.SUPER_ADMIN ? 'SA' : 'AD';
              })()}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-10 sm:top-11 md:top-12 w-32 sm:w-36 md:w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleProfileClick}
                >
                  Edit Profile
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
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
        isOpen={isProfileModalOpen && !loadingProfile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={adminProfile}
      />

      {/* Success/Error Modal for Profile Updates */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '', type: 'success' })}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
      />
    </div>
  );
}

export default AdminLayout;