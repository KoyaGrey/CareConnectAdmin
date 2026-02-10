import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../AdminLayout';
import Pagination from '../../component/Pagination';
import RestoreModal from '../../component/RestoreModal';
import SuccessModal from '../../component/SuccessModal';
import { subscribeToArchivedItems, restoreArchivedItem } from '../../utils/firestoreService';

function SuperAdminArchivePage() {
    const [archivedItems, setArchivedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [typeFilter, setTypeFilter] = useState('All');
    const [nameSort, setNameSort] = useState('asc');
    const [restoreModal, setRestoreModal] = useState({
        isOpen: false,
        itemId: null,
        itemName: '',
        itemType: ''
    });
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Set up real-time listener for archived items
    useEffect(() => {
        console.log('Setting up real-time listener for archived items...');
        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToArchivedItems((archivedData) => {
            try {
                console.log('Archived items updated:', archivedData.length);
                console.log('Sample archived item:', archivedData[0]);
                setArchivedItems(archivedData);
                setLoading(false);
            } catch (error) {
                console.error('Error processing archived items:', error);
                setError('Failed to load archived items. Please check browser console.');
                setLoading(false);
            }
        });

        // Cleanup: unsubscribe when component unmounts
        return () => {
            console.log('Cleaning up archived items listener...');
            unsubscribe();
        };
    }, []);

    const filteredItems = useMemo(() => {
        const filtered = archivedItems.filter((item) => {
            // Handle missing type field
            const itemType = item.type || 'unknown';
            return typeFilter === 'All' || itemType === typeFilter;
        });
        
        // Sort by name (handle missing name)
        const sorted = [...filtered].sort((a, b) => {
            const nameA = (a.name || 'Unknown').toLowerCase();
            const nameB = (b.name || 'Unknown').toLowerCase();
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

    const handleRestoreClick = (id) => {
        const itemToRestore = archivedItems.find(item => item.id === id);
        if (!itemToRestore) {
            alert('Item not found');
            return;
        }

        // Open restore modal
        setRestoreModal({
            isOpen: true,
            itemId: id,
            itemName: itemToRestore.name || itemToRestore.id,
            itemType: itemToRestore.type || 'item'
        });
    };

    const handleRestoreConfirm = async () => {
        const { itemId, itemName } = restoreModal;
        
        try {
            await restoreArchivedItem(itemId);
            // Close restore modal
            setRestoreModal({ isOpen: false, itemId: null, itemName: '', itemType: '' });
            // Show success modal
            setSuccessModal({
                isOpen: true,
                title: 'Restore Successful',
                message: `${itemName || 'Item'} has been restored successfully!`
            });
            // Data will automatically update via real-time listener
        } catch (err) {
            console.error('Error restoring item:', err);
            // Close restore modal
            setRestoreModal({ isOpen: false, itemId: null, itemName: '', itemType: '' });
            // Show error in success modal (reusing it for errors)
            setSuccessModal({
                isOpen: true,
                title: 'Restore Failed',
                message: `Failed to restore item: ${err.message || 'Unknown error'}`,
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <AdminLayout pageTitle="Archived Accounts">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <p className="text-gray-600">Loading archived items...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout pageTitle="Archived Accounts">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-[#143F81] text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

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
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {item.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                                            {item.type || 'unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={item.reason || 'No reason'}>
                                            {item.reason || 'No reason provided'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {item.archivedAt && item.archivedAt instanceof Date && !isNaN(item.archivedAt.getTime())
                                                ? item.archivedAt.toLocaleDateString()
                                                : item.archivedAt && typeof item.archivedAt === 'object' && item.archivedAt.seconds
                                                    ? new Date(item.archivedAt.seconds * 1000).toLocaleDateString()
                                                    : item.archivedAt && (typeof item.archivedAt === 'string' || typeof item.archivedAt === 'number')
                                                        ? new Date(item.archivedAt).toLocaleDateString()
                                                        : 'Invalid Date'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleRestoreClick(item.id)}
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

            {/* Restore Confirmation Modal */}
            <RestoreModal
                isOpen={restoreModal.isOpen}
                onClose={() => setRestoreModal({ isOpen: false, itemId: null, itemName: '', itemType: '' })}
                onConfirm={handleRestoreConfirm}
                itemName={restoreModal.itemName}
                itemType={restoreModal.itemType}
            />

            {/* Success/Error Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ isOpen: false, title: '', message: '', type: 'success' })}
                title={successModal.title}
                message={successModal.message}
                type={successModal.type || 'success'}
            />
        </AdminLayout>
    );
}

export default SuperAdminArchivePage;
