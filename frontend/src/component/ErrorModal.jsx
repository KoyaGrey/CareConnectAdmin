import React from 'react';

function ErrorModal({ isOpen, onClose, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-600">{title || 'Error'}</h3>
                    </div>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-700">
                        {message || 'An error occurred. Please try again.'}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorModal;
