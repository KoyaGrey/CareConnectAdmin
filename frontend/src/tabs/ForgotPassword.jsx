import React from 'react'
import { Link } from 'react-router-dom'

function ForgotPassword() {
    return (
        <div className="px-10 py-25 flex flex-col gap-3 text-center items-center">
            <h1 className="font-semibold text-white text-2xl">FORGOT PASSWORD</h1>
            <h1 className="font-semibold text-white text-sm text-center px-8">Enter your email address to reset your password quickly.</h1>
        
            <input 
                type="text"  
                placeholder="Email Address"
                className="placeholder-black/50 font-bold text-xl bg-white px-4 py-2 rounded-xl mt-5 mb-5 max-w-[47vh]"
            />

            <Link to="/tab/verification" className="bg-white px-3 py-1 rounded-xl w-fit">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#2471E7] to-[#143F81]/49 bg-clip-text text-transparent">
                    Send Code
                </h1>
            </Link>
        </div>
    )
}

export default ForgotPassword
