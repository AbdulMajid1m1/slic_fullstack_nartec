import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import "tailwindcss/tailwind.css";

const POS = () => {

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }));
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);


  return (
    <SideNav>
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 shadow-md">
          <div className="px-3 py-3 flex justify-between bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
            <span>Sales Entry Form (Direct Invoice)</span>
            <p className="text-end">{currentTime}</p>
          </div>

          <div className="mb-4 mt-4 flex justify-between">
            <h2 className="text-2xl font-semibold bg-yellow-100 px-2 py-1">NEW SALE</h2>
            <p className="text-2xl font-semibold bg-yellow-100 px-2 py-1">Cashier : CreativeM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Transactions *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Direct Sales Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Sales Locations *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Choose...</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">VAT #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="VAT"
              />
            </div>
            <div>
              <label className="block text-gray-700">Invoice #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value="1720253863"
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Search Customer</label>
              <input
                type="text"
                placeholder="Search Customer by Mobile"
                className="w-full mt-1 p-2 border rounded bg-yellow-200 border-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-700">Delivery *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Choose...</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Customer *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Walk-in customer"
              />
            </div>
            <div>
              <label className="block text-gray-700">Mobile *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Mobile"
              />
            </div>
            <div>
              <label className="block text-gray-700">Scan Barcode</label>
              <input
                type="text"
                placeholder="Scan Barcode..."
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-yellow-200"
              />
            </div>
            <div>
              <label className="block text-gray-700">Remarks *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400"
                placeholder="Remarks"
              />
            </div>
            <div>
              <label className="block text-gray-700">Type *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Cash</option>
              </select>
            </div>
          </div>
          <div className="mt-10">
            <div className="bg-blue-500 text-white font-semibold flex justify-between flex-wrap">
              <div className="px-4 py-2">GTIN</div>
              <div className="px-4 py-2">Description</div>
              <div className="px-4 py-2">Price</div>
              <div className="px-4 py-2">Qty</div>
              <div className="px-4 py-2">Discount</div>
              <div className="px-4 py-2">VAT</div>
              <div className="px-4 py-2">Total</div>
              <div className="px-4 py-2">Action</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
                  F10 - Open Drawer
                </button>
                <button className="bg-[#037de2] text-white py-4 px-4 rounded">
                  F6 - PLU Inquiry
                </button>
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
                  F7 - Department
                </button>
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
                <button className="bg-gray-500 text-white py-4 px-4 rounded">
                  F1 - Edit Qty
                </button>
                <button className="bg-yellow-500 text-white py-4 px-4 rounded">
                  F9 - Old Invoice
                </button>
                <button className="bg-[#0dcaf0] text-white py-4 px-4 rounded">
                  F2 - Delete Line
                </button>
                <button className="bg-blue-500 text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
                <button className="bg-red-500 text-white py-4 px-4 rounded">
                  F3 - Tender Cash
                </button>
                <button className="bg-black text-white py-4 px-4 rounded">
                  F8 - Z Report
                </button>
                <button className="bg-red-600 text-white py-4 px-4 rounded">
                  F5 - Return Items
                </button>
                <button className="bg-blue-500 text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
              </div>
            </div>
            <div>
              <div className="bg-white p-4 rounded shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Net With VAT:</label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Total VAT(15%):
                    </label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Tender Amount:
                    </label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Balance:</label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideNav>
  );
};

export default POS;
