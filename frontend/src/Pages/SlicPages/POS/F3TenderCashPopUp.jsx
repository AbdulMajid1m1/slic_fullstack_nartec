import React, { useState } from "react";
import sliclogo from "../../../Images/sliclogo.png";

const F3TenderCashPopUp = ({ isVisible, setVisibility }) => {
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="popup-container bg-white rounded-lg shadow-lg h-auto sm:w-[70%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    Add Sales Orders
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 14H4"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4h16v16H4z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border p-4">
                    <div className="flex justify-between">
                      <p>5 X PROMAX SP 0W16 API SP</p>
                      <p>1,437</p>
                    </div>
                    <div className="flex justify-between">
                      <p>10 X SUPER SYNTHETIC 10W 40 API SN</p>
                      <p>5,750</p>
                    </div>
                    <div className="flex justify-between mt-4 border-t pt-2">
                      <p>Sub Total</p>
                      <p>7,187</p>
                    </div>
                    <button className="bg-blue-700 text-white mt-4 py-2 px-4 w-full">
                      Print
                    </button>
                  </div>
                  <div className="border p-4">
                    <div className="mb-4">
                      <p className="font-semibold">Amount Due</p>
                      <input
                        type="text"
                        className="w-full border px-2 py-3  placeholder:text-black rounded-sm bg-[#E3EDEF]"
                        placeholder="7,187"
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold">Amount Received</p>
                      <input
                        type="text"
                        className="w-full border px-2 py-3 placeholder:text-black rounded-sm bg-[#E3EDEF]"
                        placeholder="SAR 0.00"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold">Change</p>
                      <input
                        type="text"
                        className="w-full border px-2 py-3  placeholder:text-black rounded-sm bg-[#E3EDEF]"
                        placeholder="SAR 0.00"
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-8 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "Back"].map((item) => (
                        <button
                          key={item}
                          className={`py-2 text-center rounded-sm bg-[#35393C] text-white ${
                            item === "Back"
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-1">
                  <div className="flex justify-start items-center w-full h-14 p-2 shadow-md border border-gray-200 rounded-lg bg-white">
                    <img src={sliclogo} className="h-8 w-14 mr-2" alt="Visa / Master" />
                    <p className="">Visa / Master</p>
                    </div>
                    <div className="flex justify-start items-center w-full h-14 p-2 shadow-md border border-gray-200 rounded-lg bg-white">
                    <img src={sliclogo} className="h-8 w-14 mr-2" alt="Visa / Master" />
                    <p className="">Visa / Master</p>
                    </div>
                    <div className="flex justify-start items-center w-full h-14 p-2 shadow-md border border-gray-200 rounded-lg bg-white">
                    <img src={sliclogo} className="h-8 w-14 mr-2" alt="Visa / Master" />
                    <p className="">Visa / Master</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default F3TenderCashPopUp;
