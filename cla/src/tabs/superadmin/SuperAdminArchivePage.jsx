import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';

function SuperAdminArchivePage() {
    const [archivedItems, setArchivedItems] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('archivedItems');
        if (stored) {
            setArchivedItems(JSON.parse(stored));
        }
    }, []);

    const handleRestore = (id) => {
        // In a real app, this would restore to the main list
        // For now, we'll just remove from archive
        const newItems = archivedItems.filter(item => item.id !== id);
        setArchivedItems(newItems);
        localStorage.setItem('archivedItems', JSON.stringify(newItems));
    };

    return (
        <AdminLayout pageTitle="Archived Accounts">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#143F81] px-6 py-4">
                    <h2 className="text-white font-bold text-lg">Archived Items</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Archived</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {archivedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No archived items found
                                    </td>
                                </tr>
                            ) : (
                                archivedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(item.archivedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleRestore(item.id)}
                                                className="text-[#143F81] hover:text-blue-800 font-medium text-sm"
                                            >
                                                Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default SuperAdminArchivePage;
