import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiEdit2, FiTrash2, FiPlus, FiPrinter } from "react-icons/fi";
import { HiRefresh } from "react-icons/hi";
import { Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import EditControlSerialPopup from "./EditControlSerialPopup";
import ExportControlSerials from "./ExportControlSerials";
import GTINBarcodePrint from "../GTIN/GTINBarcodePrint";

const DigitalLinkTable = ({ 
  serials, 
  isLoading, 
  refetchSerials, 
  onAddSerial,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const printTriggerRef = useRef(null);
  const itemsPerPage = 10;

  const serialsArray = Array.isArray(serials) ? serials : [];

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchSerials();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDelete = async (serial) => {
    setDeletingId(serial.id);
    try {
     const res = await newRequest.delete(`/controlSerials/${serial.id}`);
      toast.success(res?.data?.message || "Control serial deleted successfully");
      refetchSerials();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to delete control serial");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (serial) => {
    setSelectedSerial(serial);
    setIsEditPopupVisible(true);
  };

  const filteredSerials = serialsArray.filter(serial => 
    serial.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serial.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serial.ItemCode?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(currentSerials);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (serial) => {
    setSelectedRows(prev => {
      const isSelected = prev.some(row => row.id === serial.id);
      if (isSelected) {
        return prev.filter(row => row.id !== serial.id);
      } else {
        return [...prev, serial];
      }
    });
  };

  // Check if row is selected
  const isRowSelected = (serial) => {
    return selectedRows.some(row => row.id === serial.id);
  };

  // Check if all current page rows are selected
  const isAllSelected = currentSerials.length > 0 && 
    currentSerials.every(serial => isRowSelected(serial));

  const isSomeSelected = selectedRows.length > 0 && !isAllSelected;

  // Handle print
  const handlePrint = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to print");
      return;
    }

    // Trigger print
    if (printTriggerRef.current) {
      printTriggerRef.current.click();
    }
  };

  // Clear selection after print
  const handlePrintComplete = () => {
    setSelectedRows([]);
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="px-6 py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Controlled Serials</h3>
          <p className="text-sm text-gray-500">
            Total {filteredSerials.length} controlled serials
            {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Search by serial number, item name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm flex-1 sm:w-96 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          {selectedRows.length > 0 && (
            <Button 
              onClick={handlePrint}
              variant="contained"
              sx={{
                backgroundColor: '#9333ea',
                '&:hover': {
                  backgroundColor: '#7e22ce',
                },
              }}
              endIcon={<FiPrinter className="w-4 h-4" />}
            >
              Print Labels ({selectedRows.length})
            </Button>
          )}
          <Button 
            onClick={onAddSerial}
            variant="contained"
            sx={{
              backgroundColor: '#008000',
              '&:hover': {
                backgroundColor: '#006600',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
            endIcon={<FiPlus className="w-4 h-4" />}
          >
            Add Serial
          </Button>
          <Button 
            onClick={handleRefresh}
            variant="contained"
            disabled={isRefreshing || isLoading}
            sx={{
              backgroundColor: '#1D2F90',
              '&:hover': {
                backgroundColor: '#162561',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
            endIcon={
              isRefreshing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <HiRefresh className="text-xl" />
              )
            }
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <ExportControlSerials serials={filteredSerials} />
        </div>
      </div>

      <div className="text-sm text-gray-500 px-6 pb-3">
        Recent past 3 months
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <CircularProgress size={48} />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GTIN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">upper</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">sole</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">width</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">color</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">QR Code</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentSerials.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
                      No control serials found
                    </td>
                  </tr>
                ) : (
                  currentSerials.map((serial, idx) => (
                    <tr 
                      key={serial.id || idx} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isRowSelected(serial) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isRowSelected(serial)}
                          onChange={() => handleSelectRow(serial)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          serial.status === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {serial.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{serial.serialNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.ItemCode || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.itemName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.gtin || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.upper || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.sole || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.width || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{serial.color || ''}</td>
                      <td className="px-4 py-3">
                        {serial.serialNumber && (
                          <QRCodeSVG value={serial.serialNumber} size={32} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(serial)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(serial)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                            disabled={deletingId === serial.id}
                          >
                            {deletingId === serial.id ? (
                              <CircularProgress size={16} sx={{ color: '#dc2626' }} />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        </>
      )}

      {/* Edit Popup */}
      <EditControlSerialPopup
        isVisible={isEditPopupVisible}
        setVisibility={setIsEditPopupVisible}
        refreshData={refetchSerials}
        serialData={selectedSerial}
      />

      {/* Print Component */}
      <GTINBarcodePrint
        selectedRows={selectedRows.map(serial => ({
          ItemCode: serial.ItemCode || serial.serialNumber || 'N/A',
          ProductSize: serial.width || 'N/A',
          GTIN: serial.gtin || 'N/A',
        }))}
        onPrintComplete={handlePrintComplete}
      />
      <button 
        ref={printTriggerRef}
        onClick={() => document.getElementById('gtin-print-trigger')?.click()}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DigitalLinkTable;