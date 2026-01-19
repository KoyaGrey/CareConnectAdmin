import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function EditProfileModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData(prev => ({
                ...prev,
                fullName: initialData.fullName || '',
                email: initialData.email || '',
                username: initialData.username || '',
                password: '',
                confirmPassword: ''
            }));
            setErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [initialData, isOpen]);

    // Validate full name
    const validateFullName = (name) => {
        if (!name.trim()) return 'Full name is required';
        const words = name.trim().split(/\s+/);
        for (const word of words) {
            if (word.length < 2) return 'Each word must be at least 2 letters';
        }
        return '';
    };

    // Validate email
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

    // Validate username
    const validateUsername = (username) => {
        if (!username.trim()) return 'Username is required';
        return '';
    };

    // Validate password
    const validatePassword = (password) => {
        if (!password) return ''; // Password is optional
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 capital letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least 1 special character';
        return '';
    };

    // Validate confirm password
    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return ''; // Only required if password is provided
        if (password && confirmPassword !== password) return 'Passwords do not match';
        return '';
    };

    const validateField = (name, value, data) => {
        switch (name) {
            case 'fullName':
                return validateFullName(value);
            case 'email':
                return validateEmail(value);
            case 'username':
                return validateUsername(value);
            case 'password':
                return validatePassword(value);
            case 'confirmPassword':
                return validateConfirmPassword(value, data.password);
            default:
                return '';
        }
    };

    // Handle full name input with auto-capitalization and character restrictions
    const handleFullNameChange = (e) => {
        let value = e.target.value;
        
        // Remove special characters and numbers
        value = value.replace(/[^a-zA-Z\s]/g, '');
        
        // Auto-capitalize first letter of each word
        value = value.split(' ').map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        
        setFormData(prev => {
            const updated = { ...prev, fullName: value };
            const error = validateFullName(value);
            setErrors(prevErrors => ({
                ...prevErrors,
                fullName: error
            }));
            return updated;
        });
    };

    // Handle email input
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, email: value };
            const error = validateEmail(value);
            setErrors(prevErrors => ({
                ...prevErrors,
                email: error
            }));
            return updated;
        });
    };

    // Handle username input
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, username: value };
            const error = validateUsername(value);
            setErrors(prevErrors => ({
                ...prevErrors,
                username: error
            }));
            return updated;
        });
    };

    // Handle password input
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, password: value };
            const passwordError = validatePassword(value);
            const confirmPasswordError = prev.confirmPassword 
                ? validateConfirmPassword(prev.confirmPassword, value)
                : '';
            
            setErrors(prevErrors => ({
                ...prevErrors,
                password: passwordError,
                confirmPassword: confirmPasswordError
            }));
            return updated;
        });
    };

    // Handle confirm password input
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, confirmPassword: value };
            const error = validateConfirmPassword(value, prev.password);
            setErrors(prevErrors => ({
                ...prevErrors,
                confirmPassword: error
            }));
            return updated;
        });
    };

    const handleChange = (e) => {
        // This is now only used for fields that don't need special handling
        // Full name, email, username, password, confirmPassword have their own handlers
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate all fields
        const fullNameError = validateFullName(formData.fullName);
        const emailError = validateEmail(formData.email);
        const usernameError = validateUsername(formData.username);
        const passwordError = formData.password ? validatePassword(formData.password) : '';
        const confirmPasswordError = formData.password 
            ? validateConfirmPassword(formData.confirmPassword, formData.password)
            : '';
        
        // Set all errors
        const newErrors = {
            fullName: fullNameError,
            email: emailError,
            username: usernameError,
            password: passwordError,
            confirmPassword: confirmPasswordError
        };
        
        setErrors(newErrors);
        
        // Check if there are any errors
        if (fullNameError || emailError || usernameError || passwordError || confirmPasswordError) {
            return; // Don't submit if there are errors
        }
        
        // If password is provided, both password and confirmPassword must be filled
        if (formData.password && !formData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: 'Please confirm your password'
            }));
            return;
        }
        
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#143F81]">Edit Profile</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleFullNameChange}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none ${
                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Juan Dela Cruz"
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        <p className="text-gray-500 text-xs mt-1">Letters only, auto-capitalized, minimum 2 letters per word</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="admin@gmail.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        <p className="text-gray-500 text-xs mt-1">Only @gmail.com, @outlook.com, or @yahoo.com</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleUsernameChange}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none ${
                                errors.username ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="admin_user"
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handlePasswordChange}
                                className={`w-full px-4 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Leave blank to keep current"
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
                        {!errors.password && formData.password && (
                            <p className="text-gray-500 text-xs mt-1">
                                Must be at least 8 characters with 1 capital letter, 1 number, and 1 special character
                            </p>
                        )}
                    </div>

                    {formData.password && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`w-full px-4 py-2 pr-10 rounded-lg border focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm new password"
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
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-[#143F81] text-white font-medium hover:bg-blue-800 transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfileModal;
