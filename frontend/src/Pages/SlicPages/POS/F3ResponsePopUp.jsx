import React, { useState, useEffect } from "react";

const F3ResponsePopUp = ({ isVisible, setVisibility, apiResponse }) => {
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  // console.log(apiResponse);

  // useEffect(() => {
  //   if (apiResponse) {
  //     setItemCode(apiResponse?.message?.whenValidateINVI_QTY_LS);
  //   }
  //   }, []);
  
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    Meesage
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button className="text-white hover:text-gray-300 focus:outline-none"
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
                    <button className="text-white hover:text-gray-300 focus:outline-none"
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
              <div className="w-full overflow-y-auto">
                <div className="flex justify-between flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemcode" className={`text-secondary`}>
                          Item Code
                        </label>
                        <textarea
                          type="text"
                          id="itemcode"
                          value={apiResponse?.message?.whenValidateINVI_QTY_LS}
                          placeholder="Enter item Code"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="englishName"
                          className={`text-secondary`}
                        >
                          Product Size
                        </label>
                        <textarea
                          type="text"
                          id="englishName"
                          value={description}
                          placeholder="Enter Product Size"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="rate"
                          className={`text-secondary`}
                        >
                          Rate
                        </label>
                        <textarea
                          type="text"
                          id="rate"
                          value={description}
                          placeholder="Enter Rate"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="quantity"
                          className={`text-secondary`}
                        >
                          Quantity
                        </label>
                        <textarea
                          type="text"
                          id="quantity"
                          value={description}
                          placeholder="Enter Quantity"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
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

export default F3ResponsePopUp;
