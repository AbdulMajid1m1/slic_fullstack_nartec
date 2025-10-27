import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import ProductCard from './ProductCard';
import CodesSection from './CodesSection';
import DigitalLinkTable from './DigitalLinkTable';
import AddControlSerialPopup from './AddControlSerialPopup';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNav from '../../../components/Sidebar/SideNav';
import imageLiveUrl from '../../../utils/urlConverter/imageLiveUrl';
import newRequest from '../../../utils/userRequest';

const DigitalLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5234);

  const rowData = location.state?.rowData;

  const productDetails = [
    { label: "Item Code", value: rowData?.ItemCode || "N/A" },
    { label: "English Name", value: rowData?.EnglishName || "N/A" },
    { label: "Arabic Name", value: rowData?.ArabicName || "N/A" },
    { label: "GTIN", value: rowData?.GTIN || "N/A" },
    { label: "Unit", value: rowData?.ProductUnit || "N/A" },
    { label: "Size", value: rowData?.ProductSize || "N/A" },
  ];

  const fetchControlSerials = async ({ queryKey }) => {
    const [_key, currentPage, currentLimit] = queryKey;
    const response = await newRequest.get(`/controlSerials?page=${currentPage}&limit=${currentLimit}`);
    
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
    isLoading, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['controlSerials', page, limit],
    queryFn: fetchControlSerials,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) => {
      // console.error('Error fetching control serials:', err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Failed to load control serials");
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

  return (
    <div>
      <SideNav>
        <div className="bg-white border-b">
          <div className="flex items-center gap-3 px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <IoIosArrowBack className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                </div>
              </div>
              <h1 className="text-lg font-medium text-gray-800">
                Digital Product Link
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Product Card */}
              <div>
                <ProductCard
                  imageUrl={imageLiveUrl(rowData?.image)}
                  productCode={rowData?.ProductSize || "N/A"}
                  GTIN={rowData?.GTIN || "N/A"}
                  label={rowData?.label || "Product Name"}
                  upper={rowData?.upper || "Product Subtitle"}
                  details={productDetails}
                />
              </div>

              {/* Right Column - QR Code and Barcode Stacked */}
              <div>
                <CodesSection gtin={rowData?.GTIN || ""} />
              </div>
            </div>

            {/* Tabs and Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <DigitalLinkTable 
                serials={serialsData}
                isLoading={isLoading || isFetching}
                refetchSerials={refetch}
                itemCode={rowData?.ItemCode}
                onAddSerial={() => setIsAddPopupVisible(true)}
                pagination={serialsResponse?.pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </div>
          </div>
        </div>

        {/* Add Control Serial Popup */}
        <AddControlSerialPopup
          isVisible={isAddPopupVisible}
          setVisibility={setIsAddPopupVisible}
          refreshData={refetch}
          itemCode={rowData?.ItemCode}
        />
      </SideNav>
    </div>
  );
};

export default DigitalLinks;