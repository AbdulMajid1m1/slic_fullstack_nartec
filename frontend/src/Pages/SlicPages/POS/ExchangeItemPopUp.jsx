import React, { useState, useEffect } from "react";

const ExchangeItemPopUp = ({ isVisible, setVisibility }) => {
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-[45%] sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    Exchange Item
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button className="text-white hover:text-gray-300 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 14H4" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-red-600 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              

              {/* Exchange Item in Heading */}
              <div className="">
                <h3 className="text-xl">Exchange Item</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeItemPopUp;
