import React, { useState } from 'react';
import { ShowPasswordIcon, HidePasswordIcon } from '../component/svg/PasswordIcon';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({});

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

    const handleLogin = () => {
        let newErrors = {};

        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Login Logic
            console.log('Login success', formData);
            navigate('/tab/dashboard');
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
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                        {showPassword ? (
                            <HidePasswordIcon className="w-6 h-6 text-gray-700" />
                        ) : (
                            <ShowPasswordIcon className="w-6 h-6 text-gray-700" />
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
            <Link
                to="/tab/register"
                className="hover:underline text-white font-semibold text-2xl md:text-xl mt-4 cursor-pointer"
            >
                Sign Up as Admin
            </Link>
        </div>
    );
}

export default Login;
