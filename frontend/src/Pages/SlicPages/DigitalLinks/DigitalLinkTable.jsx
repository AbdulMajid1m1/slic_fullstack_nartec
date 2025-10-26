import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Paginated Table Component
const DigitalLinkTable = ({ serials }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const filteredSerials = serials.filter(serial => 
    serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serial.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSerials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSerials = filteredSerials.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="px-6 py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Controlled Serials</h3>
          <p className="text-sm text-gray-500">Total {filteredSerials.length} controlled serials</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Search by serial number, item name, facility..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm flex-1 sm:w-96 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          <button className="px-6 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-digital-color transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 px-6 pb-3">
        Recent past 3 months
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GTIN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MFG Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry (Days)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QR Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentSerials.map((serial, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    serial.status === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serial.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{serial.serialNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.itemName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.gtin}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.batch}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.expiry}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.mfgDate}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{serial.expiryDays}</td>
                <td className="px-4 py-3">
                  <QRCodeSVG value={serial.serialNumber} size={32} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredSerials.length)} of {filteredSerials.length} entries
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={idx} className="px-3 py-1">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? 'bg-secondary text-white border-secondary'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalLinkTable;