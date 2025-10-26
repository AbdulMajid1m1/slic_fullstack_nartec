import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import ProductCard from './ProductCard';
import CodesSection from './CodesSection';
import DigitalLinkTable from './DigitalLinkTable';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNav from '../../../components/Sidebar/SideNav';
import imageLiveUrl from '../../../utils/urlConverter/imageLiveUrl';

// Main Component
const DigitalLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const rowData = location.state?.rowData;
  console.log('Row Data from navigation state:', rowData);

  // Prepare details array from rowData
  const productDetails = [
    { label: "Item Code", value: rowData?.ItemCode || "N/A" },
    { label: "English Name", value: rowData?.EnglishName || "N/A" },
    { label: "Arabic Name", value: rowData?.ArabicName || "N/A" },
    { label: "GTIN", value: rowData?.GTIN || "N/A" },
    { label: "Unit", value: rowData?.ProductUnit || "N/A" },
    { label: "Size", value: rowData?.ProductSize || "N/A" },
  ];

  // Generate sample serials (simulating 5000+ records)
  const generateSerials = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      status: i % 3 === 0 ? 'Available' : 'Reserved',
      serialNumber: `612789123-${String(i + 1).padStart(5, '0')}`,
      itemName: 'NTRL small fe',
      gtin: '612789123456X100001',
      batch: `C-${String(Math.floor(i / 100) + 1).padStart(3, '0')}`,
      expiry: 'Sep 2A',
      mfgDate: 'Sep 1A',
      expiryDays: Math.floor(Math.random() * 365) + 1
    }));
  };

  const serialsData = generateSerials(5234);

  return (
    <div>
      <SideNav>
        {/* Custom Header with Back Arrow */}
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
              <DigitalLinkTable serials={serialsData} />
            </div>
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default DigitalLinks;