import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticate, setUserRole, ROLES } from '../utils/auth';
import { authenticateAdmin } from '../utils/firestoreService';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ErrorModal from '../component/ErrorModal';

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
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
                
                // Store admin profile data in localStorage for EditProfileModal
                localStorage.setItem('adminProfile', JSON.stringify({
                    fullName: adminData.name || 'Admin User',
                    email: adminData.email || '',
                    username: adminData.username || '',
                    adminId: adminData.id || ''
                }));

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
                
                const errorMessage = error.message || 'Invalid username or password. Please try again.';
                
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
        <div className="p-10 text-center flex flex-col items-center">
            <h1 className="text-white text-2xl font-semibold mb-10 tracking-wide">
                Welcome, Admin!
            </h1>

            <div className="flex flex-col gap-4 w-70 mx-auto">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="px-5 py-4 rounded-xl outline-none bg-white w-full placeholder-black/50 font-bold"
                />
                {errors.username && (
                    <p className="text-red-400 text-sm text-left">{errors.username}</p>
                )}

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="px-5 py-4 rounded-xl outline-none bg-white w-full placeholder-black/50 font-bold"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                            
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-400 text-sm text-left">{errors.password}</p>
                )}
            </div>

            <Link
                to="/tab/forgot-password"
                className="hover:underline w-full text-right mt-1 text-white text-sm font-semibold cursor-pointer"
            >
                Forgot Password?
            </Link>
            
            <button
                onClick={handleLogin}
                className="bg-white text-[#143F81] font-bold text-2xl md:text-xl px-9 md:px-7 py-2 rounded-xl mt-4 cursor-pointer hover:bg-gray-100"
            >
                LOGIN
            </button>
            
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
