import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import ProductCard from './ProductCard';
import CodesSection from './CodesSection';
import DigitalLinkTable from './DigitalLinkTable';
import TabNavigation from './TabNavigation';
import { useNavigate } from 'react-router-dom';
import SideNav from '../../../components/Sidebar/SideNav';

// Main Component
const DigitalLinks = () => {
  const [activeTab, setActiveTab] = useState('controlled-serials');
  const navigate = useNavigate();

  // Sample data
  const productData = {
    imageUrl: "/api/placeholder/260/120",
    productCode: "5512345678",
    name: "NTRL",
    subtitle: "small fe",
    details: [
      { label: "Type", value: "5" },
      { label: "Fire Class", value: "Class Abc" },
      { label: "Capacity", value: "6kg" },
      { label: "Price", value: "SAR150" },
      { label: "Manufacturer", value: "Barba Gas" },
      { label: "Model", value: "Fe86" }
    ],
    gtin: "612789123456"
  };

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

  const tabs = [
    { id: 'controlled-serials', label: 'Controlled Serials' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'safety-info', label: 'Safety Info' },
    { id: 'packaging-info', label: 'Packaging Info' },
    { id: 'storage-info', label: 'Storage Info' },
    { id: 'certificate-info', label: 'Certificate Info' },
    { id: 'inventory', label: 'Inventory' }
  ];

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
                  imageUrl={productData.imageUrl}
                  productCode={productData.productCode}
                  name={productData.name}
                  subtitle={productData.subtitle}
                  details={productData.details}
                />
              </div>

              {/* Right Column - QR Code and Barcode Stacked */}
              <div>
                <CodesSection gtin={productData.gtin} />
              </div>
            </div>

            {/* Tabs and Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 pt-6">
                <TabNavigation
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {activeTab === 'controlled-serials' && (
                <DigitalLinkTable serials={serialsData} />
              )}

              {activeTab !== 'controlled-serials' && (
                <div className="text-center py-12 text-gray-500 px-6">
                  {tabs.find(t => t.id === activeTab)?.label} content goes here
                </div>
              )}
            </div>
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default DigitalLinks;