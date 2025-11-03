import React, { useState } from "react";
import { Trash2, Plus, RefreshCw, Loader2, Eye } from "lucide-react";
import toast from "react-hot-toast";

const PurchaseOrderTable = ({ 
  orders, 
  isLoading, 
  refetchOrders, 
  onAddOrder,
  onViewOrder
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const itemsPerPage = 10;

  const ordersArray = Array.isArray(orders) ? orders : [];

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDelete = async (order) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }
    
    setDeletingId(order.id);
    try {
      // Replace with your actual delete API call
      // const res = await newRequest.delete(`/purchaseOrders/${order.id}`);
      toast.success("Purchase order deleted successfully");
      refetchOrders();
    } catch (err) {
      toast.error("Failed to delete purchase order");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (order) => {
    if (onViewOrder) {
      onViewOrder(order);
    }
  };

  const filteredOrders = ordersArray.filter(order => 
    order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

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
      setSelectedRows(filteredOrders);
      setSelectAllMode(true);
    } else {
      setSelectedRows([]);
      setSelectAllMode(false);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (order) => {
    setSelectedRows(prev => {
      const isSelected = prev.some(row => row.id === order.id);
      if (isSelected) {
        const newSelection = prev.filter(row => row.id !== order.id);
        if (selectAllMode) {
          setSelectAllMode(false);
        }
        return newSelection;
      } else {
        return [...prev, order];
      }
    });
  };

  // Check if row is selected
  const isRowSelected = (order) => {
    return selectedRows.some(row => row.id === order.id);
  };

  // Check if all filtered orders are selected
  const isAllSelected = filteredOrders.length > 0 && 
    selectedRows.length === filteredOrders.length;

  const isSomeSelected = selectedRows.length > 0 && !isAllSelected;

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="px-6 py-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Purchase Orders</h3>
          <p className="text-sm text-gray-500">
            Total {filteredOrders.length} purchase orders
            {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
            {selectAllMode && ` (All orders selected)`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Search by PO number, supplier..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              setSelectedRows([]);
              setSelectAllMode(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm flex-1 sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 px-6 pb-3">
        Recent past 3 months
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <div className="flex flex-col gap-1">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      {isAllSelected && (
                        <span className="text-[9px] text-blue-600 font-medium whitespace-nowrap">
                          All
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No purchase orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order, idx) => (
                    <tr 
                      key={order.id || idx} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isRowSelected(order) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isRowSelected(order)}
                          onChange={() => handleSelectRow(order)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{order.poNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.supplierName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.orderDate || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.expectedDate || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{order.totalAmount || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(order)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                            disabled={deletingId === order.id}
                          >
                            {deletingId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} entries
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
                        ? 'bg-blue-600 text-white border-blue-600'
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
    </div>
  );
};

export default PurchaseOrderTable;