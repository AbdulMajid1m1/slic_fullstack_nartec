import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const F3ResponsePopUp = ({
  isVisible,
  setVisibility,
  apiResponse,
  handlePrintSalesInvoice,
  handlePrintExchangeInvoice,
  selectedSalesType,
  isExchangeClick,
  isExchangeDSalesClick,
  sendWhatsAppInvoice,
  setDirectInvoiceWhatsAppLoader,
  isReceiptPrinted
}) => {
  const [transaction, setTransaction] = useState("");
  const [success, setSuccess] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [message, setMessage] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [validationErrors, setValidationErrors] = useState(null);

  useEffect(() => {
    if (apiResponse) {
      // Check if apiResponse contains validation errors
      if (apiResponse.message) {
        setValidationErrors(apiResponse.message);
        // setMessage("Validation Errors");
      } else {
        // Reset errors if the response is valid
        setValidationErrors(null);
        setTransaction(apiResponse.message?.["Transaction Code"] || "");
        setSuccess(apiResponse.message?.["Success"] || "");
        setDocumentNo(apiResponse.message?.["Document No"] || "");
        setCompanyCode(apiResponse.message?.["Company Code"] || "");
        setMessage(apiResponse.message?.message || "");
        setReferenceNo(apiResponse.message?.["Ref-No/SysID"] || "");
      }
    }
  }, [apiResponse]);

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  // const showPrintExchangeReceipt =
  //   selectedSalesType === "DIRECT SALES RETURN" || selectedSalesType === "DSALES NO INVOICE";

  const showPrintExchangeReceipt =
    (selectedSalesType === "DIRECT SALES RETURN" && isExchangeClick) ||
    (selectedSalesType === "DSALES NO INVOICE" && isExchangeDSalesClick);

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
                    Message
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
              <div className="w-full overflow-y-auto">
                <div className="flex justify-between flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="lg:mt-0 md:mt-3 mt-6">
                    {
                      validationErrors ? (
                        <div>
                          {Object.keys(validationErrors).map((key, index) => (
                            <div
                              key={index}
                              className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-5"
                            >
                              <label
                                htmlFor={key}
                                className="text-secondary border-b border-gray-300 font-semibold"
                              >
                                {key}:
                              </label>
                              <p className="text-secondary border-b border-gray-300">
                                {validationErrors[key]}
                              </p>
                            </div>
                          ))}
                          <div className="mt-5 flex justify-between items-center">
                            <div className="flex flex-col gap-3">
                              <button
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                onClick={() => handlePrintSalesInvoice()}
                              >
                                Print Receipt
                              </button>
                              <Button
                                variant="contained"
                                style={{ backgroundColor: "#021F69", color: "white" }}
                                onClick={sendWhatsAppInvoice}
                                className="ml-2"
                                endIcon={
                                  setDirectInvoiceWhatsAppLoader ? (
                                    <CircularProgress
                                      size={24}
                                      color="inherit"
                                    />
                                  ) : null
                                }
                                // disabled={!isReceiptPrinted}
                              >
                                Send Invoice to WhatsApp
                              </Button>
                            </div>

                            {showPrintExchangeReceipt && (
                              <button
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                onClick={() => handlePrintExchangeInvoice()}
                              >
                                Print Exchange Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null
                      // <div>
                      //   <div className="w-full font-body sm:text-lg text-sm flex flex-wrap gap-3">
                      //     <label
                      //       htmlFor="transaction"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Transaction Code :
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {transaction}
                      //     </p>
                      //   </div>
                      //   <div className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-6">
                      //     <label
                      //       htmlFor="success"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Success
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {success}
                      //     </p>
                      //   </div>
                      //   <div className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-5">
                      //     <label
                      //       htmlFor="companyCode"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Company Code:
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {companyCode}
                      //     </p>
                      //   </div>
                      //   <div className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-5">
                      //     <label
                      //       htmlFor="message"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Message:
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {message}
                      //     </p>
                      //   </div>
                      //   <div className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-5">
                      //     <label
                      //       htmlFor="referenceNo"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Reference Number/System ID:
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {referenceNo}
                      //     </p>
                      //   </div>
                      //   <div className="w-full font-body sm:text-base text-sm flex flex-wrap gap-3 mt-5">
                      //     <label
                      //       htmlFor="documentNo"
                      //       className="text-secondary border-b border-gray-300 font-semibold"
                      //     >
                      //       Document No:
                      //     </label>
                      //     <p className="text-secondary border-b border-gray-300">
                      //       {documentNo}
                      //     </p>
                      //   </div>
                      // </div>
                    }
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
