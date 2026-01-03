import React, { useState } from 'react';
import { ShowPasswordIcon, HidePasswordIcon } from '../component/svg/PasswordIcon';
import { Link } from 'react-router-dom';

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        //Login Logic
    }
    return (
        <div className="p-10 text-center flex flex-col items-center">
            <h1 className="text-white text-2xl font-semibold mb-10 tracking-wide">Welcome, Admin!</h1>

            <div className="flex flex-col gap-4 w-70 mx-auto">
                <input
                    type="text"
                    placeholder="Username"
                    className="px-5 py-4 rounded-xl outline-none bg-white w-full placeholder-black/50 font-bold"
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
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
            </div>

            <Link to="/tab/forgot-password" className="hover:underline w-full text-right mt-1 text-white text-sm font-semibold cursor-pointer">
                Forgot Password?
            </Link>

            <button onClick={() => handleLogin()} className="bg-white text-[#143F81] font-bold text-2xl md:text-xl px-9 md:px-7 py-2 rounded-xl mt-4 cursor-pointer">LOGIN</button>
            
            <Link to="/tab/register" className="hover:underline text-white font-semibold text-2xl md:text-xl mt-4 cursor-pointer">Sign Up as Admin</Link>
        </div>
    );
}

export default Login;
