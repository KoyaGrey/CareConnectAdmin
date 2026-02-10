import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Items per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#143F81]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded text-sm font-medium ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>

        <div className="flex gap-1">
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="px-2 py-1 text-gray-500">...</span>
              )}
            </>
          )}

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                page === currentPage
                  ? 'bg-[#143F81] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-2 py-1 text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded text-sm font-medium ${
            currentPage === totalPages || totalPages === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

