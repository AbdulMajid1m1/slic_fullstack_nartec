import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DigitalLinkTable from './DigitalLinkTable';
import PurchaseOrderTable from './PurchaseOrderTable';
import { useLocation } from 'react-router-dom';
import newRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5234);

  const rowData = location.state?.rowData;

  // Fetch Control Serials
  const fetchControlSerials = async ({ queryKey }) => {
    const [_key, currentPage, currentLimit] = queryKey;
    const response = await newRequest.get(`/controlSerials?page=${currentPage}&limit=${currentLimit}&Search=6287898133315`);
    
    return {
      data: response?.data?.data?.controlSerials || [],
      pagination: response?.data?.data?.pagination || null,
      totalPages: response?.data?.data?.pagination?.totalPages || 0,
      currentPage: response?.data?.data?.pagination?.page || 1,
      totalItems: response?.data?.data?.pagination?.total || 0
    };
  };

  const { 
    data: serialsResponse, 
    isLoading: isLoadingSerials, 
    refetch: refetchSerials,
    isFetching: isFetchingSerials 
  } = useQuery({
    queryKey: ['controlSerials', page, limit],
    queryFn: fetchControlSerials,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) => {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to load control serials");
    },
  });

  // Fetch Purchase Orders
  const fetchPurchaseOrders = async () => {
    const response = await newRequest.get(`/purchaseOrders`);
    return response?.data?.data || [];
  };

  const { 
    data: purchaseOrders = [], 
    isLoading: isLoadingOrders, 
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: fetchPurchaseOrders,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to load purchase orders");
    },
  });

  const serialsData = (serialsResponse?.data || []).map(serial => ({
    id: serial.id,
    serialNumber: serial.serialNumber,
    ItemCode: serial.product?.ItemCode || 'N/A',
    itemName: serial.product?.EnglishName || 'N/A',
    gtin: serial.product?.GTIN || 'N/A',
    upper: serial.product?.upper || 'N/A',
    sole: serial.product?.sole || 'N/A',
    width: serial.product?.width || 'N/A',
    color: serial.product?.color || 'N/A',
    status: 'Available',
    product: serial.product
  }));

  // Transform purchase orders data
  const ordersData = purchaseOrders.map(order => ({
    id: order.id,
    poNumber: order.poNumber,
    supplierName: order.supplierName,
    orderDate: order.orderDate,
    expectedDate: order.expectedDate,
    status: order.status,
    totalAmount: order.totalAmount,
  }));

  return (
    <div>
      <div className="p-3 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Purchase Orders Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <PurchaseOrderTable 
              orders={ordersData}
              isLoading={isLoadingOrders}
              refetchOrders={refetchOrders}
            />
          </div>

          {/* Controlled Serials Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <DigitalLinkTable 
              serials={serialsData}
              isLoading={isLoadingSerials || isFetchingSerials}
              refetchSerials={refetchSerials}
              itemCode={rowData?.ItemCode}
              pagination={serialsResponse?.pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;