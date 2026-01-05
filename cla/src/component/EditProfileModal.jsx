import React, { useState, useEffect } from 'react';

function EditProfileModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                password: '',
                confirmPassword: ''
            }));
            setErrors({});
        }
    }, [initialData]);

    const validateField = (name, value, data) => {
        if (name === 'password') {
            if (value && value.length < 8) return 'Password must be at least 8 characters';
            return '';
        }
        if (name === 'confirmPassword') {
            if (value && value !== data.password) return 'Passwords do not match';
            return '';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Live validation
            if (name === 'password' || name === 'confirmPassword') {
                const newErrors = { ...errors };
                
                // Validate the changed field
                const error = validateField(name, value, updated);
                if (error) newErrors[name] = error;
                else delete newErrors[name];

                // If password changes, re-validate confirmPassword if it has a value
                if (name === 'password' && updated.confirmPassword) {
                    const confirmError = validateField('confirmPassword', updated.confirmPassword, updated);
                    if (confirmError) newErrors.confirmPassword = confirmError;
                    else delete newErrors.confirmPassword;
                }

                setErrors(newErrors);
            }
            
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password) {
            if (formData.password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none"
                            placeholder="Admin Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none"
                            placeholder="admin_user"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none"
                            placeholder="Leave blank to keep current"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#143F81] focus:border-transparent outline-none"
                            placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

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
