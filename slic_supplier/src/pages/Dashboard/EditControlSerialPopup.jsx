import React, { useState, useEffect } from "react";
import newRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const EditControlSerialPopup = ({ isVisible, setVisibility, refreshData, serialData }) => {
  const { t, i18n } = useTranslation();
  const [itemCode, setItemCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (serialData) {
      setItemCode(serialData.ItemCode || "");
    }
  }, [serialData]);

  const handleClosePopup = () => {
    setVisibility(false);
    setItemCode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemCode) {
      toast.error(t("Item code is required"));
      return;
    }

    if (!serialData?.id) {
      toast.error(t("Serial ID is required"));
      return;
    }

    setLoading(true);

    try {
      const response = await newRequest.put(
        `/controlSerials/${serialData.id}`,
        {
          ItemCode: itemCode
        }
      );
      
      toast.success(response?.data?.message || t("Control serial updated successfully"));
      setLoading(false);
      handleClosePopup();
      refreshData();
    } catch (err) {
        //   console.error(err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || t("Error in updating control serial"));
      setLoading(false);
    }
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[40%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    {t("Edit Control Serial")}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleClosePopup}
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
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleClosePopup}
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

              <form onSubmit={handleSubmit} className="w-full overflow-y-auto mt-12 px-4">
                <div className="space-y-4">
                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label 
                      htmlFor="serialNumber" 
                      className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                    >
                      {t("Serial Number")}
                    </label>
                    <input
                      type="text"
                      id="serialNumber"
                      value={serialData?.serialNumber || ""}
                      readOnly
                      className={`border w-full rounded-md border-secondary bg-gray-100 p-2 ${i18n.language==='ar'?'text-end':'text-start'}`}
                    />
                  </div>

                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label 
                      htmlFor="itemCode" 
                      className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                    >
                      {t("Item Code")} *
                    </label>
                    <input
                      type="text"
                      id="itemCode"
                      value={itemCode}
                      onChange={(e) => setItemCode(e.target.value)}
                      placeholder={t("Enter item code")}
                      className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 ${i18n.language==='ar'?'text-end':'text-start'}`}
                      required
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800">
                      <strong>{t("Note")}:</strong> {t("You are updating the item code for serial number")} <strong>{serialData?.serialNumber}</strong>
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#021F69] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#031a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg 
                            className="animate-spin h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {t("Updating...")}
                        </>
                      ) : (
                        <>
                          {t("Update Control Serial")}
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditControlSerialPopup;