import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import Pagination from '../../component/Pagination';
import { subscribeToLogs } from '../../utils/firestoreService';

function SuperAdminLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filter, setFilter] = useState('All'); // All, LOGIN, LOGOUT, ARCHIVE, RESTORE, ADMIN_CREATED, ADMIN_UPDATED, STATUS_CHANGED

  // Set up real-time listener for logs
  useEffect(() => {
    console.log('Setting up real-time listener for logs...');
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToLogs((logsData) => {
        console.log('Logs updated:', logsData.length);
        setLogs(logsData);
        setLoading(false);
        setError(null);
      }, 500); // Get last 500 logs

      // Cleanup: unsubscribe when component unmounts
      return () => {
        console.log('Cleaning up logs listener...');
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (err) {
      console.error('Error setting up logs listener:', err);
      setError(err.message || 'Failed to load logs. Please check browser console for details.');
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (term) => {
    // Search functionality can be added later if needed
  };

  // Filter logs by action type
  const filteredLogs = filter === 'All' 
    ? logs 
    : logs.filter(log => log.action === filter);

  // Paginate logs
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Format action for display
  const formatAction = (action) => {
    const actionMap = {
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'ARCHIVE': 'Archive',
      'RESTORE': 'Restore',
      'ADMIN_CREATED': 'Admin Created',
      'ADMIN_UPDATED': 'Admin Updated',
      'STATUS_CHANGED': 'Status Changed'
    };
    return actionMap[action] || action;
  };

  // Format entity type for display
  const formatEntityType = (entityType) => {
    return entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : 'Unknown';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get action description
  const getActionDescription = (log) => {
    switch (log.action) {
      case 'LOGIN':
        return `${log.performedBy.name} logged in`;
      case 'LOGOUT':
        return `${log.performedBy.name} logged out`;
      case 'ARCHIVE':
        const archiveReason = log.details?.reason ? ` (Reason: ${log.details.reason})` : '';
        return `${log.performedBy.name} archived ${log.entityType} "${log.entityName}"${archiveReason}`;
      case 'RESTORE':
        return `${log.performedBy.name} restored ${log.entityType} "${log.entityName}"`;
      case 'ADMIN_CREATED':
        return `${log.performedBy.name} created admin "${log.entityName}"`;
      case 'ADMIN_UPDATED':
        return `${log.performedBy.name} updated admin "${log.entityName}"`;
      case 'STATUS_CHANGED':
        const statusChange = log.details?.statusChange;
        if (statusChange) {
          return `${log.performedBy.name} changed ${log.entityType} "${log.entityName}" status from "${statusChange.from}" to "${statusChange.to}"`;
        }
        return `${log.performedBy.name} changed ${log.entityType} "${log.entityName}" status`;
      default:
        return `${log.performedBy.name} performed ${formatAction(log.action)} on ${log.entityType} "${log.entityName}"`;
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="System Logs" onSearchChange={handleSearchChange}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading logs...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="System Logs" onSearchChange={handleSearchChange}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="System Logs" onSearchChange={handleSearchChange}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#143F81] px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">System Activity Logs</h2>
          <div className="flex items-center gap-2">
            <label className="text-white text-sm font-medium">Filter:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-white font-bold bg-[#143F81]"
              style={{
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              <option value="All" className="text-white font-bold bg-[#143F81]">All Actions</option>
              <option value="LOGIN" className="text-white font-bold bg-[#143F81]">Logins</option>
              <option value="LOGOUT" className="text-white font-bold bg-[#143F81]">Logouts</option>
              <option value="ARCHIVE" className="text-white font-bold bg-[#143F81]">Archives</option>
              <option value="RESTORE" className="text-white font-bold bg-[#143F81]">Restores</option>
              <option value="ADMIN_CREATED" className="text-white font-bold bg-[#143F81]">Admin Created</option>
              <option value="ADMIN_UPDATED" className="text-white font-bold bg-[#143F81]">Admin Updated</option>
              <option value="STATUS_CHANGED" className="text-white font-bold bg-[#143F81]">Status Changes</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Performed By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getActionDescription(log)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.performedBy.name} ({log.performedBy.username})
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.action === 'ARCHIVE' && log.details?.reason && (
                        <div>
                          <span className="font-semibold">Reason:</span> {log.details.reason}
                        </div>
                      )}
                      {log.action === 'ARCHIVE' && log.details?.originalCollection && (
                        <div className="text-xs mt-1">
                          <span className="font-semibold">Type:</span> {log.details.originalCollection}
                        </div>
                      )}
                      {log.action === 'STATUS_CHANGED' && log.details?.statusChange && (
                        <div>
                          <span className="font-semibold">From:</span> {log.details.statusChange.from} → <span className="font-semibold">To:</span> {log.details.statusChange.to}
                        </div>
                      )}
                      {log.action === 'ADMIN_CREATED' && log.details?.email && (
                        <div className="text-xs">
                          <span className="font-semibold">Email:</span> {log.details.email}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredLogs.length}
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

export default SuperAdminLogPage;
