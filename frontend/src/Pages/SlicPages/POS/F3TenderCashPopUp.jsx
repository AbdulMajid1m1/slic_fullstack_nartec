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
  isExchangeClick,
  selectedRowData,
  exchangeData,
  isExchangeDSalesClick,
  dSalesNoInvoiceexchangeData,
  DSalesNoInvoiceData,
  selectedCustomeNameWithDirectInvoice,
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
      // console.log("Popup Data:", storeDatagridData);
      console.log("Invoice Data:", storeInvoiceDatagridData);
      // console.log("exchange Button", isExchangeClick)
      // console.log("Exchange DSales Button", isExchangeDSalesClick)
      console.log(selectedCustomerCode?.CUSTOMERCODE)
      // console.log(selectedTransactionCode?.TXN_CODE)
      // console.log(selectedRowData)
      console.log(exchangeData)

      // console.log(DSalesNoInvoiceData)
      // console.log(dSalesNoInvoiceexchangeData)
    }
  }, [isVisible, storeDatagridData]);

  useEffect(() => {
    // Calculate change whenever cashAmount or grossAmount changes
    const calculatedChange = cashAmount - grossAmount;
    setChangeAmount(calculatedChange > 0 ? calculatedChange : 0);
  }, [cashAmount, grossAmount]);


  const handleSubmitDirectSalesInvoice = async () => {
    setLoading(true);
  
    try {
      const items = storeDatagridData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));
  
      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;
  
      const salesInvoiceBody = {
        "keyword": "Invoice",
        "secret-key": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        "data": [
          {
            "Company": "SLIC",
            "TransactionCode": `${selectTransactionCode}`,
            "CustomerCode": selectedCustomeNameWithDirectInvoice?.CUST_CODE,
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
            "Item": items
          }
        ],
         
        "COMPANY": "SLIC",
        "USERID": "SYSADMIN",
        "APICODE": "INVOICE",
        "LANG": "ENG"   

      };
  
      const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesInvoiceBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Sales Invoice Response:", res?.data);
  
      // Call the Bank API after successful sales invoice
      if (paymentModes.code === "4" || paymentModes.code === "5") {
        const documentNo = res?.data?.message?.['Document No'];
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
              CustomerId: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
              MatchingTransactions: [
                {
                  DocNo: documentNo,
                  TransactionCode: selectTransactionCode,
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
        await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Bank Receipt for Sales Invoice processed");
      }
  
      showOtpPopup(res?.data);
      handleCloseCreatePopup();
      handleClearData();
      handleClearInvoiceData();
      handleInvoiceGenerator();
      setLoading(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };
  
  const handleSubmitDirectSalesReturn = async () => {
    setLoading(true);
   
    try {
      const firstDataGridItem = exchangeData.map((item) => ({
        "Item-Code": item.ItemCode,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));
  
      const SecondDataGridItem = storeInvoiceDatagridData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));
  
      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;
      const modifiedTransactionCode = selectTransactionCode.slice(0, -2) + "IN";
  
      // Body for the sales return (EXSR)
      const salesReturnBody = {
        "_keyword_": "salesreturn",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            "Company": "SLIC",
            "TransactionCode": selectTransactionCode,
            "CustomerCode": selectedCustomerCode?.CUSTOMERCODE,
            "SalesLocationCode": selectedLocation?.stockLocation,
            "DeliveryLocationCode": selectedLocation?.stockLocation,
            "UserId": "SYSADMIN",
            "CustomerName": invoiceHeaderData?.CustomerCode,
            "MobileNo": invoiceHeaderData?.MobileNo,
            "Remarks": invoiceHeaderData?.Remarks,
            "PosRefNo": invoiceHeaderData?.InvoiceNo,
            "ZATCAPaymentMode": paymentModes.code,
            "TaxExemptionReason": "1",
            Item: SecondDataGridItem,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "SALESRETURN",
        LANG: "ENG",
      };
  
      if (isExchangeClick) {
        // Exchange scenario: Call both Sales Return and Invoice APIs
        const exsrRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Sales Return Response (EXSR):", exsrRes?.data);
  
        // Body for the invoice (EXIN)
        const salesInvoiceBody = {
          "_keyword_": "Invoice",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              "Company": "SLIC",
              "TransactionCode": modifiedTransactionCode,
              "CustomerCode": selectedCustomerCode?.CUSTOMERCODE,
              "SalesLocationCode": selectedLocation?.stockLocation,
              "DeliveryLocationCode": selectedLocation?.stockLocation,
              "UserId": "SYSADMIN",
              "CustomerName": invoiceHeaderData?.CustomerCode,
              "MobileNo": invoiceHeaderData?.MobileNo,
              "Remarks": invoiceHeaderData?.Remarks,
              "PosRefNo": invoiceHeaderData?.InvoiceNo,
              "ZATCAPaymentMode": paymentModes.code,
              "TaxExemptionReason": "0",  // Invoice specific field
              Item: firstDataGridItem,
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "INVOICE",
          LANG: "ENG",
        };
  
        // Call the Invoice API (EXIN)
        const exinRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesInvoiceBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Invoice Response (EXIN):", exinRes?.data);
  
        // Get document numbers for both EXSR and EXIN
        const exsrDocumentNo = exsrRes?.data?.message["Document No"];
        const exinDocumentNo = exinRes?.data?.message["Document No"];
  
        // Call Bank API for Exchange (EXSR + EXIN)
        const bankReceiptBody = {
          "_keyword_": "BANKRCPTEX",
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
              ReceiptAmt: selectedRowData?.ItemPrice - exchangeData[0]?.ItemPrice,
              CustomerId: selectedCustomerCode?.CUSTOMERCODE,
              MatchingTransactions: [
                {
                  DocNo: exinDocumentNo,
                  TransactionCode: modifiedTransactionCode,
                  PendingAmount: exchangeData[0]?.ItemPrice,
                  AdjAmount: exchangeData[0]?.ItemPrice,
                },
                {
                  DocNo: exsrDocumentNo,
                  TransactionCode: selectTransactionCode,
                  PendingAmount: selectedRowData?.ItemPrice,
                  AdjAmount: selectedRowData?.ItemPrice,
                },
              ],
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "BANKRECEIPTVOUCHER",
          LANG: "ENG",
        };
  
        await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Bank Receipt processed for Exchange");
        showOtpPopup(exsrRes?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);

      } 
      else {
        // Non-exchange scenario: Only call Sales Return API
        const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Sales Return Response:", res?.data);
  
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);

        // For Direct Sales Return Debit/Credit (paymentModes.code === 4 or 5)
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const documentNo = res?.data?.message["Document No"];
          const bankReceiptDI = {
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
                CustomerId: invoiceHeaderData?.CustomerCode,
                MatchingTransactions: [
                  {
                    DocNo: documentNo,
                    TransactionCode: selectTransactionCode,
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
  
          const bankRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptDI, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Complete the process
          showOtpPopup(bankRes?.data);
          handleCloseCreatePopup();
          handleClearData();
          handleClearInvoiceData();
          handleInvoiceGenerator();
          setLoading(false);
          console.log("Bank Receipt processed for Direct Sales Return Debit/Credit");
        } else {
          console.log("Direct Sales Return - Cash (No Bank API Call)");
        }
      }

    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  

  // DSALES no Invoice
  const handleSubmitDSalesInvoice = async () => {
    setLoading(true);
  
    try {
      const firstDataGridItem = dSalesNoInvoiceexchangeData.map((item) => ({
        "Item-Code": item.ItemCode,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));
  
      const SecondDataGridItem = DSalesNoInvoiceData.map((item) => ({
        "Item-Code": item.SKU,
        Size: item.ItemSize,
        Qty: `${item.Qty}`,
        Rate: `${item?.ItemPrice}`,
        UserId: "SYSADMIN",
      }));
  
      const selectTransactionCode = selectedTransactionCode?.TXN_CODE;
      const modifiedTransactionCode = selectTransactionCode.slice(0, -2) + "IN";
  
      // Body for the sales return (EXSR)
      const salesReturnBody = {
        "_keyword_": "salesreturn",
        "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
        data: [
          {
            "Company": "SLIC",
            "TransactionCode": `${selectTransactionCode}`,
            "CustomerCode": selectedCustomeNameWithDirectInvoice?.CUST_CODE,
            "SalesLocationCode": selectedLocation?.stockLocation,
            "DeliveryLocationCode": selectedLocation?.stockLocation,
            "UserId": "SYSADMIN",
            "CustomerName": customerName,
            "MobileNo": mobileNo,
            "Remarks": remarks,
            "PosRefNo": invoiceNumber,
            "ZATCAPaymentMode": paymentModes.code,
            "TaxExemptionReason": "1",
            Item: SecondDataGridItem,
          },
        ],
        COMPANY: "SLIC",
        USERID: "SYSADMIN",
        APICODE: "SALESRETURN",
        LANG: "ENG",
      };
  
      if (isExchangeDSalesClick) {
        // Exchange scenario: Call both Sales Return and Invoice APIs
        const exsrRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Sales Return Response (EXSR):", exsrRes?.data);
  
        // Body for the invoice (EXIN)
        const salesInvoiceBody = {
          "_keyword_": "Invoice",
          "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
          data: [
            {
              "Company": "SLIC",
              "TransactionCode": `${modifiedTransactionCode}`,
              "CustomerCode": selectedCustomeNameWithDirectInvoice?.CUST_CODE,
              "SalesLocationCode": selectedLocation?.stockLocation,
              "DeliveryLocationCode": selectedLocation?.stockLocation,
              "UserId": "SYSADMIN",
              "CustomerName": customerName,
              "MobileNo": mobileNo,
              "Remarks": remarks,
              "PosRefNo": invoiceNumber,
              "ZATCAPaymentMode": paymentModes.code,
              "TaxExemptionReason": "0",  // Invoice specific field
              Item: firstDataGridItem,
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "INVOICE",
          LANG: "ENG",
        };
  
        // Call the Invoice API (EXIN)
        const exinRes = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesInvoiceBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Invoice Response (EXIN):", exinRes?.data);
  
        // Get document numbers for both EXSR and EXIN
        const exsrDocumentNo = exsrRes?.data?.message["Document No"];
        const exinDocumentNo = exinRes?.data?.message["Document No"];
  
        // Call Bank API for Exchange (EXSR + EXIN)
        const bankReceiptBody = {
          "_keyword_": "BANKRCPTEX",
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
              ReceiptAmt: selectedRowData?.ItemPrice - dSalesNoInvoiceexchangeData[0]?.ItemPrice,
              CustomerId: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
              MatchingTransactions: [
                {
                  DocNo: exinDocumentNo,
                  TransactionCode: modifiedTransactionCode,
                  PendingAmount: dSalesNoInvoiceexchangeData[0]?.ItemPrice,
                  AdjAmount: dSalesNoInvoiceexchangeData[0]?.ItemPrice,
                },
                {
                  DocNo: exsrDocumentNo,
                  TransactionCode: selectTransactionCode,
                  PendingAmount: selectedRowData?.ItemPrice,
                  AdjAmount: selectedRowData?.ItemPrice,
                },
              ],
            },
          ],
          COMPANY: "SLIC",
          USERID: "SYSADMIN",
          APICODE: "BANKRECEIPTVOUCHER",
          LANG: "ENG",
        };
  
        await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Bank Receipt processed for Exchange");
        showOtpPopup(exsrRes?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);

      } 
      
      else {
        // Non-exchange scenario: Only call Sales Return API
        const res = await ErpTeamRequest.post("/slicuat05api/v1/postData", salesReturnBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Sales Return Response:", res?.data);
      
        // For Direct Sales Return Debit/Credit (paymentModes.code === 4 or 5)
        if (paymentModes.code === "4" || paymentModes.code === "5") {
          const documentNo = res?.data?.message["Document No"];
          const bankReceiptDI = {
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
                CustomerId: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
                MatchingTransactions: [
                  {
                    DocNo: documentNo,
                    TransactionCode: selectTransactionCode,
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
  
          await ErpTeamRequest.post("/slicuat05api/v1/postData", bankReceiptDI, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Bank Receipt processed for Direct Sales Return Debit/Credit");
        } else {
          console.log("Direct Sales Return - Cash (No Bank API Call)");
        }
        // Complete the process
        showOtpPopup(res?.data);
        handleCloseCreatePopup();
        handleClearData();
        handleClearInvoiceData();
        handleInvoiceGenerator();
        setLoading(false);
      }
  
    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // if (!cashAmount) {
    //   toast.error(`Please type the ${paymentModes.name} Amount`);
    //   return;
    // }
  
    if (!selectedTransactionCode?.TXN_CODE) {
      toast.error(`Please select the Transaction Code`);
      return;
    }
  
    if (selectedSalesType === "DIRECT SALES INVOICE") {
      await handleSubmitDirectSalesInvoice();
    } else if (selectedSalesType === "DIRECT SALES RETURN") {
      await handleSubmitDirectSalesReturn();
    } else if (selectedSalesType === "DSALES NO INVOICE") {
      await handleSubmitDSalesInvoice();
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
                        ) : selectedSalesType === "DSALES NO INVOICE" ? (
                          DSalesNoInvoiceData?.map((item, index) => (
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
                          value={grossAmount}
                          readOnly
                          // value={cashAmount}
                          // onChange={(e) => setCashAmount(e.target.value)}
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
