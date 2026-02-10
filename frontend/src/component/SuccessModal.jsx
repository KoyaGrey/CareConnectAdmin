import React from 'react';

function SuccessModal({ isOpen, onClose, title, message, type = 'success' }) {
    if (!isOpen) return null;

    const isError = type === 'error' || title?.toLowerCase().includes('fail');
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        isError ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                        {isError ? (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${
                            isError ? 'text-red-600' : 'text-gray-900'
                        }`}>
                            {title || (isError ? 'Error' : 'Success!')}
                        </h3>
                    </div>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-700">
                        {message || (isError ? 'An error occurred.' : 'Operation completed successfully!')}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={onClose} 
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-sm ${
                            isError 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-[#143F81] hover:bg-[#1a4fa3]'
                        }`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal;
