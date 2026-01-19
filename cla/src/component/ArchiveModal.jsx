import React, { useState } from 'react';

// Predefined archive reasons
const ARCHIVE_REASONS = [
    'Account Inactive',
    'Violation of Terms',
    'Requested by User',
    'Duplicate Account',
    'Data Correction Needed',
    'Security Concern',
    'Others'
];

function ArchiveModal({ isOpen, onClose, onConfirm, title, message }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [error, setError] = useState('');

    const handleReasonChange = (e) => {
        setSelectedReason(e.target.value);
        setCustomReason(''); // Clear custom reason when changing selection
        setError('');
    };

    const handleConfirm = () => {
        // Validate selection
        if (!selectedReason) {
            setError('Please select a reason for archiving.');
            return;
        }

        // If "Others" is selected, require custom reason
        if (selectedReason === 'Others') {
            if (!customReason.trim()) {
                setError('Please provide a reason in the text box.');
                return;
            }
            onConfirm(customReason.trim());
        } else {
            onConfirm(selectedReason);
        }

        // Reset form
        setSelectedReason('');
        setCustomReason('');
        setError('');
        onClose();
    };

    const handleCancel = () => {
        setSelectedReason('');
        setCustomReason('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const showCustomInput = selectedReason === 'Others';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                <h3 className="text-xl font-bold text-[#143F81] mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Archiving <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedReason}
                        onChange={handleReasonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81]"
                    >
                        <option value="">-- Select a reason --</option>
                        {ARCHIVE_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </select>
                </div>

                {showCustomInput && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please specify reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={customReason}
                            onChange={(e) => {
                                setCustomReason(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your reason for archiving..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143F81] h-24 resize-none"
                            rows="3"
                        />
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleCancel} 
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
