import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, setUserRole, ROLES } from '../utils/auth';
import { authenticateAdmin, checkAdminAccountStatus, getAdminByEmail, createLogEntry } from '../utils/firestoreService';
import { signInWithGoogle } from '../utils/firebase';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ErrorModal from '../component/ErrorModal';
import bgApp from '../component/img/bg_app.jpeg';
import CareConnectLogo from '../component/img/CareConnectLogo.png';

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [accountStatus, setAccountStatus] = useState({
        isArchived: false,
        isInactive: false,
        message: ''
    });
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    const validateField = (name, value) => {
        if (name === 'password') {
            if (!value) return 'Password is required';
        }

        return '';
    };

    // Check account status when username and password are entered
    useEffect(() => {
        const checkStatus = async () => {
            if (formData.username.trim() && formData.password.trim()) {
                setIsCheckingStatus(true);
                try {
                    const status = await checkAdminAccountStatus(formData.username.trim());
                    if (status.isArchived) {
                        setAccountStatus({
                            isArchived: true,
                            isInactive: false,
                            message: 'Your account has been archived. Please contact superadmin.'
                        });
                    } else if (status.isInactive) {
                        setAccountStatus({
                            isArchived: false,
                            isInactive: true,
                            message: 'Your account is inactive. Please contact superadmin.'
                        });
                    } else {
                        setAccountStatus({
                            isArchived: false,
                            isInactive: false,
                            message: ''
                        });
                    }
                } catch (error) {
                    console.error('Error checking account status:', error);
                    // Reset status on error
                    setAccountStatus({
                        isArchived: false,
                        isInactive: false,
                        message: ''
                    });
                } finally {
                    setIsCheckingStatus(false);
                }
            } else {
                // Reset status if fields are empty
                setAccountStatus({
                    isArchived: false,
                    isInactive: false,
                    message: ''
                });
            }
        };

        // Debounce the check
        const timeoutId = setTimeout(checkStatus, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.username, formData.password]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: validateField(name, value)
            }));

            return updated;
        });
    };

    const handleLogin = async () => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                console.log('Starting authentication...');
                console.log('Username:', formData.username);
                console.log('Password length:', formData.password.length);
                
                // Get admin data for profile
                const adminData = await authenticateAdmin(formData.username.trim(), formData.password);
                
                if (!adminData) {
                    throw new Error('Invalid username or password');
                }
                
                // Use centralized authentication to get role
                const role = await authenticate(formData.username.trim(), formData.password);
                
                console.log('Authentication successful, role:', role);
                console.log('Admin data:', adminData);
                
                // Save role using centralized utility
                setUserRole(role);
                
                // Also store in sessionStorage (tab-specific) to prevent cross-tab interference
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('sessionRole', role);
                }
                
                // Store admin profile data in localStorage for EditProfileModal
                const profileData = {
                    fullName: adminData.name || 'Admin User',
                    email: adminData.email || '',
                    username: adminData.username || '',
                    adminId: adminData.id || ''
                };
                localStorage.setItem('adminProfile', JSON.stringify(profileData));
                
                // Also store in sessionStorage (tab-specific) to prevent cross-tab interference
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('adminProfile', JSON.stringify(profileData));
                }

                console.log('Login success:', role);

                // Role-based redirect
                // Use replace: true to prevent back button from going back to login
                if (role === ROLES.SUPER_ADMIN) {
                    console.log('Redirecting to super admin dashboard');
                    navigate('/superadmin/dashboard', { replace: true });
                } else {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin/dashboard', { replace: true });
                }
            } catch (error) {
                console.error('Login error:', error);
                console.error('Error type:', error.constructor.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                let errorMessage = error.message || 'Invalid username or password. Please try again.';
                
                // Handle specific account status errors
                if (error.message === 'ACCOUNT_INACTIVE') {
                    errorMessage = 'Your account is inactive. Please contact superadmin.';
                } else if (error.message === 'ACCOUNT_ARCHIVED') {
                    errorMessage = 'Your account has been archived. Please contact superadmin.';
                }
                
                // Show error modal instead of alert
                setErrorModal({
                    isOpen: true,
                    title: 'Login Failed',
                    message: errorMessage
                });
            }
        } else {
            alert('Please fill in all fields correctly.');
        }
    };

    const isFormValid = Object.keys(formData).every((key) => {
        return validateField(key, formData[key]) === '';
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl h-[620px]">
                {/* Left Side - Image */}
                <div className="hidden w-1/2 md:block relative">
                    <img 
                        src={bgApp} 
                        alt="App Background" 
                        className="h-full w-full object-cover object-[70%_50%]"
                    />
                </div>

                {/* Right Side - Form - extra space below Google button */}
                <div className="flex w-full flex-col justify-center px-8 py-4 pb-10 md:w-1/2 md:px-16 md:py-6 md:pb-14 relative overflow-hidden min-h-0">
                    <div className="flex flex-col gap-1 md:gap-2">
                        {/* Logo */}
                        <div>
                            <img 
                                src={CareConnectLogo} 
                                alt="CareConnect Logo" 
                                className="h-28 w-auto md:h-36" 
                            />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin</h2>

                        <div className="space-y-4">
                            {/* Username Input */}
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-500">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full border-b border-gray-300 py-2 text-lg font-medium text-gray-900 focus:border-[#143F81] focus:outline-none transition-colors"
                                />
                                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-500">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border-b border-gray-300 py-2 text-lg font-medium text-gray-900 focus:border-[#143F81] focus:outline-none pr-10 transition-colors"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#143F81] transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Account Status Warning */}
                            {accountStatus.message && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-700 text-sm text-center font-medium">
                                        {accountStatus.message}
                                    </p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                onClick={handleLogin}
                                disabled={accountStatus.isArchived || accountStatus.isInactive || isCheckingStatus}
                                className={`w-full rounded-full py-3.5 text-lg font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] ${
                                    accountStatus.isArchived || accountStatus.isInactive || isCheckingStatus
                                        ? 'bg-gray-400 cursor-not-allowed shadow-none hover:scale-100'
                                        : 'bg-[#143F81] hover:bg-blue-800 hover:shadow-xl'
                                }`}
                            >
                                {isCheckingStatus ? 'Checking...' : 'Login'}
                            </button>

                            {/* Divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-3 text-sm text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Google Sign In - always shows account picker (prompt: select_account) */}
                            <button
                                type="button"
                                disabled={isGoogleLoading}
                                onClick={async () => {
                                    setIsGoogleLoading(true);
                                    try {
                                        const { user } = await signInWithGoogle();
                                        const email = user?.email;
                                        if (!email) {
                                            setErrorModal({ isOpen: true, title: 'Sign-in failed', message: 'No email from Google account.' });
                                            return;
                                        }
                                        const adminData = await getAdminByEmail(email);
                                        if (!adminData) {
                                            setErrorModal({ isOpen: true, title: 'No admin account', message: 'No admin account is linked to this Google email. Use username/password or contact superadmin.' });
                                            return;
                                        }
                                        if (adminData.status === 'Inactive') {
                                            setErrorModal({ isOpen: true, title: 'Account inactive', message: 'Your account is inactive. Please contact superadmin.' });
                                            return;
                                        }
                                        const role = adminData.role || ROLES.ADMIN;
                                        setUserRole(role);
                                        if (typeof sessionStorage !== 'undefined') {
                                            sessionStorage.setItem('sessionRole', role);
                                        }
                                        const profileData = {
                                            fullName: adminData.name || 'Admin User',
                                            email: adminData.email || '',
                                            username: adminData.username || '',
                                            adminId: adminData.id || ''
                                        };
                                        localStorage.setItem('adminProfile', JSON.stringify(profileData));
                                        if (typeof sessionStorage !== 'undefined') {
                                            sessionStorage.setItem('adminProfile', JSON.stringify(profileData));
                                        }
                                        createLogEntry('LOGIN', 'admin', adminData.id, adminData.name, { role, method: 'google' }, adminData).catch(() => {});
                                        if (role === ROLES.SUPER_ADMIN) {
                                            navigate('/superadmin/dashboard', { replace: true });
                                        } else {
                                            navigate('/admin/dashboard', { replace: true });
                                        }
                                    } catch (err) {
                                        if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
                                            setErrorModal({ isOpen: true, title: 'Google sign-in failed', message: err?.message || 'Could not sign in with Google.' });
                                        }
                                    } finally {
                                        setIsGoogleLoading(false);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-full py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
                title={errorModal.title}
                message={errorModal.message}
            />
        </div>
    );
}

export default Login;