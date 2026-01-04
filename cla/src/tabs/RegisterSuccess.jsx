import React from 'react'
import { ApproveIcon } from '../component/svg/ApproveIcon'
import { Link } from 'react-router-dom'

function RegisterSuccess() {
    return (
        <div className="flex flex-col px-15 py-8 items-center gap-5">
            <ApproveIcon className="w-40 h-40" />
            <div className="flex flex-col items-center">
                <h1 className="font-semibold text-white text-lg">Admin Account</h1>
                <h1 className="font-semibold text-white text-lg">successfully created!</h1>
            </div>

            <Link to="/tab/Login" className="text-[#143F81] px-4 py-2 bg-white text-center font-semibold text-lg rounded-xl">BACK TO LOGIN</Link>
        </div>
    )
}

export default RegisterSuccess
