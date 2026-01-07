import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import Pagination from '../component/Pagination';

function ArchivePage() {
    const [archivedItems, setArchivedItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [typeFilter, setTypeFilter] = useState('All');
    const [nameSort, setNameSort] = useState('asc');

    useEffect(() => {
        const stored = localStorage.getItem('archivedItems');
        if (stored) {
            setArchivedItems(JSON.parse(stored));
        }
    }, []);

    const filteredItems = useMemo(() => {
        const filtered = archivedItems.filter((item) => {
            return typeFilter === 'All' || item.type === typeFilter;
        });
        
        // Sort by name
        const sorted = [...filtered].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameSort === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
        
        return sorted;
    }, [archivedItems, typeFilter, nameSort]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, nameSort]);

    const handleRestore = (id) => {
        const itemToRestore = archivedItems.find(item => item.id === id);
        if (!itemToRestore) return;

        // Remove archive-specific fields
        const { reason, archivedAt, ...restoredItem } = itemToRestore;

        // Restore to the appropriate list based on type
        if (itemToRestore.type === 'patient') {
            const currentPatients = JSON.parse(localStorage.getItem('patientsList') || '[]');
            // Check if patient already exists (shouldn't, but just in case)
            if (!currentPatients.find(p => p.id === id)) {
                const updatedPatients = [...currentPatients, restoredItem];
                localStorage.setItem('patientsList', JSON.stringify(updatedPatients));
            }
        } else if (itemToRestore.type === 'caregiver') {
            const currentCaregivers = JSON.parse(localStorage.getItem('caregiversList') || '[]');
            // Check if caregiver already exists
            if (!currentCaregivers.find(c => c.id === id)) {
                const updatedCaregivers = [...currentCaregivers, restoredItem];
                localStorage.setItem('caregiversList', JSON.stringify(updatedCaregivers));
            }
        } else if (itemToRestore.type === 'admin') {
            const currentAdmins = JSON.parse(localStorage.getItem('adminsList') || '[]');
            // Check if admin already exists
            if (!currentAdmins.find(a => a.id === id)) {
                const updatedAdmins = [...currentAdmins, restoredItem];
                localStorage.setItem('adminsList', JSON.stringify(updatedAdmins));
            }
        }

        // Remove from archive
        const newItems = archivedItems.filter(item => item.id !== id);
        setArchivedItems(newItems);
        localStorage.setItem('archivedItems', JSON.stringify(newItems));
    };

    return (
        <AdminLayout pageTitle="Archived Accounts">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#143F81] px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg">Archived Items</h2>
                    <div className="flex items-center gap-2">
                        <label className="text-white text-sm font-medium">Filter by Type:</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-white font-bold bg-[#143F81]"
                            style={{
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            <option value="All" className="text-white font-bold bg-[#143F81]">All</option>
                            <option value="patient" className="text-white font-bold bg-[#143F81]">Patient</option>
                            <option value="caregiver" className="text-white font-bold bg-[#143F81]">Caregiver</option>
                            <option value="admin" className="text-white font-bold bg-[#143F81]">Admin</option>
                        </select>
                        <label className="text-white text-sm font-medium ml-2">Sort by Name:</label>
                        <select
                            value={nameSort}
                            onChange={(e) => setNameSort(e.target.value)}
                            className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-white font-bold bg-[#143F81]"
                            style={{
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            <option value="asc" className="text-white font-bold bg-[#143F81]">Ascending</option>
                            <option value="desc" className="text-white font-bold bg-[#143F81]">Descending</option>
                        </select>
                    </div>
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
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No archived items found
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => (
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
                {filteredItems.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredItems.length}
                        onItemsPerPageChange={(newItemsPerPage) => {
                            setItemsPerPage(newItemsPerPage);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

export default ArchivePage;
