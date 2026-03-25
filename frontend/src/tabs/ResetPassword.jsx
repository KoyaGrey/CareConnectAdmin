import React, { useState } from 'react';
import { HidePasswordIcon, ShowPasswordIcon } from '../component/svg/PasswordIcon';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [isSaved, setIsSaved] = useState(false); // Track if password was saved
    const navigate = useNavigate();

    const handleSave = () => {
        // Here you can add your password save logic
        setIsSaved(true);
    };

    if (isSaved) {
        return (
            <div className="px-5 py-20 flex flex-col gap-6 items-center">
                <h1 className="text-white font-semibold text-3xl tracking-wide text-center">Password reset successfully!</h1>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-white py-2 px-8 rounded-xl mt-4 text-[#143F81] font-semibold text-lg"
                >
                    BACK TO LOGIN
                </button>
            </div>
        );
    }

    return (
        <div className="px-5 py-20 flex flex-col gap-3 items-center">
            <h1 className="text-white font-semibold text-2xl tracking-wide">Verification Successful!</h1>

            {/* Password */}
            <div className="relative px-4 w-full max-w-md">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="px-4 py-2 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                >
                    {showPassword ? (
                        <HidePasswordIcon className="w-6 h-6 text-gray-700" />
                    ) : (
                        <ShowPasswordIcon className="w-6 h-6 text-gray-700" />
                    )}
                </button>
            </div>

            {/* Confirm Password */}
            <div className="relative px-4 w-full max-w-md">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="px-4 py-2 bg-white rounded-xl font-bold placeholder-black/50 text-lg w-full"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                >
                    {showPassword ? (
                        <HidePasswordIcon className="w-6 h-6 text-gray-700" />
                    ) : (
                        <ShowPasswordIcon className="w-6 h-6 text-gray-700" />
                    )}
                </button>
            </div>

            <button
                onClick={handleSave}
                className="bg-white py-2 px-8 rounded-xl mt-4 text-[#143F81] font-semibold text-lg"
            >
                Save
            </button>
        </div>
    );
}

export default ResetPassword;
