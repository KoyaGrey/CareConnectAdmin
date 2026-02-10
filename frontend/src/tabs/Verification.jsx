import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
function Verification() {
    const navigate = useNavigate()
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputsRef = useRef([]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, ''); // only digits
        if (!value) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // move focus to next input
        if (index < 5) inputsRef.current[index + 1].focus();
    };

    const handleBackspace = (e, index) => {
        const newCode = [...code];

        if (e.key === 'Backspace') {
            // If current input has a value, clear it
            if (newCode[index]) {
                newCode[index] = '';
                setCode(newCode);
            }
            // If empty, move to previous input
            else if (index > 0) {
                newCode[index - 1] = '';
                setCode(newCode);
                inputsRef.current[index - 1].focus();
            }
            e.preventDefault(); // prevent default browser behavior
        }
    };

    const handleVerify = () => {

        navigate("/tab/reset-password")
    }

    return (
        <div className="py-20 flex flex-col items-center">
            <h1 className="text-white font-semibold text-2xl mb-10">ENTER VERIFICATION CODE</h1>

            <div className="flex gap-3">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        className="w-12 h-14 text-center text-xl rounded-lg outline-none bg-white bg-transparent text-black placeholder-white"
                        placeholder="-"
                    />
                ))}
            </div>
            
            <h1 className="text-white text-sm mt-2 mb-5">We’ve sent a verification code to your email.</h1>
            <button onClick={() => handleVerify()} className="cursor-pointer hover:bg-white/60 bg-white px-10 py-2 rounded-xl font-semibold mb-3">Verify</button>
            <h1 className="text-black/50 font-semibold text-lg cursor-pointer hover:underline">Resend it</h1>
        </div>
    );
}

export default Verification;
