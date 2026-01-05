import React, { useState } from 'react';
import { ShowPasswordIcon, HidePasswordIcon } from '../component/svg/PasswordIcon';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const handleRegister = () => {
        //logic 

        navigate('/tab/register-success')
    }

    return (
        <div className="px-4 text-center gap-6 flex flex-col max-w-md mx-auto mt-10">
            {/* Already have an account */}
            <div className="flex justify-center gap-2 flex-col md:flex-row">
                <h1 className="text-white text text-lg font-semibold">Already have an account?</h1>
                <Link to="/tab/login" className="text-white text-lg font-bold hover:underline">Log In</Link>
            </div>

            {/* Full Name */}
            <input
                type="text"
                placeholder="Full Name"
                className="px-4 py-3 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
            />

            {/* Email Address */}
            <input
                type="text"
                placeholder="Email Address"
                className="px-4 py-3 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
            />

            {/* Username */}
            <input
                type="text"
                placeholder="Username"
                className="px-4 py-3 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
            />

            {/* Password */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="px-4 py-3 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
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

            {/* Confirm Password */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="px-4 py-3 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
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

            <button onClick={() => handleRegister()} className="bg-white text-[#143F81] font-bold text-2xl md:text-xl px-8 py-2 rounded-xl mt-4 cursor-pointer">
                Sign Up
            </button>
        </div>
    );
}

export default Register;
