import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticate, setUserRole, ROLES } from '../utils/auth';
import { authenticateAdmin, checkAdminAccountStatus } from '../utils/firestoreService';
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
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    const validateField = (name, value) => {
        if (name === 'username') {
            if (!value.trim()) return 'Username is required';
        }

        if (name === 'password') {
            if (!value) return 'Password is required';
            if (value.length < 6) return 'Invalid password.';
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
            <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl h-[600px]">
                {/* Left Side - Image */}
                <div className="hidden w-1/2 md:block relative">
                    <img 
                        src={bgApp} 
                        alt="App Background" 
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Right Side - Form */}
                <div className="flex w-full flex-col justify-center px-8 md:w-1/2 md:px-16 relative">
                    {/* Logo */}
                    <div className="absolute top-6 left-6 md:left-12">
                        <img 
                            src={CareConnectLogo} 
                            alt="CareConnect Logo" 
                            className="h-40 w-auto" 
                        />
                    </div>

                    <div className="mt-12">
                        <h2 className="mb-8 text-3xl font-bold text-gray-800">Welcome, Admin</h2>

                        <div className="space-y-6">
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
                            <div className="relative mt-4">
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
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link
                                    to="/tab/forgot-password"
                                    className="text-sm font-medium text-gray-500 hover:text-[#143F81] transition-colors"
                                >
                                    Forgot Password?
                                </Link>
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