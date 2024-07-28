import React, { useEffect, useState } from "react";
import cash from "../../../Images/tendercash/cash.png";
import creditcard from "../../../Images/tendercash/creditcard.png";
import visamaster from "../../../Images/tendercash/visamaster.png";
import americanexpress from "../../../Images/tendercash/americanexpress.png";
import paypal from "../../../Images/tendercash/paypal.png";
import wallet from "../../../Images/tendercash/wallet.png";
import bitcoins from "../../../Images/tendercash/bitcoins.png";
import stcpay from "../../../Images/tendercash/stcpay.png";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";

const F3TenderCashPopUp = ({ isVisible, setVisibility, storeDatagridData, showOtpPopup, handleClearData, selectedSalesType }) => {
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
   
    const storedCompanyData = sessionStorage.getItem('selectedCompany');
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
        // console.log(companyData);
      }
    }

    const storedLocationData = sessionStorage.getItem('selectedLocation');
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
        // console.log(locationData);
      }
    }
    const secondApiResponses = JSON.parse(sessionStorage.getItem("secondApiResponses"));
    // console.log(secondApiResponses);
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
        const secondApiResponses = JSON.parse(sessionStorage.getItem("secondApiResponses"));
        console.log(secondApiResponses);

        const items = storeDatagridData.map(item => {
            const itemRateObj = secondApiResponses[item.SKU];
            const rate = itemRateObj?.ItemRate?.Rate || "0";

            const commonFields = {
                "Item-Code": item.SKU,
                "Size": item.ProductSize || '40', // Use the correct size if available
                "Qty": `${item.Qty}`,
                "UserId": "SYSADMIN"
            };

            return selectedSalesType === 'DIRECT SALES INVOICE' 
                ? { ...commonFields, "Rate": rate } 
                : commonFields;
        });

        const body = selectedSalesType === 'DIRECT SALES INVOICE' 
            ? {
                "_keyword_": "Invoice",
                "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
                "data": [
                    {
                        "Company": "SLIC",
                        "TransactionCode": "DCIN",
                        "CustomerCode": "CF100005",
                        "SalesLocationCode": selectedLocation?.LOCN_CODE,
                        "DeliveryLocationCode": selectedLocation?.LOCN_CODE,
                        "UserId": "SYSADMIN",
                        "Item": items
                    }
                ],
                "COMPANY": "SLIC",
                "USERID": "SYSADMIN",
                "APICODE": "INVOICE",
                "LANG": "ENG"
              }
            : {
                "keyword": "salesreturn",
                "secret-key": "2bf52be7-9f68-4d52-9523-53f7f267153b",
                "data": [
                    {
                        "Company": "SLIC",
                        "TransactionCode": "EXSR",
                        "CustomerCode": "CL102511",
                        "SalesLocationCode": selectedLocation?.LOCN_CODE || "FG101", // Use selectedLocation code or default
                        "DeliveryLocationCode": selectedLocation?.LOCN_CODE || "FG101", // Use selectedLocation code or default
                        "UserId": "SYSADMIN",
                        "Item": items
                    }
                ],
                "COMPANY": "SLIC",
                "USERID": "SYSADMIN",
                "APICODE": "SALESRETURN",
                "LANG": "ENG"
              };

        const res = await newRequest.post('/slicuat05api/v1/postData', body, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log(res?.data);
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        toast.success("Transaction Created Successfully");
        setLoading(false);
    } catch (err) {
        console.log(err);
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoading(false);
    }
};



  const lastItemCode = storeDatagridData[storeDatagridData.length - 1]?.SKU;
  const lastProductSize = storeDatagridData[storeDatagridData.length - 1]?.ItemSize;
  
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
                    F3 Tender Cash
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
                <div className="grid grid-cols-3 gap-4">
                  <form onSubmit={handleSubmit} className="border p-4 w-full">
                    <div className="flex justify-between font-semibold">
                      <p>Item Code</p>
                      <p>{lastItemCode}</p>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <p>Product Size</p>
                      <p>{lastProductSize}</p>
                    </div>
                    <div className="flex justify-between mt-4 border-t pt-2 font-semibold">
                      <p>Sub Total</p>
                      {/* <p>7,187</p> */}
                    </div>
                    <div className="mt-10">
                    <Button
                        variant="contained"
                        style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                        type="submit"
                        disabled={loading}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            null
                          )
                        }
                      >
                        Print
                      </Button>
                    </div>
                  </form>
                  <div className="border p-2 w-full">
                    <div className="mb-4">
                      <p className="font-semibold">Amount Due</p>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-3 placeholder:text-black rounded-md bg-[#E3EDEF]"
                        placeholder="7,187"
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold">Amount Received</p>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-3 placeholder:text-black rounded-md bg-[#E3EDEF]"
                        placeholder="SAR 0.00"
                      />
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold">Change</p>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-2 py-3 placeholder:text-black rounded-md bg-[#E3EDEF]"
                        placeholder="SAR 0.00"
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-8 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "0", "Back"].map((item) => (
                        <button
                          key={item}
                          className={`py-2 text-center rounded-sm ${
                            item === "Back"
                              ? "bg-red-500 text-white"
                              : "bg-[#35393C] text-white"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-1 w-full">
                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img src={cash} className="h-10 w-16 mr-2 ml-3 object-contain" alt="cash" />
                      <p className="">Cash</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img src={creditcard} className="h-10 w-16 mr-2 ml-3" alt="creditcard" />
                      <p className="">Credit / Debit</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img
                        src={visamaster}
                        className="h-10 w-16 mr-2 ml-3 object-contain"
                        alt="visamaster"
                      />
                      <p className="">Visa / Master</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img
                        src={americanexpress}
                        className="h-10 w-16 mr-2 ml-3 object-contain"
                        alt="americanexpress"
                      />
                      <p className="">American Express</p>
                    </div>


                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img
                        src={paypal}
                        className="h-10 w-16 mr-2 ml-3 object-contain"
                        alt="paypal"
                      />
                      <p className="">PayPal</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img src={wallet} className="h-10 w-16 mr-2 ml-3 object-contain" alt="wallet" />
                      <p className="">Wallet</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img src={bitcoins} className="h-10 w-16 mr-2 ml-3 object-contain" alt="bitcoin" />
                      <p className="">Bitcoin</p>
                    </div>

                    <div className="flex justify-start items-center w-full h-16 p-2 shadow-md border border-gray-200 rounded-lg bg-white mt-5">
                      <img src={stcpay} className="h-10 w-16 mr-2 ml-3 object-contain" alt="stcpay" />
                      <p className="">STC Pay</p>
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
