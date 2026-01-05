import React, { useState } from 'react';

function ArchiveModal({ isOpen, onClose, onConfirm, title, message }) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for archiving.');
            return;
        }
        onConfirm(reason);
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                <h3 className="text-xl font-bold text-[#143F81] mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for archiving..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-[#143F81] h-24 resize-none"
                />

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => {
                            onClose();
                            setReason('');
                        }} 
                        className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors shadow-sm"
                    >
                        Archive
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArchiveModal;
