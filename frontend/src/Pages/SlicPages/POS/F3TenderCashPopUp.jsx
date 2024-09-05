import React, { useEffect, useRef, useState } from "react";
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
  invoiceHeaderData,
  handleClearInvoiceData,
  mobileNo,
  customerName,
  remarks,
  selectedCustomerCode,
  selectedTransactionCode,
  invoiceNumber,
  storeInvoiceDatagridData,
  isExchangeClicked,
}) => {
  const [loading, setLoading] = useState(false);
  const [isPrintEnabled, setIsPrintEnabled] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [bankApprovedCode, setBankApprovedCode] = useState('');
  const grossAmount = totalAmountWithVat;

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [token, setToken] = useState(null);
  const PaymentModels = sessionStorage.getItem("selectedPaymentModels");
  const paymentModes = JSON.parse(PaymentModels);
  const ExamptionReason = sessionStorage.getItem("selectedExamptionReason");
  const examptReason = JSON.parse(ExamptionReason);

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
      console.log("Popup Data:", storeDatagridData);
      // console.log("Invoice Data:", storeInvoiceDatagridData);
      console.log("exhc", isExchangeClicked)
      console.log(selectedCustomerCode?.CUST_CODE)
      console.log(selectedTransactionCode?.stockLocation)
    }
  }, [isVisible, storeDatagridData]);

  useEffect(() => {
    // Calculate change whenever cashAmount or grossAmount changes
    const calculatedChange = cashAmount - grossAmount;
    setChangeAmount(calculatedChange > 0 ? calculatedChange : 0);
  }, [cashAmount, grossAmount]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!cashAmount) {
      toast.error(`Please type the ${paymentModes.name} Amount`);
      return;
    }
    if (!selectedTransactionCode?.stockLocation) {
      toast.error(`Please select the Transaction Code`);
      return;
    }
  
    setLoading(true);
  
    try {
      // Prepare the items array based on selectedSalesType
      const items = selectedSalesType === "DIRECT SALES INVOICE"
        ? storeDatagridData.map((item) => ({
            "Item-Code": item.SKU,
            Size: item.ItemSize,
            Qty: `${item.Qty}`,
            Rate: `${item?.ItemPrice}`,
            UserId: "SYSADMIN",
          }))
        : storeInvoiceDatagridData.map((item) => ({
            "Item-Code": item.SKU,
            Size: item.ItemSize,
            Qty: `${item.Qty}`,
            Rate: `${item?.ItemPrice}`,
            UserId: "SYSADMIN",
          }));
  
      // Extract user-selected transaction code
      const selectTransactionCode = selectedTransactionCode?.stockLocation;
      console.log(selectTransactionCode);
  
      // Function to generate Sales Invoice API body dynamically
      const salesInvoiceBody = {
        "_keyword_": "Invoice",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            "Company": "SLIC",
            "TransactionCode": `${selectTransactionCode}`,
            "CustomerCode": selectedCustomerCode?.CUST_CODE,
            // "CustomerCode": "EX100003",
            "SalesLocationCode": selectedLocation?.stockLocation,
            "DeliveryLocationCode": selectedLocation?.stockLocation,
            "UserId": "SYSADMIN",
            "CustomerName": customerName,
            "MobileNo": mobileNo,
            "Remarks": remarks,
            "PosRefNo": invoiceNumber,
            "ZATCAPaymentMode": paymentModes.code,
            "TaxExemptionReason": "",
            Item: items,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "INVOICE",
        LANG: "ENG",
      };
  

      const CustomerId = selectedSalesType === "DIRECT SALES RETURN"
        ? invoiceHeaderData?.CustomerCode
        : selectedCustomerCode?.CUST_CODE;

      // Function to call Bank API
      const callBankReceiptAPI = async (documentNo, transactionCode) => {
        const bankReceiptBody = {
          "_keyword_": "BANKRCPTDI",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              Company: "SLIC",
              UserId: "SYSADMIN",
              Department: "011",
              TransactionCode: "BRV",
              Division: "100",
              BankApproverCode: bankApprovedCode,
              CashCardFlag: "CARD",
              ReceiptAmt: grossAmount,
              CustomerId: CustomerId,
              MatchingTransactions: [
                {
                  DocNo: documentNo,
                  TransactionCode: transactionCode,
                  PendingAmount: changeAmount,
                  AdjAmount: changeAmount,
                },
              ],
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "BANKRECEIPTVOUCHER",
          LANG: "ENG",          
        };
  
        const bankRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptBody, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        console.log("Bank Receipt Response:", bankRes?.data);
      };
  
      // SALES INVOICE HANDLING
      if (selectedSalesType === "DIRECT SALES INVOICE") {
        // Call the Sales Invoice API
        const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesInvoiceBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Sales Invoice Response:", res?.data);
  
        // Call the Bank API if the paymentModes.code is 4 or 5
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const documentNo = res?.data?.message?.['Document No'];
          await callBankReceiptAPI(documentNo, selectTransactionCode);
        }
  
        // Complete the process
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
        return; // Exit since no further action is needed
      }
  
      // SALES RETURN HANDLING
      const modifiedTransactionCode = selectTransactionCode.slice(0, -2) + "IN";
      const salesReturnBody = {
        "_keyword_": "salesreturn",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        "data": [
          {
            "Company": "SLIC",
            "TransactionCode": selectTransactionCode,
            "CustomerCode": invoiceHeaderData?.CustomerCode,
            "SalesLocationCode": selectedLocation?.stockLocation,
            "DeliveryLocationCode": selectedLocation?.stockLocation,
            "UserId": "SYSADMIN",
            "CustomerName": invoiceHeaderData?.CustomerCode,
            "MobileNo": invoiceHeaderData?.MobileNo,
            "Remarks": invoiceHeaderData?.Remarks,
            "PosRefNo": invoiceHeaderData?.InvoiceNo,
            "ZATCAPaymentMode": paymentModes.code,
            "TaxExemptionReason": "1",
            "Item": items,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "SALESRETURN",
        LANG: "ENG",
      };
  
      if (paymentModes.code === "1") {
        // Call the Sales Return API
        const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Sales Return Response:", res?.data);
  
        // Complete the process
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
        return; // Exit since no further action is needed
      }


      // Handle Sales Return with Payment Mode Code 4 or 5 (without exchange)
      if (!isExchangeClicked && (paymentModes.code === "4" || paymentModes.code === "5")) {
        // Call Sales Return API only once
        const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Sales Return Response (No Exchange):", res?.data);

        // Call the Bank API for the Sales Return
        const documentNo = res?.data?.['Document No'];
        await callBankReceiptAPI(documentNo, selectTransactionCode);

        // Complete the process
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
        return; // Exit since no further action is needed
      }
  
      // Call Sales Return API with both EXSR and EXIN transaction codes if paymentModes.code is 4 or 5
      if (isExchangeClicked && (paymentModes.code === "4" || paymentModes.code === "5")) {
        const exsrRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Sales Return Response (EXSR):", exsrRes?.data);
  
        const exinRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", {
          ...salesReturnBody,
          "data": [
            {
              ...salesReturnBody.data[0],
              "TransactionCode": modifiedTransactionCode,
            },
          ],
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Sales Return Response (EXIN):", exinRes?.data);
  
        // Call Bank API for both document numbers
        const exsrDocumentNo = exsrRes?.data?.['Document No'];
        const exinDocumentNo = exinRes?.data?.['Document No'];
  
        await callBankReceiptAPI(exinDocumentNo, modifiedTransactionCode);
        await callBankReceiptAPI(exsrDocumentNo, selectTransactionCode);
  
        // Complete the process
        showOtpPopup(exsrRes?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
      }
  
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };
  
  
  const validateForm = () => {
    if ((paymentModes.code === "4" || paymentModes.code === "5") && !bankApprovedCode) {
      setIsPrintEnabled(false);
    } else {
      setIsPrintEnabled(true);
    }
  };
  
  useEffect(() => {
    validateForm();
  }, [bankApprovedCode, paymentModes]);

  
  // useEffect(() => {
  //   if(PaymentModels) {
  //     console.log(paymentModes);
  //   }
  // }, [PaymentModels]);

  // useEffect(() => {
  //   if(ExamptionReason) {
  //     console.log(examptReason);
  //   }
  // }, [ExamptionReason]);

  // useEffect(() => {
  //   if (invoiceHeaderData) {
  //     console.log(invoiceHeaderData)
  //   }
  // }, [invoiceHeaderData]);

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

                        {selectedSalesType === "DIRECT SALES RETURN" ? (
                          storeInvoiceDatagridData?.map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                            >
                              <p className="text-sm">{item.SKU}</p>
                              <p className="text-sm">{item.ItemSize}</p>
                              <p className="text-sm">{item.ItemPrice}</p>
                            </div>
                          ))
                        ) : (
                          storeDatagridData?.map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-3 gap-2 border-t border-gray-300 p-2"
                            >
                              <p className="text-sm">{item.SKU}</p>
                              <p className="text-sm">{item.ItemSize}</p>
                              <p className="text-sm">{item.ItemPrice}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Gross Amount Display */}
                    <div className="mt-4">
                      <p className="text-sm font-sans text-red-500">
                        Gross Amount with 15% VAT: SAR {grossAmount}
                      </p>
                    </div>
                    <div className="mt-10">
                      {/* <Button
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
                      </Button> */}
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: isPrintEnabled ? "#021F69" : "#d3d3d3",
                          color: isPrintEnabled ? "#ffffff" : "#a9a9a9",
                        }}
                        type="submit"
                        disabled={!isPrintEnabled || loading}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                          loading ? 
                            <CircularProgress size={24} color="inherit" /> 
                            : null
                          }
                      >
                        Print
                      </Button>
                    </div>
                  </form>

                  <div className="border p-2 w-full">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="mt-3">
                        <p className="font-semibold text-sm">
                          {paymentModes.name || "Payment Mode"}
                        </p>
                        <input
                          type="text"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="w-full border border-gray-300 px-2 py-2 rounded-md"
                          placeholder={paymentModes.name || "Payment Mode"}
                        />
                      </div>
                          <div className="mb-3">
                            <p className="font-semibold">Total Amount</p>
                            <input
                              type="text"
                              value={grossAmount}
                              readOnly
                              className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                              placeholder="Total Amount"
                            />
                          </div>
                          <div className="mb-3">
                            <p className="font-semibold">Change</p>
                            <input
                              type="text"
                              value={changeAmount}
                              readOnly
                              className="w-full border border-gray-300 px-2 py-2 rounded-md bg-[#E3EDEF]"
                              placeholder="Change"
                            />
                          </div>
                      {(paymentModes.code === "4" || paymentModes.code === "5") && (
                        <>
                          <div className="mb-3">
                            <p className="font-semibold">Bank Approval Code</p>
                            <input
                              type="text"
                              value={bankApprovedCode}
                              onChange={(e) => setBankApprovedCode(e.target.value)}
                              className="w-full border border-gray-300 px-2 py-2 rounded-md"
                              placeholder="Enter Bank Approval Code"
                            />
                          </div>
                        </>
                      )}
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
