import React, { useEffect, useRef, useState } from "react";
import cash from "../../../Images/tendercash/cash.png";
import creditcard from "../../../Images/tendercash/creditcard.png";
import stcpay from "../../../Images/tendercash/stcpay.png";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";

const F3TenderCashPopUp = ({
  isVisible,
  setVisibility,
  storeDatagridData,
  showOtpPopup,
  handleClearData,
  selectedSalesType,
  handleInvoiceGenerator,
  totalAmountWithVat,
}) => {
  const [loading, setLoading] = useState(false);
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // slic login api token get
    const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
    setToken(token);

    const storedCompanyData = sessionStorage.getItem("selectedCompany");
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
        // console.log(companyData);
      }
    }

    const storedLocationData = sessionStorage.getItem("selectedLocation");
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
        // console.log(locationData);
      }
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      // console.log("Popup Data:", storeDatagridData);
    }
  }, [isVisible, storeDatagridData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const secondApiResponses = JSON.parse(
        sessionStorage.getItem("secondApiResponses")
      );
      console.log(secondApiResponses);

      const items = storeDatagridData.map((item) => {
        const itemRateObj = secondApiResponses[item.SKU];
        const rate = itemRateObj?.ItemRate?.Rate || "0";

        const commonFields = {
          "Item-Code": item.SKU,
          Size: item.ProductSize || "40", // Use the correct size if available
          Qty: `${item.Qty}`,
          UserId: "SYSADMIN",
        };

        return selectedSalesType === "DIRECT SALES INVOICE"
          ? { ...commonFields, Rate: rate }
          : commonFields;
      });

      const body =
        selectedSalesType === "DIRECT SALES INVOICE"
          ? {
              _keyword_: "Invoice",
              "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
              data: [
                {
                  Company: "SLIC",
                  TransactionCode: "DCIN",
                  CustomerCode: "CF100005",
                  SalesLocationCode: selectedLocation?.LOCN_CODE,
                  DeliveryLocationCode: selectedLocation?.LOCN_CODE,
                  UserId: "SYSADMIN",
                  Item: items,
                },
              ],
              COMPANY: "SLIC",
              USERID: "SYSADMIN",
              APICODE: "INVOICE",
              LANG: "ENG",
            }
          : {
              keyword: "salesreturn",
              "secret-key": "2bf52be7-9f68-4d52-9523-53f7f267153b",
              data: [
                {
                  Company: "SLIC",
                  TransactionCode: "EXSR",
                  CustomerCode: "CL102511",
                  SalesLocationCode: selectedLocation?.LOCN_CODE || "FG101", // Use selectedLocation code or default
                  DeliveryLocationCode: selectedLocation?.LOCN_CODE || "FG101", // Use selectedLocation code or default
                  UserId: "SYSADMIN",
                  Item: items,
                },
              ],
              COMPANY: "SLIC",
              USERID: "SYSADMIN",
              APICODE: "SALESRETURN",
              LANG: "ENG",
            };

      const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res?.data);
      showOtpPopup(res?.data);

      // setTimeout(() => {
        handleCloseCreatePopup();
        handleClearData();
        handleInvoiceGenerator();
        // toast.success("Transaction Created Successfully");
        setLoading(false);
      // }, 400);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };


  // Cards Calcultaion Logic Code 
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const grossAmount = totalAmountWithVat;



  const PaymentModels = sessionStorage.getItem("selectedPaymentModels");
  const paymentModes = JSON.parse(PaymentModels);
  const ExamptionReason = sessionStorage.getItem("selectedExamptionReason");
  const examptReason = JSON.parse(ExamptionReason);

  // console.log("PaymentModels", PaymentModels);
  // console.log("ExamptionReason", ExamptionReason);

  useEffect(() => {
    if(PaymentModels) {
      console.log(paymentModes);
    }
  }, [PaymentModels]);

  useEffect(() => {
    if(ExamptionReason) {
      console.log(examptReason);
    }
  }, [ExamptionReason]);

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="popup-container bg-white rounded-lg shadow-lg h-auto sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    F3 Tender Cash - {selectedSalesType}
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
              <div className="p-0 w-full">
                <div className="grid grid-cols-2 gap-4">
                  {/* Invoice Form */}
                  <form onSubmit={handleSubmit} className="border p-4 w-full">
                  <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 overflow-x-auto">
                    <div className="min-w-[300px] min-h-[100px]">
                      {/* Header */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-200 p-2 rounded-t-lg">
                        <p className="text-sm">Item Code</p>
                        <p className="text-sm">Size</p>
                        <p className="text-sm">Item Price</p>
                      </div>

                      {storeDatagridData.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                        >
                          <p className="text-sm">{item.SKU}</p>
                          <p className="text-sm">{item.ItemSize}</p>
                          <p className="text-sm">{item.ItemPrice}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gross Amount Display */}
                  <div className="mt-4">
                    <p className="text-sm font-sans text-red-500">
                      Gross Amount with 15% VAT: SAR {grossAmount}
                    </p>
                  </div>
                    <div className="mt-10">
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: "#021F69", // Change color based on enabled/disabled state
                        //   backgroundColor: isPrintEnabled ? "#021F69" : "#d3d3d3", // Change color based on enabled/disabled state
                        //   // color: isPrintEnabled ? "#ffffff" : "#a9a9a9",
                        }}
                        type="submit"
                        // disabled={!isPrintEnabled || loading}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                      >
                        Print
                      </Button>
                    </div>
                  </form>

                  <div className="border p-2 w-full">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="mb-4">
                        <p className="font-semibold text-sm">Cash Amount</p>
                        <input
                          type="text"
                          value={`${paymentModes.code} - ${paymentModes.name}`}
                          className="w-full border border-gray-300 px-2 py-3 rounded-md"
                          placeholder="Enter Cash Amount"
                        />
                      </div>
                      <div className="mb-4">
                        <p className="font-semibold text-sm">Credit Amount</p>
                        <input
                          type="text"
                          value={`${examptReason.code} - ${examptReason.name}`} 
                          className="w-full border border-gray-300 px-2 py-3 rounded-md"
                          placeholder="Enter Credit Amount"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold">Total Amount</p>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-3 rounded-md bg-[#E3EDEF]"
                        placeholder="Total Amount"
                      />
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold">Change</p>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-3 rounded-md bg-[#E3EDEF]"
                        placeholder="Change"
                      />
                    </div>
                  </div>
                  {/* <div className="p-1 w-full">
                    <div
                      onClick={handleCashClick}  
                      className={`flex justify-start items-center w-full h-16 transform hover:scale-90 hover:cursor-pointer p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5 ${
                        selectedCard === "cash" ? "bg-gray-300" : ""
                      }`}>
                      <img
                        src={cash}
                        className="h-10 w-16 mr-2 ml-3 object-contain"
                        alt="cash"
                      />
                      <p className="">Cash</p>
                    </div>

                    <div
                      onClick={handleCreditClick}   
                      className={`flex justify-start items-center w-full h-16 transform hover:scale-90 hover:cursor-pointer p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5 ${
                        selectedCard === "credit" ? "bg-gray-300" : ""
                      }`}>
                      <img
                        src={creditcard}
                        className="h-10 w-16 mr-2 ml-3"
                        alt="creditcard"
                      />
                      <p className="">Credit / Debit</p>
                    </div>
                    <div
                      onClick={handleStcPayClick}
                      className={`flex justify-start items-center w-full h-16 transform hover:scale-90 hover:cursor-pointer p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5 ${
                        selectedCard === "stcpay" ? "bg-gray-300" : ""
                      }`}>
                      <img
                        src={stcpay}
                        className="h-10 w-16 mr-2 ml-3 object-contain"
                        alt="stcpay"
                      />
                      <p className="">STC Pay</p>
                    </div>
                  </div> */}
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
