import React from 'react';

function RestoreModal({ isOpen, onClose, onConfirm, itemName, itemType }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleCancel}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-[#143F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#143F81]">Restore Account</h3>
                        <p className="text-sm text-gray-500">Confirm restoration</p>
                    </div>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to restore <span className="font-semibold text-gray-900">{itemName || 'this item'}</span>?
                    </p>
                    {itemType && (
                        <p className="text-sm text-gray-500">
                            This will move the {itemType} back to the {itemType === 'admin' ? 'admins' : itemType === 'caregiver' ? 'caregivers' : 'patients'} collection.
                        </p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The account will be restored to its original collection and removed from the archive.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleCancel} 
                        className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-4 py-2 rounded-lg bg-[#143F81] text-white font-medium hover:bg-[#1a4fa3] transition-colors shadow-sm"
                    >
                        Restore
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RestoreModal;
