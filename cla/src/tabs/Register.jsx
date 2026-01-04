import React, { useState } from 'react';
import { ShowPasswordIcon, HidePasswordIcon } from '../component/svg/PasswordIcon';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value, data) => {
        if (name === 'fullName')
            return value.trim() ? '' : 'Full name is required';

        if (name === 'email') {
            if (!value) return 'Email is required';
            if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
            return '';
        }

        if (name === 'username')
            return value.trim() ? '' : 'Username is required';

        if (name === 'password') {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            return '';
        }

        if (name === 'confirmPassword') {
            if (!value) return 'Confirm your password';
            if (value !== data.password) return 'Passwords do not match';
            return '';
        }

        return '';
    };

    // ✅ TRUE LIVE VALIDATION
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => {
            const updatedData = { ...prevData, [name]: value };

            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: validateField(name, value, updatedData),
                ...(name === 'password' && {
                    confirmPassword: validateField(
                        'confirmPassword',
                        updatedData.confirmPassword,
                        updatedData
                    )
                })
            }));

            return updatedData;
        });
    };

    const validate = () => {
        let newErrors = {};

        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key], formData);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = () => {
        if (!validate()) return;
        navigate('/tab/register-success');
    };

    return (
        <div className="px-4 text-center gap-4 flex flex-col max-w-md mx-auto mt-10">

            <div className="flex justify-center gap-2 flex-col md:flex-row">
                <h1 className="text-white text-lg font-semibold">
                    Already have an account?
                </h1>
                <Link to="/tab/login" className="text-white text-lg font-bold hover:underline">
                    Log In
                </Link>
            </div>

            <input name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder="Full Name"
                className="px-4 py-3 bg-white rounded-xl font-bold text-lg w-full" />
            {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}

            <input name="email" value={formData.email} onChange={handleChange}
                placeholder="Email Address"
                className="px-4 py-3 bg-white rounded-xl font-bold text-lg w-full" />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

            <input name="username" value={formData.username} onChange={handleChange}
                placeholder="Username"
                className="px-4 py-3 bg-white rounded-xl font-bold text-lg w-full" />
            {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}

            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="px-4 py-3 bg-white rounded-xl font-bold text-lg w-full"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2">
                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="px-4 py-3 bg-white rounded-xl font-bold text-lg w-full"
                />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}

            <button
                onClick={handleRegister}
                className="bg-white text-[#143F81] font-bold text-2xl px-8 py-2 rounded-xl mt-4">
                Sign Up
            </button>
        </div>
    );
}

export default Register;
