import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import F3TenderCashPopUp from "./F3TenderCashPopUp";
import F3ResponsePopUp from "./F3ResponsePopUp";
import CircularProgress from "@mui/material/CircularProgress";
import sliclogo from "../../../Images/sliclogo.png";
import QRCode from "qrcode";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import { Autocomplete, TextField } from "@mui/material";
import ExchangeItemPopUp from "./ExchangeItemPopUp";
import ConfirmTransactionPopUp from "./ConfirmTransactionPopUp";
import { FaExchangeAlt, FaTrash } from "react-icons/fa";
import { MdRemoveCircleOutline } from "react-icons/md";
import { MdRemoveCircle } from "react-icons/md";
import MobileNumberPopUp from "./MobileNumberPopUp";
import QRCodePopup from "../../../components/WhatsAppQRCode/QRCodePopup";

const POS = () => {
  const [data, setData] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [vat, setVat] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSalesType, setSelectedSalesType] = useState(
    "DIRECT SALES INVOICE"
  );
  const [selectedSalesReturnType, setSelectedSalesReturnType] =
    useState("DIRECT RETURN");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const handleActionClick = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);

    // Select the correct row data based on the sales type
    if (selectedSalesType === "DIRECT SALES RETURN") {
      setSelectedRowData(invoiceData[index]); // Save the row data from invoiceData
    } else if (selectedSalesType === "DSALES NO INVOICE") {
      setSelectedRowData(DSalesNoInvoiceData[index]); // Save the row data from data (for sales invoices)
    }
  };

  // useEffect(() => {
  //   const checkSession = async () => {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:1100/api/whatsapp/checkSession"
  //       );
  //       const data = await response.json();

  //       if (data.status === "failure" && data.qrCode) {
  //         setQrCode(data.qrCode);
  //         console.log("QR code:", data.qrCode);
  //         setShowPopup(true);
  //       }
  //     } catch (error) {
  //       console.error("Error checking session:", error);
  //     }
  //   };

  //   checkSession();
  // }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const [isExchangeClick, setIsExchangeClick] = useState(false);
  const [isExchangeDSalesClick, setIsExchangeDSalesClick] = useState(false);
  const handleItemClick = (action) => {
    setOpenDropdown(null);
    if (action === "exchange") {
      handleShowExhangeItemPopup(selectedRowData);
      setIsExchangeClick(true);
    } else if (action === "exchange Dsales") {
      handleShowExhangeItemPopup(selectedRowData);
      setIsExchangeDSalesClick(true);
    }
    // console.log(action);
    // console.log("isButtonClick", isExchangeClick);
  };

  useEffect(() => {
    const storedCompanyData = sessionStorage.getItem("selectedCompany");
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
      }
    }

    const storedLocationData = sessionStorage.getItem("selectedLocation");
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
      }
      // console.log(locationData)
    }
  }, []);

  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));

  // Fetch barcode data from API
  const handleGetBarcodes = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/itemCodes/v2/searchByGTIN?GTIN=${barcode}`
      );
      const data = response?.data?.data;
      // console.log(data)
      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName, ArabicName } = data;

        // call the second api later in their
        const secondApiBody = {
          filter: {
            P_COMP_CODE: "SLIC",
            P_ITEM_CODE: ItemCode,
            P_CUST_CODE: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
            P_GRADE_CODE_1: ProductSize,
          },
          M_COMP_CODE: "SLIC",
          M_USER_ID: "SYSADMIN",
          APICODE: "PRICELIST",
          M_LANG_CODE: "ENG",
        };

        try {
          const secondApiResponse = await ErpTeamRequest.post(
            "/slicuat05api/v1/getApi",
            secondApiBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const secondApiData = secondApiResponse?.data;
          console.log(secondApiData);

          let storedData = sessionStorage.getItem("secondApiResponses");
          storedData = storedData ? JSON.parse(storedData) : {};

          const itemRates = secondApiData.map(
            (item) => item?.PRICELIST?.PLI_RATE
          );
          // Store the array of rates under the respective ItemCode
          storedData[ItemCode] = itemRates;
          // storedData[ItemCode] = secondApiData;

          sessionStorage.setItem(
            "secondApiResponses",
            JSON.stringify(storedData)
          );

          // const itemPrice = secondApiData[0].ItemRate?.RATE;
          const itemPrice = itemRates.reduce((sum, rate) => sum + rate, 0); // Sum of all item prices
          // const itemPrice = 250.0; // Hardcoded for now, ideally fetched from the second API.
          const vat = itemPrice * 0.15;
          const total = itemPrice + vat;
          console.log(itemPrice);

          setData((prevData) => {
            const existingItemIndex = prevData.findIndex(
              (item) => item.Barcode === GTIN
            );

            if (existingItemIndex !== -1) {
              // If the item already exists, just update the Qty and Total
              const updatedData = [...prevData];
              updatedData[existingItemIndex] = {
                ...updatedData[existingItemIndex],
                Qty: updatedData[existingItemIndex].Qty + 1, // Increment quantity by 1
                Total:
                  (updatedData[existingItemIndex].Qty + 1) * (itemPrice + vat), // Update total with the new quantity
              };
              return updatedData;
            } else {
              // If the item is new, add it to the data array
              return [
                ...prevData,
                {
                  SKU: ItemCode,
                  Barcode: GTIN,
                  Description: EnglishName,
                  DescriptionArabic: ArabicName,
                  ItemSize: ProductSize,
                  Qty: 1,
                  ItemPrice: itemPrice,
                  VAT: vat,
                  Total: total,
                },
              ];
            }
          });
        } catch (secondApiError) {
          toast.error(
            secondApiError?.response?.data?.message ||
              "An error occurred while calling the second API"
          );
        }
        // barcode state empty once response is true
        setBarcode("");
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // handleDelete
  const handleDelete = (index) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  };

  // Direct Sales No Invoice
  const [DSalesNoInvoiceData, setDSalesNoInvoiceData] = useState([]);
  const handleGetNoInvoiceBarcodes = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/itemCodes/v2/searchByGTIN?GTIN=${barcode}`
      );
      const data = response?.data?.data;
      // console.log(data)
      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName, ArabicName, id } = data;

        // call the second api later in their
        const secondApiBody = {
          filter: {
            P_COMP_CODE: "SLIC",
            P_ITEM_CODE: ItemCode,
            P_CUST_CODE: selectedSalesReturnType === "DIRECT RETURN" 
            ? selectedCustomeNameWithDirectInvoice?.CUST_CODE 
            : selectedCustomerName?.CUSTOMERCODE,
            P_GRADE_CODE_1: ProductSize,
          },
          M_COMP_CODE: "SLIC",
          M_USER_ID: "SYSADMIN",
          APICODE: "PRICELIST",
          M_LANG_CODE: "ENG",
        };

        try {
          const secondApiResponse = await ErpTeamRequest.post(
            "/slicuat05api/v1/getApi",
            secondApiBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const secondApiData = secondApiResponse?.data;
          console.log(secondApiData);

          let storedData = sessionStorage.getItem("secondApiResponses");
          storedData = storedData ? JSON.parse(storedData) : {};

          const itemRates = secondApiData.map(
            (item) => item?.PRICELIST?.PLI_RATE
          );
          // Store the array of rates under the respective ItemCode
          storedData[ItemCode] = itemRates;
          // storedData[ItemCode] = secondApiData;

          sessionStorage.setItem(
            "secondApiResponses",
            JSON.stringify(storedData)
          );

          // const itemPrice = secondApiData[0].ItemRate?.RATE;
          const itemPrice = itemRates.reduce((sum, rate) => sum + rate, 0); // Sum of all item prices
          // const itemPrice = 250.0; // Hardcoded for now, ideally fetched from the second API.
          const vat = itemPrice * 0.15;
          const total = itemPrice + vat;
          console.log(itemPrice);

          setDSalesNoInvoiceData((prevData) => {
            const existingItemIndex = prevData.findIndex(
              (item) => item.Barcode === GTIN
            );

            if (existingItemIndex !== -1) {
              // If the item already exists, just update the Qty and Total
              const updatedData = [...prevData];
              updatedData[existingItemIndex] = {
                ...updatedData[existingItemIndex],
                Qty: updatedData[existingItemIndex].Qty + 1, // Increment quantity by 1
                Total:
                  (updatedData[existingItemIndex].Qty + 1) * (itemPrice + vat), // Update total with the new quantity
              };
              return updatedData;
            } else {
              // If the item is new, add it to the data array
              return [
                ...prevData,
                {
                  id: id,
                  SKU: ItemCode,
                  Barcode: GTIN,
                  Description: EnglishName,
                  DescriptionArabic: ArabicName,
                  ItemSize: ProductSize,
                  Qty: 1,
                  ItemPrice: itemPrice,
                  VAT: vat,
                  Total: total,
                },
              ];
            }
          });
        } catch (secondApiError) {
          toast.error(
            secondApiError?.response?.data?.message ||
              "An error occurred while calling the second API"
          );
        }
        // barcode state empty once response is true
        setBarcode("");
      } else {
        setDSalesNoInvoiceData([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const [storeDatagridData, setStoreDatagridData] = useState([]);
  const [storeInvoiceDatagridData, setStoreInvoiceDatagridData] = useState([]);
  const handleShowCreatePopup = () => {
    // if (!isCreatePopupVisible) {
    // if (!data || data.length === 0) {
    //   toast.warning(
    //     "The datagrid is empty. Please ensure data is available before proceeding."
    //   );
    // } else {
    setStoreDatagridData([...data]);
    setStoreInvoiceDatagridData([...invoiceData]);

    setCreatePopupVisibility(true);
    // }
  };

  const [apiResponse, setApiResponse] = useState(null);
  const [isOpenOtpPopupVisible, setIsOpenOtpPopupVisible] = useState(false);
  const handleShowOtpPopup = (response) => {
    setCreatePopupVisibility(false);
    setApiResponse(response);
    setIsOpenOtpPopupVisible(true);
  };

  const [isExchangeItemPopupVisible, setIsExchangeItemPopupVisible] =
    useState(false);
  const handleShowExhangeItemPopup = (rowData) => {
    setSelectedRowData(rowData); // Store the selected row data to pass to the popup
    setIsExchangeItemPopupVisible(true);
  };

  const [
    isConfirmTransactionPopupVisible,
    setIsConfirmTransactionPopupVisible,
  ] = useState(false);
  const handleShowConfirmTransactionPopup = () => {
    setIsConfirmTransactionPopupVisible(true);
  };

  const [isMobileNumberPopupVisible, setIsMobileNumberPopupVisible] =
    useState(false);
  const handleShowMobileNumberPopup = () => {
    if (mobileNo) {
      setIsMobileNumberPopupVisible(true);
    } else {
      toast.info("Please enter a mobile number");
    }
  };

  const handleClearData = () => {
    setData([]);
  };

  // transaction Codes Api
  const [transactionCodes, setTransactionCodes] = useState([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState("");
  const fetchTransactionCodes = async () => {
    try {
      // const response = await newRequest.get(
      //   `/transactions/v1/byLocationCode?locationCode=${selectedLocation?.LOCN_CODE}`
      // );
      // console.log(response.data?.data);
      // setTransactionCodes(response.data?.data);

      const response = await newRequest.get(
        `/transactions/v1/byLocationCode?locationCode=${selectedLocation?.stockLocation}`
      );
      let codes = response.data?.data || [];

      // Apply filtering based on selectedOption
      if (selectedSalesType === "DIRECT SALES INVOICE") {
        codes = codes.filter((code) => !code.TXN_CODE.includes("SR"));
      } else if (selectedSalesType === "DIRECT SALES RETURN" || selectedSalesType === "DSALES NO INVOICE") {
        codes = codes.filter((code) => !code.TXN_CODE.includes("IN"));
      }
      // console.log(codes)
      setTransactionCodes(codes);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  const handleTransactionCodes = (event, value) => {
    // console.log(value)
    setSelectedTransactionCode(value ? value : "");
  };

  useEffect(() => {
    if (selectedLocation?.stockLocation) {
      fetchTransactionCodes();
    }
  }, [selectedLocation, selectedSalesType]);

  // fetch All Customer Names api
  const [searchCustomerName, setSearchCustomerName] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const fetchCustomerBasedonTransaction = async () => {
    try {
      const response = await newRequest.get(
        `/transactions/v1/all?TXN_CODE=${selectedTransactionCode?.TXN_CODE}&TXNLOCATIONCODE=${selectedLocation?.stockLocation}`
      );
      const allCustomers = response?.data?.data;
      // console.log(allCustomers)

      setSearchCustomerName(allCustomers);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  const handleSearchCustomerName = (event, value) => {
    console.log(value);
    setSelectedCustomerName(value);
  };

  useEffect(() => {
    if (selectedTransactionCode?.TXN_CODE) {
      fetchCustomerBasedonTransaction();
    }
  }, [selectedTransactionCode?.TXN_CODE]);

  const [customerNameWithDirectInvoice, setCustomerNameWithDirectInvoice] =
    useState([]);
  const [
    selectedCustomeNameWithDirectInvoice,
    setSelectedCustomeNameWithDirectInvoice,
  ] = useState("");
  const fetchCustomerNames = async () => {
    try {
      const response = await newRequest.get("/customerNames/v1/all");
      const allCustomers = response?.data?.data;

      // Filter customers whose CUST_CODE starts with "CL"
      const filteredCustomers = allCustomers.filter((customer) =>
        customer.CUST_CODE.startsWith("CL")
      );
      // console.log(filteredCustomers);
      setCustomerNameWithDirectInvoice(filteredCustomers);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  const handleSearchCustomerNameWithDirectInvoice = (event, value) => {
    // console.log(value);
    setSelectedCustomeNameWithDirectInvoice(value);
  };

  useEffect(() => {
    fetchCustomerNames();
  }, []);

  // picked current date and time
  const [currentTime, setCurrentTime] = useState("");
  const [todayDate, setTodayDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Function to generate invoice number based on date and time
  const generateInvoiceNumber = () => {
    const now = new Date();
    const timestamp = Date.now();
    return `${timestamp}`;
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTodayDate(now.toISOString());
      setCurrentTime(
        now.toLocaleString("en-US", {
          dateStyle: "short",
          timeStyle: "medium",
        })
      );
    };

    setInvoiceNumber(generateInvoiceNumber());
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const resetState = () => {
    setData([]);
    setBarcode("");
    setCustomerName("");
    setMobileNo("");
    setRemarks("");
    setVat("");
    // setSelectedCustomerName(null);
    setSelectedTransactionCode("");
    setInvoiceNumber(generateInvoiceNumber());

    // setTotalAmountWithVat(0);
    // setNetWithVat(0);
    // setTotalVat(0);

    setNetWithOutExchange(0);
    setTotalWithOutExchange(0);
    setTotolAmountWithoutExchange(0);

    setNetWithOutVatDSalesNoInvoice(0);
    setTotalWithOutVatDSalesNoInvoice(0);
    setTotolAmountWithoutVatDSalesNoInvoice(0);

    setExchangeData([]);
    setIsExchangeClick(false);
  };

  const [directSalesInvoiceDocumentNo, setDirectSalesInvoiceDocumentNo] =
    useState(null);
  const [directSalesReturnDocumentNo, setDirectSalesReturnDocumentNo] =
    useState(null);
  const [dSalesNoInvoice, setDSalesNoInvoice] = useState(null);

  // Add state for HeadSysId for each sales type
  const [directSalesInvoiceHeadSysId, setDirectSalesInvoiceHeadSysId] = useState(null);
  const [directSalesReturnHeadSysId, setDirectSalesReturnHeadSysId] = useState(null);
  const [dSalesNoInvoiceHeadSysId, setDSalesNoInvoiceHeadSysId] = useState(null);

  useEffect(() => {
    if (directSalesInvoiceDocumentNo) {
      console.log(
        "Updated Invoice DocNo Number:",
        directSalesInvoiceDocumentNo
      );
    }
    if (directSalesReturnDocumentNo) {
      console.log("Updated Return DocNo Number:", directSalesReturnDocumentNo);
    }
    if (dSalesNoInvoice) {
      console.log("Updated DSales DocNo Number:", dSalesNoInvoice);
    }
    if(directSalesInvoiceHeadSysId) {
      console.log("Updated HeadSysId for DSIN:", directSalesInvoiceHeadSysId);
    }
  }, [
    directSalesInvoiceDocumentNo,
    directSalesReturnDocumentNo,
    dSalesNoInvoice,
    directSalesInvoiceHeadSysId,
  ]);

  // This function handles updating document numbers and sysId for all types
  const handleDocumentNoUpdate = (newDocNo, newHeadSysId, salesType) => {
    if (salesType === "DIRECT SALES INVOICE") {
      setDirectSalesInvoiceDocumentNo(newDocNo);
      setDirectSalesInvoiceHeadSysId(newHeadSysId); // Assuming you have state for HeadSysId
    } else if (salesType === "DIRECT SALES RETURN") {
      setDirectSalesReturnDocumentNo(newDocNo);
      setDirectSalesReturnHeadSysId(newHeadSysId); // Assuming you have state for HeadSysId
    } else if (salesType === "DSALES NO INVOICE") {
      setDSalesNoInvoice(newDocNo);
      setDSalesNoInvoiceHeadSysId(newHeadSysId); // Assuming you have state for HeadSysId
    }
  };

  const insertInvoiceRecord = async (newDocumentNo, newHeadSysId) => {
    try {
      let invoiceAllData;

      if (selectedSalesType === "DIRECT SALES INVOICE") {
        // Construct the master and details data for Sales Invoice
        const master = {
          InvoiceNo: invoiceNumber,
          Head_SYS_ID: `${newHeadSysId}`,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          ItemSysID: data[0]?.SKU,
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: remarks,
          TransactionType: "SALE",
          UserID: "SYSADMIN",
          MobileNo: mobileNo,
          TransactionDate: todayDate,
          VatNumber: vat,
          CustomerName: customerName,
          DocNo: newDocumentNo,
          PendingAmount: netWithVat,
          AdjAmount: netWithVat,
        };

        const details = data.map((item, index) => ({
          Rec_Num: index + 1,
          TblSysNoID: 1000 + index,
          SNo: index + 1,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          ItemSysID: item.SKU,
          InvoiceNo: invoiceNumber,
          Head_SYS_ID: "",
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedCustomeNameWithDirectInvoice?.CUST_CODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: item.Description,
          TransactionType: "SALE",
          UserID: "SYSADMIN",
          ItemSKU: item.SKU,
          ItemUnit: "PCS",
          ItemSize: item.ItemSize,
          ITEMRATE: item.ItemPrice,
          ItemPrice: item.ItemPrice,
          ItemQry: item.Qty,
          TransactionDate: todayDate,
        }));

        invoiceAllData = {
          master,
          details,
        };
      } else if (selectedSalesType === "DIRECT SALES RETURN") {
        // Check if isExchangeClick is true, if so use exchangeData, otherwise use invoiceData
        const dataToUse = isExchangeClick ? exchangeData : invoiceData;

        // Construct the master and details data for Sales Return
        const master = {
          InvoiceNo:
            invoiceHeaderData?.invoiceHeader?.InvoiceNo || invoiceNumber,
          Head_SYS_ID: newHeadSysId,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          // ItemSysID: exchangeData[0]?.ItemCode,
          ItemSysID: exchangeData[0]?.SKU,
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedSalesReturnType === "DIRECT RETURN" ? selectedCustomeNameWithDirectInvoice?.CUST_CODE : selectedCustomerName?.CUSTOMERCODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: remarks,
          TransactionType: "RETURN",
          UserID: "SYSADMIN",
          MobileNo: mobileNo,
          TransactionDate: todayDate,
          CustomerName: invoiceHeaderData?.invoiceHeader?.CustomerName,
          DocNo: newDocumentNo,
          PendingAmount: netWithVat,
          AdjAmount: netWithVat,
        };

        const details = dataToUse.map((item, index) => ({
          Rec_Num: index + 1,
          TblSysNoID: 1000 + index,
          SNo: index + 1,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          ItemSysID: item.SKU || item.ItemCode,
          InvoiceNo:
            invoiceHeaderData?.invoiceHeader?.InvoiceNo || invoiceNumber,
          Head_SYS_ID: "",
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedSalesReturnType === "DIRECT RETURN" ? selectedCustomeNameWithDirectInvoice?.CUST_CODE : selectedCustomerName?.CUSTOMERCODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: item.Description,
          TransactionType: "RETURN",
          UserID: "SYSADMIN",
          // ItemSKU: isExchangeClick ? item.ItemCode : item.SKU,
          ItemSKU: isExchangeClick ? item.SKU : item.SKU,
          ItemUnit: "PCS",
          ItemSize: item.ItemSize,
          ITEMRATE: item.ItemPrice,
          ItemPrice: item.ItemPrice,
          ItemQry: item.Qty,
          TransactionDate: todayDate,
        }));

        console.log(details);

        invoiceAllData = {
          master,
          details,
        };
      } else if (selectedSalesType === "DSALES NO INVOICE") {
        const dataToUseDSales = isExchangeDSalesClick
          ? dSalesNoInvoiceexchangeData
          : DSalesNoInvoiceData;
        // Construct the master and details data for DSALES NO INVOICE
        const master = {
          InvoiceNo: invoiceNumber,
          Head_SYS_ID: newHeadSysId,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          ItemSysID: DSalesNoInvoiceData[0]?.SKU,
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedSalesReturnType === "DIRECT RETURN" ? selectedCustomeNameWithDirectInvoice?.CUST_CODE : selectedCustomerName?.CUSTOMERCODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: remarks,
          TransactionType: "DSALES NO INVOICE",
          UserID: "SYSADMIN",
          MobileNo: mobileNo,
          TransactionDate: todayDate,
          VatNumber: vat,
          CustomerName: customerName,
          DocNo: newDocumentNo,
          PendingAmount: netWithVat,
          AdjAmount: netWithVat,
        };
        const details = dataToUseDSales.map((item, index) => ({
          Rec_Num: index + 1,
          TblSysNoID: 1000 + index,
          SNo: index + 1,
          DeliveryLocationCode: selectedLocation?.stockLocation,
          ItemSysID: item.SKU || item.ItemCode,
          InvoiceNo: invoiceNumber,
          Head_SYS_ID: "",
          TransactionCode: selectedTransactionCode?.TXN_CODE,
          CustomerCode: selectedSalesReturnType === "DIRECT RETURN" ? selectedCustomeNameWithDirectInvoice?.CUST_CODE : selectedCustomerName?.CUSTOMERCODE,
          SalesLocationCode: selectedLocation?.stockLocation,
          Remarks: item.Description,
          TransactionType: "DSALES NO INVOICE",
          UserID: "SYSADMIN",
          ItemSKU: isExchangeDSalesClick ? item.SKU : item.SKU,
          ItemUnit: "PCS",
          ItemSize: item.ItemSize,
          ITEMRATE: item.ItemPrice,
          ItemPrice: item.ItemPrice,
          ItemQry: item.Qty,
          TransactionDate: todayDate,
        }));

        invoiceAllData = {
          master,
          details,
        };
      }

      // Call the API to save the invoice or return record
      const saveInvoiceResponse = await newRequest.post(
        "/invoice/v1/saveInvoice",
        invoiceAllData
      );
      console.log("invoice body", invoiceAllData);
      console.log("Record saved successfully:", saveInvoiceResponse.data);

      // if (isExchangeClick) {
      //   const resArchive = await newRequest.post("/invoice/v1/archiveInvoice", {
      //     InvoiceNo: invoiceHeaderData?.invoiceHeader?.InvoiceNo,
      //   });
      //   console.log(resArchive.data);
      // }

      // if (isExchangeDSalesClick) {
      //   const resArchive = await newRequest.post("/invoice/v1/archiveInvoice", {
      //     InvoiceNo: invoiceNumber,
      //   });
      //   console.log(resArchive.data);
      // }

      // resetState();
      toast.success(
        saveInvoiceResponse?.data?.message || "Invoice saved successfully"
      );
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Error saving record");
    }
  };

  // Invoice generation api
  const [netWithVat, setNetWithVat] = useState("");
  const [totalVat, setTotalVat] = useState("");
  const [totalAmountWithVat, setTotalAmountWithVat] = useState(0); // To store total amount with VAT

  // invoice state without Exchange
  const [netWithOutVatExchange, setNetWithOutExchange] = useState("");
  const [totalWithOutExchange, setTotalWithOutExchange] = useState("");
  const [totolAmountWithoutExchange, setTotolAmountWithoutExchange] =
    useState(0);

  // DSales state without exchange
  const [netWithOutVatDSalesNoInvoice, setNetWithOutVatDSalesNoInvoice] =
    useState("");
  const [totalWithOutVatDSalesNoInvoice, setTotalWithOutVatDSalesNoInvoice] =
    useState("");
  const [
    totolAmountWithoutVatDSalesNoInvoice,
    setTotolAmountWithoutVatDSalesNoInvoice,
  ] = useState(0);

  const [invoiceLoader, setInvoiceLoader] = useState(false);
  const [zatcaQrcode, setZatcaQrcode] = useState(null);
  // const [zatchaQrcodeExchange, setZatchaQrcodeExchange] = useState(null);
  const handleInvoiceGenerator = async (e) => {
    // e.preventDefault();
    setInvoiceLoader(true);
    let payload = {};
    try {
      switch (selectedSalesType) {
        case "DIRECT SALES INVOICE":
          payload = {
            invoiceDate: todayDate,
            totalWithVat: totalAmountWithVat,
            vatTotal: Number(totalVat),
          };
          break;

        case "DIRECT SALES RETURN":
          payload = {
            invoiceDate: todayDate,
            totalWithVat: totolAmountWithoutExchange,
            vatTotal: Number(totalWithOutExchange),
          };
          break;

        case "DSALES NO INVOICE":
          payload = {
            invoiceDate: todayDate,
            totalWithVat: totolAmountWithoutVatDSalesNoInvoice,
            vatTotal: Number(totalWithOutVatDSalesNoInvoice),
          };
          break;

        default:
          console.error("Unknown invoice type");
          setInvoiceLoader(false);
          return;
      }
      const res = await newRequest.post("/zatca/generateZatcaQRCode", payload);
      // console.log('invoice', res?.data);

      const qrCodeDataFromApi = res?.data?.qrCodeData;
      console.log(qrCodeDataFromApi);
      setZatcaQrcode(qrCodeDataFromApi);
      // setZatchaQrcodeExchange(qrCodeDataFromApi);
      // handlePrintSalesInvoice(qrCodeDataFromApi);

      // insertInvoiceRecord();
      setIsConfirmDisabled(false);
      setIsTenderCashEnabled(false);
      toast.success("Invoice generated successfully!");
      setInvoiceLoader(false);
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.errors[0] ||
          "An error occurred while generating the invoice"
      );
      setInvoiceLoader(false);
    }
  };


  const [zatchaQrcodeExchange, setZatchaQrcodeExchange] = useState(null);
  const handleZatcaInvoiceGenerator = async (e) => {
    setInvoiceLoader(true);
  
    // Check if either of the buttons is clicked
    if (!isExchangeClick && !isExchangeDSalesClick) {
      toast.error("Please select a valid action to proceed.");
      setInvoiceLoader(false);
      return;
    }
  
    let payload = {
      invoiceDate: todayDate,
      totalWithVat: totalAmountWithVat,
      vatTotal: Number(totalVat),
    };
  
    try {
      const res = await newRequest.post("/zatca/generateZatcaQRCode", payload);
      const qrCodeDataFromApi = res?.data?.qrCodeData;
      console.log(qrCodeDataFromApi);
      setZatchaQrcodeExchange(qrCodeDataFromApi);
  
      toast.success("Invoice generated successfully!");
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.errors[0] || "An error occurred while generating the invoice"
      );
    } finally {
      setInvoiceLoader(false);
    }
  };

  // Calculate totals for Net with VAT, Total VAT, and Total Amount with VAT
  useEffect(() => {
    const calculateTotals = () => {
      let totalNet = 0;
      let totalVat = 0;

      data.forEach((item) => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });

      setNetWithVat(totalNet);
      setTotalVat(totalVat);
      setTotalAmountWithVat(totalNet + totalVat);
    };

    // calculateTotals();
    if (data.length > 0) {
      calculateTotals(); // Only calculate when there is data
    }
  }, [data]);

  // invoice generate
  const handlePrintSalesInvoice = async (qrCodeData) => {
    const newInvoiceNumber = generateInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);

    // Generate QR code data URL
    const qrCodeDataURL = await QRCode.toDataURL(`${invoiceNumber}`);

    let totalsContent;

    if (selectedSalesType === "DIRECT SALES INVOICE") {
      totalsContent = `
        <div>
          <strong>Gross:</strong>
          <div class="arabic-label">(ريال) المجموع</div>
          ${netWithVat}
        </div>
        <div>
          <strong>VAT (15%):</strong>
          <div class="arabic-label">ضريبة القيمة المضافة</div>
          ${totalVat}
        </div>
        <div>
          <strong>Total Amount With VAT:</strong>
          <div class="arabic-label">المجموع</div>
          ${totalAmountWithVat}
        </div>
        <div>
          <strong>Paid:</strong>
          <div class="arabic-label">المدفوع</div>
          ${totalAmountWithVat}
        </div>
        <div>
          <strong>Change Due:</strong>
          <div class="arabic-label">المتبقي</div>
          0.00
        </div>
      `;
    } else if (selectedSalesType === "DIRECT SALES RETURN") {
      totalsContent = `
        <div>
          <strong>Gross:</strong>
          <div class="arabic-label">(ريال) المجموع</div>
          ${netWithOutVatExchange}
        </div>
        <div>
          <strong>VAT (15%):</strong>
          <div class="arabic-label">ضريبة القيمة المضافة</div>
          ${totalWithOutExchange}
        </div>
        <div>
          <strong>Total Amount With VAT:</strong>
          <div class="arabic-label">المجموع</div>
          ${totolAmountWithoutExchange}
        </div>
        <div>
          <strong>Paid:</strong>
          <div class="arabic-label">المدفوع</div>
          ${totolAmountWithoutExchange}
        </div>
        <div>
          <strong>Change Due:</strong>
          <div class="arabic-label">المتبقي</div>
          0.00
        </div>
      `;
    } else if (selectedSalesType === "DSALES NO INVOICE") {
      totalsContent = `
        <div>
          <strong>Gross:</strong>
          <div class="arabic-label">(ريال) المجموع</div>
          ${netWithOutVatDSalesNoInvoice}
        </div>
        <div>
          <strong>VAT (15%):</strong>
          <div class="arabic-label">ضريبة القيمة المضافة</div>
          ${totalWithOutVatDSalesNoInvoice}
        </div>
        <div>
          <strong>Total Amount With VAT:</strong>
          <div class="arabic-label">المجموع</div>
          ${totolAmountWithoutVatDSalesNoInvoice}
        </div>
        <div>
          <strong>Paid:</strong>
          <div class="arabic-label">المدفوع</div>
          ${totolAmountWithoutVatDSalesNoInvoice}
        </div>
        <div>
          <strong>Change Due:</strong>
          <div class="arabic-label">المتبقي</div>
          0.00
        </div>
      `;
    }

    console.log("selectedSalesType", selectedSalesType);
    console.log("customerName", customerName);
    console.log("vat", vat);
    console.log("invoiceNumber", invoiceNumber);
    console.log("currentTime", currentTime);
    console.log("invoiceData", invoiceData);
    console.log("DSalesNoInvoiceData", DSalesNoInvoiceData);

    const html = `
      <html>
        <head>
          <title>Sales Invoice</title>
          <style>
            @page { size: 3in 10in; margin: 0; }
            body { font-family: Arial, sans-serif; font-size: 15px; padding: 5px; }
            .invoice-header, .invoice-footer {
              text-align: center;
              font-size: 15px;
              margin-bottom: 5px;
            }
            .invoice-header {
              font-weight: bold;
            }
            .invoice-section {
              margin: 10px 0;
              font-size: 15px;
            }
            .sales-invoice-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              margin-top: 5px;
              margin-bottom: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th,
            .table td {
              text-align: center; /* Center align for more symmetry */
              padding: 5px;
              border-bottom: 1px solid black;
              font-size: 15px;
            }

            .table th div {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
            }

            .table th div span {
              font-family: 'Arial', sans-serif;
              text-align: center;
            }
            .total-section {
              font-size: 15px;
              padding: 10px 0;
              line-height: 1.5;
              text-align: left;
            }
            .left-side {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .left-side div {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .arabic-label {
              text-align: right;
              direction: rtl;
              margin-left: 10px;
              font-family: 'Arial', sans-serif;
              width: auto;
            }
            .qr-section {
              text-align: center;
              margin-top: 80px;
            }
            .receipt-footer {
              margin-top: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }
            .customer-info div {
              margin-bottom: 6px; /* Add space between each div */
            }
              .field-label {
                font-weight: bold;
              }
             .customer-invoiceNumber {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .customer-invocieQrcode {
              margin-top: -5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <img src="${sliclogo}" alt="SLIC Logo" width="120"/>
            <div>Saudi Leather Industries Factory Co.</div>
            <div>VAT#: 300456416500003</div>
            <div>CR#: 2050011041</div>
            <div>Unit No 1, Dammam 34334 - 3844, Saudi Arabia</div>
            <div>Tel. Number: 013 8121066</div>
          </div>

          <div class="sales-invoice-title">
            ${
              selectedSalesType === "DIRECT SALES INVOICE"
                ? "Sales Invoice"
                : "CREDIT NOTE"
            }
          </div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>
            ${
              selectedSalesType === "DIRECT SALES INVOICE" || selectedSalesType === "DSALES NO INVOICE"
                ? customerName
                : invoiceHeaderData?.invoiceHeader?.CustomerName
            }
            </div>
            <div><span class="field-label">VAT#: </span>
            ${
              selectedSalesType === "DIRECT SALES INVOICE" || selectedSalesType === "DSALES NO INVOICE"
                ? vat
                : invoiceHeaderData?.invoiceHeader?.VatNumber
            }
            </div>
            <div class="customer-invoiceNumber">
              <div>
                <div><span class="field-label">Receipt: </span>
                 ${
                  selectedSalesType === "DIRECT SALES INVOICE" || selectedSalesType === "DSALES NO INVOICE"
                    ? invoiceNumber
                    : searchInvoiceNumber
                }
                </div>
                <div><span class="field-label">Date: </span>${currentTime}</div>
              </div>
              <div class="customer-invocieQrcode">
                <img src="${qrCodeDataURL}" alt="QR Code" height="75" width="100" />
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>بيان</span>
                    <span>Description</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>الكمية</span>
                    <span>Qty</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>السعر</span>
                    <span>Price</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>المجموع</span>
                    <span>Total</span>
                  </div>
                </th>
              </tr>
            </thead>

           <tbody>
           ${
             selectedSalesType === "DIRECT SALES RETURN"
               ? invoiceData
                   .map(
                     (item) => `
                    <tr>
                      <td style="border-bottom: none;">${item.SKU}</td>
                      <td style="border-bottom: none;">${item.Qty}</td>
                      <td style="border-bottom: none;">${item.ItemPrice}</td>
                      <td style="border-bottom: none;">${item.ItemPrice * item.Qty}</td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left; padding-left: 20px;">
                        <div>
                          <span style="direction: ltr; text-align: left; display: block;">
                            ${item.Description.substring(0, item.Description.length / 2)}
                          </span>
                          <span style="direction: rtl; text-align: right; display: block;">
                            ${item.DescriptionArabic.substring(0, item.DescriptionArabic.length / 2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  `
                   )
                   .join("")
               : selectedSalesType === "DSALES NO INVOICE"
               ? DSalesNoInvoiceData.map(
                   (item) => `
                    <tr>
                      <td style="border-bottom: none;">${item.SKU}</td>
                      <td style="border-bottom: none;">${item.Qty}</td>
                      <td style="border-bottom: none;">${item.ItemPrice}</td>
                      <td style="border-bottom: none;">${item.ItemPrice * item.Qty}</td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left; padding-left: 20px;">
                        <div>
                          <span style="direction: ltr; text-align: left; display: block;">
                            ${item.Description.substring(0, item.Description.length / 2)}
                          </span>
                          <span style="direction: rtl; text-align: right; display: block;">
                            ${item.DescriptionArabic.substring(0, item.DescriptionArabic.length / 2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  `
                 ).join("")
               : data
                   .map(
                     (item) => `
                       <tr>
                        <td style="border-bottom: none;">${item.SKU}</td>
                        <td style="border-bottom: none;">${item.Qty}</td>
                        <td style="border-bottom: none;">${item.ItemPrice}</td>
                        <td style="border-bottom: none;">${item.ItemPrice * item.Qty}</td>
                      </tr>
                      <tr>
                        <td colspan="4" style="text-align: left; padding-left: 20px;">
                          <div>
                            <span style="direction: ltr; text-align: left; display: block;">
                              ${item.Description.substring(0, item.Description.length / 2)}
                            </span>
                            <span style="direction: rtl; text-align: right; display: block;">
                              ${item.DescriptionArabic.substring(0, item.DescriptionArabic.length / 2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                     `
                   )
                   .join("")
           }          
            </tbody>
          </table>
          <div class="total-section">
            <div class="left-side">
               ${totalsContent}
            </div>
          </div>

          <div class="qr-section">
            <canvas id="qrcode-canvas"></canvas>
          </div>

          <div class="receipt-footer">Thank you for shopping with us!</div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "Print Window", "height=800,width=800");
    if (!printWindow) {
      console.error(
        "Failed to open the print window. It might be blocked by the browser."
      );
      return;
    }

    // Write the static HTML into the print window
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait until the print window has loaded fully
    printWindow.onload = () => {
      const qrCodeCanvas = printWindow.document.getElementById("qrcode-canvas");
      // let newQR='ARBOYXJ0ZWMgU29sdXRpb25zAg8zMDA0NTY0MTY1MDAwMDMDFDIwMjQtMDgtMTdUMTI6MDA6MDBaBAcxMDAwLjAwBQMxNTAGQGQzMzlkZDlkZGZkZTQ5MDI1NmM3OTVjOTFlM2RmZjBiNGQ2MTAyYjhhMGM4OTYxYzhhNGExNDE1YjZhZGMxNjYHjjMwNDUwMjIxMDBjZjk1MjkwMzc2ZTM5MjgzOGE4ZGYwMjc2YTdiMjEyYmUzMjMyNzAxNjFlNWFjYWY0MGNjOTgwMGJjNzJjNTY4MDIyMDQzYzEyZjEzMTdiZjMxN2Q2YWZkNTAwNTgxNDRlMjdmOTczNWUzZDZlMDYzYWI0MTk2YWU5YWQyZDlhMWVhN2MIgjA0OWM2MDM2NmQxNDg5NTdkMzAwMWQzZDQxNGI0NGIxYjA1MGY0NWZlODJjNDBkZTE4ZWI3NWM2M2Y1YzU2MjRmNDM3NzY0MWFjY2JlZmJiNDlhNGE4MmM1ZDAxY2YyMDRkNTdhMzEzODE1N2RmZDJmNmFlOTIzYjkzMjZiZmI5NWI='
      // Generate the QR code using the `qrcode` library
      QRCode.toCanvas(
        qrCodeCanvas,
        qrCodeData,
        { width: 380 },
        function (error) {
          if (error) console.error(error);
          else {
            // Trigger the print dialog after the QR code is rendered
            printWindow.print();
            printWindow.close();
          }
        }
      );
      // setIsOpenOtpPopupVisible(false);
      // console.log(qrCodeData);
    };
  };

  // exchange Item invoice
  const handlePrintExchangeInvoice = async (qrCodeData) => {
    if (!isExchangeClick && !isExchangeDSalesClick) return;

    const printWindow = window.open("", "Print Window", "height=800,width=800");

    // Generate QR code data URL
    const qrCodeDataURL = await QRCode.toDataURL(`${invoiceNumber}`);

    // Use exchange data or DSales exchange data based on the exchange type
    const exchangeDataToUse = isExchangeClick
      ? exchangeData
      : dSalesNoInvoiceexchangeData;

    // Generate totals for exchange invoice
    const totalsContent = `
      <div>
        <strong>Gross:</strong>
        <div class="arabic-label">(ريال) المجموع</div>
        ${netWithVat}
      </div>
      <div>
        <strong>VAT (15%):</strong>
        <div class="arabic-label">ضريبة القيمة المضافة</div>
        ${totalVat}
      </div>
      <div>
        <strong>Total Amount With VAT:</strong>
        <div class="arabic-label">المجموع</div>
        ${totalAmountWithVat}
      </div>
      <div>
        <strong>Paid:</strong>
        <div class="arabic-label">المدفوع</div>
        ${totalAmountWithVat}
      </div>
      <div>
        <strong>Change Due:</strong>
        <div class="arabic-label">المتبقي</div>
        0.00
      </div>
    `;

    // Generate the exchange invoice HTML
    const html = `
      <html>
        <head>
          <title>Exchange Invoice</title>
          <style>
            @page { size: 3in 10in; margin: 0; }
            body { font-family: Arial, sans-serif; font-size: 15px; padding: 5px; }
            .invoice-header, .invoice-footer {
              text-align: center;
              font-size: 15px;
              margin-bottom: 5px;
            }
            .invoice-header {
              font-weight: bold;
            }
            .invoice-section {
              margin: 10px 0;
              font-size: 15px;
            }
            .sales-invoice-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              margin-top: 5px;
              margin-bottom: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th,
            .table td {
              text-align: center; /* Center align for more symmetry */
              padding: 5px;
              border-bottom: 1px solid black;
              font-size: 15px;
            }

            .table th div {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
            }

            .table th div span {
              font-family: 'Arial', sans-serif;
              text-align: center;
            }
            .total-section {
              font-size: 15px;
              padding: 10px 0;
              line-height: 1.5;
              text-align: left;
            }
            .left-side {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .left-side div {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .arabic-label {
              text-align: right;
              direction: rtl;
              margin-left: 10px;
              font-family: 'Arial', sans-serif;
              width: auto;
            }
            .qr-section {
              text-align: center;
              margin-top: 80px;
            }
            .receipt-footer {
              margin-top: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }
            .customer-info div {
              margin-bottom: 6px; /* Add space between each div */
            }
              .field-label {
                font-weight: bold;
              }
             .customer-invoiceNumber {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .customer-invocieQrcode {
              margin-top: -5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <img src="${sliclogo}" alt="SLIC Logo" width="120"/>
            <div>Saudi Leather Industries Factory Co.</div>
            <div>VAT#: 300456416500003</div>
            <div>CR#: 2050011041</div>
            <div>Unit No 1, Dammam 34334 - 3844, Saudi Arabia</div>
            <div>Tel. Number: 013 8121066</div>
          </div>

          <div class="sales-invoice-title">Exchange Slip Invoice</div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>
            ${
              selectedSalesType === "DSALES NO INVOICE"
                ? customerName
                : invoiceHeaderData?.invoiceHeader?.CustomerName
            }
            </div>
            <div><span class="field-label">VAT#: </span>
            ${
              selectedSalesType === "DSALES NO INVOICE"
                ? vat
                : invoiceHeaderData?.invoiceHeader?.VatNumber
            }
            </div>
            <div class="customer-invoiceNumber">
              <div>
                <div><span class="field-label">Receipt: </span>${invoiceNumber}</div>
                <div><span class="field-label">Date: </span>${currentTime}</div>
              </div>
              <div class="customer-invocieQrcode">
                <img src="${qrCodeDataURL}" alt="QR Code" height="75" width="100" />
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>بيان</span>
                    <span>Description</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>الكمية</span>
                    <span>Qty</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>السعر</span>
                    <span>Price</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>المجموع</span>
                    <span>Total</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              ${exchangeDataToUse
                .map(
                  (item) => `
                  <tr>
                    <td style="border-bottom: none;">${item.SKU}</td>
                    <td style="border-bottom: none;">${item.Qty}</td>
                    <td style="border-bottom: none;">${item.ItemPrice}</td>
                    <td style="border-bottom: none;">${item.Total}</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="text-align: left; padding-left: 20px;">
                      <div>
                        <span style="direction: ltr; text-align: left; display: block;">
                          ${item.Description.substring(0, item.Description.length / 2)}
                        </span>
                        <span style="direction: rtl; text-align: right; display: block;">
                          ${item.DescriptionArabic.substring(0, item.DescriptionArabic.length / 2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total-section">
            <div class="left-side">
               ${totalsContent}
            </div>
          </div>

          <div class="qr-section">
            <canvas id="qrcode-canvas"></canvas>
          </div>

          <div class="receipt-footer">Thank you for shopping with us!</div>
        </body>
      </html>
    `;

    // Write the static HTML into the print window
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait until the print window has loaded fully
    printWindow.onload = () => {
      const qrCodeCanvas = printWindow.document.getElementById("qrcode-canvas");
      // let newQR='ARBOYXJ0ZWMgU29sdXRpb25zAg8zMDA0NTY0MTY1MDAwMDMDFDIwMjQtMDgtMTdUMTI6MDA6MDBaBAcxMDAwLjAwBQMxNTAGQGQzMzlkZDlkZGZkZTQ5MDI1NmM3OTVjOTFlM2RmZjBiNGQ2MTAyYjhhMGM4OTYxYzhhNGExNDE1YjZhZGMxNjYHjjMwNDUwMjIxMDBjZjk1MjkwMzc2ZTM5MjgzOGE4ZGYwMjc2YTdiMjEyYmUzMjMyNzAxNjFlNWFjYWY0MGNjOTgwMGJjNzJjNTY4MDIyMDQzYzEyZjEzMTdiZjMxN2Q2YWZkNTAwNTgxNDRlMjdmOTczNWUzZDZlMDYzYWI0MTk2YWU5YWQyZDlhMWVhN2MIgjA0OWM2MDM2NmQxNDg5NTdkMzAwMWQzZDQxNGI0NGIxYjA1MGY0NWZlODJjNDBkZTE4ZWI3NWM2M2Y1YzU2MjRmNDM3NzY0MWFjY2JlZmJiNDlhNGE4MmM1ZDAxY2YyMDRkNTdhMzEzODE1N2RmZDJmNmFlOTIzYjkzMjZiZmI5NWI='
      // Generate the QR code using the `qrcode` library
      QRCode.toCanvas(
        qrCodeCanvas,
        qrCodeData,
        { width: 380 },
        function (error) {
          if (error) console.error(error);
          else {
            // Trigger the print dialog after the QR code is rendered
            printWindow.print();
            printWindow.close();
          }
        }
      );
    };
  };


  // Direct Sales Return InvoiceData Datagrid
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [invoiceHeaderData, setInvoiceHeaderData] = useState([]);
  const [invoiceDataLoader, setInvoiceDataLoader] = useState("");
  // Fetch invoice details when searching by invoice number for a sales return
  const handleGetInvoiceDetails = async (invoiceNo) => {
    // e.preventDefault();
    setInvoiceDataLoader(true);

    try {
      const response = await newRequest.get(
        `/invoice/v1/headers-and-line-items?InvoiceNo=${invoiceNo}`
      );
      const data = response?.data?.data;
      setInvoiceHeaderData(data);
      console.log(data);
      setSearchInvoiceNumber(invoiceNo);
      if (data) {
        const invoiceDetails = data.invoiceDetails;

        setInvoiceData(
          invoiceDetails.map((item) => {
            const vat = item.ItemPrice * 0.15;
            const total = item.ItemPrice * item.ItemQry + vat * item.ItemQry;

            return {
              id: item.id,
              SKU: item.ItemSKU,
              Barcode: item.InvoiceNo, // Assuming InvoiceNo acts as the barcode in this case
              Description: item.Remarks || "No description",
              DescriptionArabic: item.Remarks || "No description",
              ItemSize: item.ItemSize,
              Qty: item?.ItemQry,
              originalQty: item.ItemQry,
              ItemPrice: item.ItemPrice,
              VAT: vat,
              Total: total,
            };
          })
        );
      } else {
        setInvoiceData([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setInvoiceDataLoader(false);
    }
  };

  
  const handleSearchInvoice = (e) => {
    e.preventDefault();
    handleGetInvoiceDetails(searchInvoiceNumber);
  };
  
  // Sales return Calculation without exhange
  useEffect(() => {
    const calculateTotals = () => {
      let totalNet = 0;
      let totalVat = 0;
      
      invoiceData.forEach((item) => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });
      // console.log(exchangeData)
      
      setNetWithOutExchange(totalNet);
      setTotalWithOutExchange(totalVat);
      setTotolAmountWithoutExchange(totalNet + totalVat);
    };
    
    calculateTotals();
  }, [invoiceData]);
  
  // New function to handle Qty changes
  const handleQtyChange = (index, newQty) => {
    const originalQty = invoiceData[index].originalQty;
    const qty = Number(newQty);
    // console.log(originalQty)
    
    if (qty > originalQty || qty < 1) return;
    
    // Update the state with the new quantity
    const updatedInvoiceData = invoiceData.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          Qty: qty,
          Total: item.ItemPrice * qty + item.VAT * qty, // Recalculate total
        };
      }
      return item;
    });
    setInvoiceData(updatedInvoiceData);
  };
  
  // handleDelete
  const handleDeleteInvoiceData = (index) => {
    const updatedInvoiceData = invoiceData.filter((_, i) => i !== index);
    setInvoiceData(updatedInvoiceData);
  };

  const handleClearInvoiceData = () => {
    setInvoiceData([]);
    setExchangeData([]);
    setInvoiceHeaderData([]);
    setData([]);
    setDSalesNoInvoiceData([]);
    setDSalesNoInvoiceexchangeData([]);
  };

  useEffect(() => {
    if (!isOpenOtpPopupVisible) {
      handleClearInvoiceData();
      resetState();
    }
  }, [isOpenOtpPopupVisible]);

  const [exchangeData, setExchangeData] = useState([]);
  const addExchangeData = (newData) => {
    setExchangeData((prevData) => {
      // Loop through the newData array to handle multiple scanned items
      return newData.reduce((updatedData, newItem) => {
        const existingItemIndex = updatedData.findIndex(
          (item) => item.Barcode === newItem.Barcode
        );
  
        if (existingItemIndex !== -1) {
          // If the item exists, update the quantity and total
          const updatedItem = {
            ...updatedData[existingItemIndex],
            Qty: updatedData[existingItemIndex].Qty + newItem.Qty,
            Total:
              (updatedData[existingItemIndex].Qty + newItem.Qty) *
              (newItem.ItemPrice + newItem.VAT),
          };
  
          // Replace the existing item with the updated item
          updatedData[existingItemIndex] = updatedItem;
        } else {
          // If the item is new, add it to the data array
          updatedData.push(newItem);
        }
  
        return updatedData;
      }, [...prevData]); // Start with the current exchangeData
    });
  };  

  // exchange calculation
  useEffect(() => {
    const calculateExchangeTotals = () => {
      let totalNet = 0;
      let totalVat = 0;

      exchangeData.forEach((item) => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });
      // console.log(exchangeData)

      setNetWithVat(totalNet);
      setTotalVat(totalVat);
      setTotalAmountWithVat(totalNet + totalVat);
    };

    // calculateTotals();
    if (exchangeData.length > 0) {
      calculateExchangeTotals(); // Only calculate when there is exchange data
    }
  }, [exchangeData]);



  // DSALES no Invoice Exchange
  const [dSalesNoInvoiceexchangeData, setDSalesNoInvoiceexchangeData] =
    useState([]);
  const addDSalesExchangeData = (newData) => {
    setDSalesNoInvoiceexchangeData((prevData) => {
      return newData.reduce((updatedData, newItem) => {
        const existingItemIndex = updatedData.findIndex(
          (item) => item.Barcode === newItem.Barcode
        );
  
        if (existingItemIndex !== -1) {
          const updatedItem = {
            ...updatedData[existingItemIndex],
            Qty: updatedData[existingItemIndex].Qty + newItem.Qty,
            Total:
              (updatedData[existingItemIndex].Qty + newItem.Qty) *
              (newItem.ItemPrice + newItem.VAT),
          };
  
          updatedData[existingItemIndex] = updatedItem;
        } else {
          updatedData.push(newItem);
        }
  
        return updatedData;
      }, [...prevData]);
    });
  };
  
  // DSales No Invoice Calculation
  useEffect(() => {
    const calculateTotals = () => {
      let totalNet = 0;
      let totalVat = 0;

      DSalesNoInvoiceData.forEach((item) => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });
      // console.log(exchangeData)

      setNetWithOutVatDSalesNoInvoice(totalNet);
      setTotalWithOutVatDSalesNoInvoice(totalVat);
      setTotolAmountWithoutVatDSalesNoInvoice(totalNet + totalVat);
    };

    calculateTotals();
  }, [DSalesNoInvoiceData]);

  // DSALES No Invocie Exchange calculation
  useEffect(() => {
    const calculateDSalesExchangeTotals = () => {
      let totalNet = 0;
      let totalVat = 0;
      console.log(dSalesNoInvoiceexchangeData);
      dSalesNoInvoiceexchangeData.forEach((item) => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });
      // console.log(dSalesNoInvoiceexchangeData)

      setNetWithVat(totalNet);
      setTotalVat(totalVat);
      setTotalAmountWithVat(totalNet + totalVat);
    };

    // calculateTotals();
    if (dSalesNoInvoiceexchangeData.length > 0) {
      calculateDSalesExchangeTotals(); // Only calculate when there is exchange data
    }
  }, [dSalesNoInvoiceexchangeData]);

  // handleDelete
  const handleDeleteExchangeData = (index) => {
    setExchangeData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const [isTenderCashEnabled, setIsTenderCashEnabled] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);
  const handleSelectionsSaved = () => {
    setIsConfirmDisabled(true);
    setIsTenderCashEnabled(true); // Enable the Tender Cash button
  };

  useEffect(() => {
    setIsConfirmDisabled(false);
    setIsTenderCashEnabled(false);
    handleClearInvoiceData();
    setNetWithVat(0);
    setTotalVat(0);
    setTotalAmountWithVat(0);
  }, [selectedSalesType]);

  return (
    <SideNav>
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 shadow-md">
          <div className="px-3 py-3 flex justify-between bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
            <span>
              {selectedSalesType === "DIRECT SALES INVOICE"
                ? "Sales Entry Form (Direct Invoice)"
                : "Sales Entry Form (Direct Sales Return)"}
            </span>
            <p className="text-end">{currentTime}</p>
          </div>

          <div className="mb-4 mt-4 flex justify-between">
            <h2 className="text-2xl font-semibold bg-yellow-100 px-2 py-1">
              {selectedSalesType === "DIRECT SALES INVOICE"
                ? "NEW SALE"
                : "SALES RETURN"}
            </h2>
            <p className="text-2xl font-semibold bg-yellow-100 px-2 py-1">
              Cashier :{" "}
              {`${selectedLocation?.stockLocation} - ${selectedLocation?.showroom}`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Trasnaction Code Combo box */}
            <div>
              <label htmlFor="transactionId" className="block text-gray-700">
                Transactions Codes *
              </label>
              <Autocomplete
                id="transactionId"
                options={transactionCodes}
                getOptionLabel={(option) =>
                  option && option.TXN_CODE && option.TXN_NAME
                    ? `${option.TXN_CODE} - ${option.TXN_NAME}`
                    : ""
                }
                onChange={handleTransactionCodes}
                // value={selectedTransactionCode}
                value={
                  transactionCodes.find(
                    (option) =>
                      option.TXN_CODE === selectedTransactionCode?.TXN_CODE
                  ) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option?.TXN_CODE === value?.TXN_CODE
                }
                onInputChange={(event, value) => {
                  if (!value) {
                    setSelectedTransactionCode(""); // Clear selection
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      className: "text-white",
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      style: { color: "white" },
                    }}
                    className="bg-gray-50 border border-gray-300 text-white text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                    placeholder={"Search Transaction Codes"}
                    required
                  />
                )}
                classes={{
                  endAdornment: "text-white",
                }}
                sx={{
                  "& .MuiAutocomplete-endAdornment": {
                    color: "white",
                  },
                }}
              />
            </div>

            {/* Sale Selection */}
            <div>
              <label className="block text-gray-700">Sale Type *</label>
              <select
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value={selectedSalesType}
                onChange={(e) => setSelectedSalesType(e.target.value)}
              >
                <option value="DIRECT SALES INVOICE">
                  DIRECT SALES INVOICE
                </option>
                <option value="DIRECT SALES RETURN">DIRECT SALES RETURN</option>
                <option value="DSALES NO INVOICE">DSALES NO INVOICE</option>
              </select>
            </div>

            {/* Select Return or Exchange */}
            {(selectedSalesType === "DIRECT SALES RETURN" ||
              selectedSalesType === "DSALES NO INVOICE") && (
              <div>
                <label className="block text-gray-700">
                  Sale Return Type *
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded border-gray-400"
                  value={selectedSalesReturnType}
                  onChange={(e) => setSelectedSalesReturnType(e.target.value)}
                >
                  <option value="DIRECT RETURN">DIRECT RETURN</option>
                  <option value="RETRUN WITH EXCHANGE">
                    RETURN WITH EXCHANGE
                  </option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-gray-700">Sales Locations *</label>
              <input
                className={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black"
                    : "w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black"
                }
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.SalesLocationCode || ""
                    : `${selectedLocation?.stockLocation} - ${selectedLocation?.showroom}`
                }
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700">Invoice #</label>
              <input
                type="text"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.InvoiceNo || ""
                    : invoiceNumber
                }
                className={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black"
                    : "w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black"
                }
                readOnly
              />
            </div>
          {/* </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"> */}
            <div>
              <label className="block text-gray-700">Search Customer</label>
              {selectedSalesType === "DIRECT SALES RETURN" || selectedSalesType === "DSALES NO INVOICE" ? (
                selectedSalesReturnType === "DIRECT RETURN" ? (
                  // Show the combo box for DIRECT RETURN
                  <Autocomplete
                    id="field1"
                    options={customerNameWithDirectInvoice}
                    getOptionLabel={(option) =>
                      option && option.CUST_CODE && option.CUST_NAME
                        ? `${option.CUST_CODE} - ${option.CUST_NAME}`
                        : ""
                    }
                    onChange={handleSearchCustomerNameWithDirectInvoice}
                    value={
                      customerNameWithDirectInvoice.find(
                        (option) =>
                          option?.CUST_CODE ===
                          selectedCustomeNameWithDirectInvoice?.CUST_CODE
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.CUST_CODE === value?.CUST_CODE
                    }
                    onInputChange={(event, value) => {
                      if (!value) {
                        setSelectedCustomeNameWithDirectInvoice(""); // Clear selection
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          className: "text-white",
                        }}
                        InputLabelProps={{
                          ...params.InputLabelProps,
                          style: { color: "white" },
                        }}
                        className="bg-gray-50 border border-gray-300 text-white text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                        placeholder={"Search Customer ID"}
                        required
                      />
                    )}
                    classes={{
                      endAdornment: "text-white",
                    }}
                    sx={{
                      "& .MuiAutocomplete-endAdornment": {
                        color: "white",
                      },
                    }}
                  />
                ) : (
                  // Show the combo box for RETURN WITH EXCHANGE
                  <Autocomplete
                    id="field1"
                    options={searchCustomerName}
                    getOptionLabel={(option) =>
                      option && option.CUSTOMERCODE && option.TXN_NAME
                        ? `${option.CUSTOMERCODE} - ${option.TXN_NAME}`
                        : ""
                    }
                    onChange={handleSearchCustomerName}
                    value={selectedCustomerName || null}
                    isOptionEqualToValue={(option, value) =>
                      option?.CUSTOMERCODE === value?.CUSTOMERCODE
                    }
                    onInputChange={(event, value) => {
                      if (!value) {
                        setSelectedCustomerName(""); // Clear selection when input is cleared
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          className: "text-white",
                        }}
                        InputLabelProps={{
                          ...params.InputLabelProps,
                          style: { color: "white" },
                        }}
                        className="bg-gray-50 border border-gray-300 text-white text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                        placeholder={"Search Customer ID"}
                        required
                      />
                    )}
                    classes={{
                      endAdornment: "text-white",
                    }}
                    sx={{
                      "& .MuiAutocomplete-endAdornment": {
                        color: "white",
                      },
                    }}
                  />
                )
              ) : (
                // otherwise in drect sales invoice
                <Autocomplete
                  id="field1"
                  options={customerNameWithDirectInvoice}
                  // getOptionLabel={(option) => option?.CUST_CODE || ""}
                  getOptionLabel={(option) =>
                    option && option.CUST_CODE && option.CUST_NAME
                      ? `${option.CUST_CODE} - ${option.CUST_NAME}`
                      : ""
                  }
                  onChange={handleSearchCustomerNameWithDirectInvoice}
                  value={
                    customerNameWithDirectInvoice.find(
                      (option) =>
                        option?.CUST_CODE ===
                        selectedCustomeNameWithDirectInvoice?.CUST_CODE
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option?.CUST_CODE === value?.CUST_CODE
                  }
                  onInputChange={(event, value) => {
                    if (!value) {
                      setSelectedCustomeNameWithDirectInvoice(""); // Clear selection
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        className: "text-white",
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        style: { color: "white" },
                      }}
                      className="bg-gray-50 border border-gray-300 text-white text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                      placeholder={"Search Customer ID"}
                      required
                    />
                  )}
                  classes={{
                    endAdornment: "text-white",
                  }}
                  sx={{
                    "& .MuiAutocomplete-endAdornment": {
                      color: "white",
                    },
                  }}
                />
              )}
            </div>
            <div>
              <label className="block text-gray-700">Delivery *</label>
              <input
                type="text"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.DeliveryLocationCode ||
                      ""
                    : `${selectedLocation?.stockLocation} - ${selectedLocation?.showroom}`
                }
                className={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black"
                    : "w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black"
                }
                readOnly={selectedSalesType === "DIRECT SALES RETURN"} // Disable if Sales Return
              />
            </div>
            <div>
              <label className="block text-gray-700">Customer Name*</label>
              <input
                type="text"
                onChange={(e) => setCustomerName(e.target.value)}
                className={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black"
                    : "w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                }
                placeholder="Walk-in customer"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.CustomerName || ""
                    : customerName
                }
                readOnly={selectedSalesType === "DIRECT SALES RETURN"} // Disable if Sales Return
              />
            </div>
            <div className="flex items-center">
              <div
                className={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "w-full"
                    : "w-full -mt-3"
                }
              >
                <label className="block text-gray-700">Mobile *</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                  placeholder="Mobile"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                />
              </div>
              {selectedSalesType === "DIRECT SALES RETURN" && (
                <button
                  onClick={handleShowMobileNumberPopup}
                  className="ml-2 p-2 mt-7 border rounded bg-secondary hover:bg-primary text-white flex items-center justify-center"
                >
                  <IoBarcodeSharp size={20} />
                </button>
              )}
            </div>
            {selectedSalesType === "DIRECT SALES INVOICE" ? (
              <form onSubmit={handleGetBarcodes} className="flex items-center">
                <div className="w-full">
                  <label className="block text-gray-700">Scan Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    required
                    className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                    placeholder="Enter Barcode"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 p-2 mt-7 border rounded bg-secondary hover:bg-primary text-white flex items-center justify-center"
                >
                  <IoBarcodeSharp size={20} />
                </button>
              </form>
            ) : selectedSalesType === "DSALES NO INVOICE" ? (
              <form
                onSubmit={handleGetNoInvoiceBarcodes}
                className="flex items-center"
              >
                <div className="w-full">
                  <label className="block text-gray-700">
                    Scan Barcode (No Invoice)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    required
                    className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                    placeholder="Enter Barcode (No Invoice)"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 p-2 mt-7 border rounded bg-secondary hover:bg-primary text-white flex items-center justify-center"
                >
                  <IoBarcodeSharp size={20} />
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSearchInvoice}
                className="flex items-center"
              >
                <div className="w-full">
                  <label className="block text-gray-700">Scan Invoice</label>
                  <input
                    type="text"
                    value={searchInvoiceNumber}
                    onChange={(e) => setSearchInvoiceNumber(e.target.value)}
                    required
                    placeholder="Enter Invoice Number"
                    className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 p-2 mt-7 border rounded bg-secondary hover:bg-primary text-white flex items-center justify-center"
                >
                  <IoBarcodeSharp size={20} />
                </button>
              </form>
            )}

            <div>
              <label className="block text-gray-700">Remarks *</label>
              <input
                type="text"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.Remarks || ""
                    : remarks
                }
                className={`w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black ${
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200"
                    : "bg-green-200"
                }`}
                placeholder="Remarks"
                disabled={selectedSalesType === "DIRECT SALES RETURN"}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">VAT #</label>
              <input
                type="text"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.VatNumber || ""
                    : vat
                }
                className={`w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black ${
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? "bg-gray-200"
                    : "bg-green-200"
                }`}
                disabled={selectedSalesType === "DIRECT SALES RETURN"}
                placeholder="VAT"
                onChange={(e) => setVat(e.target.value)}
              />
            </div>
          </div>
          {selectedSalesType === "DIRECT SALES INVOICE" && (
            <div className="mt-10 overflow-x-auto">
              <table className="table-auto w-full">
                <thead className="bg-secondary text-white truncate">
                  <tr>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Barcode</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Item Size</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Item Price</th>
                    <th className="px-4 py-2">VAT (15%)</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <div className="flex justify-center items-center w-full h-full">
                        <CircularProgress size={24} color="inherit" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="bg-gray-100">
                        <td className="border px-4 py-2">{row.SKU}</td>
                        <td className="border px-4 py-2">{row.Barcode}</td>
                        <td className="border px-4 py-2">{row.Description}</td>
                        <td className="border px-4 py-2">{row.ItemSize}</td>
                        <td className="border px-4 py-2">{row.Qty}</td>
                        <td className="border px-4 py-2">{row.ItemPrice}</td>
                        <td className="border px-4 py-2">{row.VAT}</td>
                        <td className="border px-4 py-2">{row.Total}</td>
                        <td className="border px-4 py-2 text-center">
                          <button onClick={() => handleDelete(index)}>
                            <MdRemoveCircle className="text-secondary text-xl hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              <div className="flex justify-end">
                <div className="bg-white p-4 rounded shadow-md w-[50%]">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Net Without VAT:
                      </label>
                      <input
                        type="text"
                        value={netWithVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total VAT:
                      </label>
                      <input
                        type="text"
                        value={totalVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total Amount With VAT:
                      </label>
                      <input
                        type="text"
                        value={totalAmountWithVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSalesType === "DIRECT SALES RETURN" && (
            <div>
              <table className="table-auto w-full text-center">
                <thead className="bg-secondary text-white truncate">
                  <tr>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Invoice No</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Item Size</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Item Price</th>
                    <th className="px-4 py-2">VAT (15%)</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                {invoiceDataLoader ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <div className="flex justify-center items-center w-full h-full">
                        <CircularProgress size={24} color="inherit" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tbody>
                    {invoiceData.map((row, index) => (
                      <tr key={index} className="bg-gray-100">
                        <td className="border px-4 py-2">{row.SKU}</td>
                        <td className="border px-4 py-2">{row.Barcode}</td>
                        <td className="border px-4 py-2">{row.Description}</td>
                        <td className="border px-4 py-2">{row.ItemSize}</td>
                        {/* <td className="border px-4 py-2">{row.Qty}</td> */}
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            max={row.originalQty}
                            value={row.Qty}
                            onChange={(e) => handleQtyChange(index, e.target.value)}
                            className="w-full text-center border rounded p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">{row.ItemPrice}</td>
                        <td className="border px-4 py-2">{row.VAT}</td>
                        <td className="border px-4 py-2">{row.Total}</td>
                        <td className="border px-4 py-2 text-center relative">
                          <button
                            onClick={() => handleActionClick(index)}
                            className="bg-blue-700 text-white px-4 py-2 rounded-md font-bold transform hover:scale-95"
                          >
                            Actions
                          </button>
                          {openDropdown === index && (
                            <div className="absolute bg-white shadow-md border mt-2 rounded w-40 z-10 right-0">
                              <ul className="list-none p-0 m-0">
                                <li
                                  onClick={() => handleItemClick("exchange")}
                                  className="hover:bg-gray-100 cursor-pointer px-4 py-2 flex items-center truncate"
                                >
                                  <FaExchangeAlt className="text-secondary mr-2" />
                                  Exchange Item
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleDeleteInvoiceData(index)}
                                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                                  >
                                    <MdRemoveCircle className="text-secondary mr-2" />
                                    Remove
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
              {/* Total show without exchange */}
              <div className="flex justify-end">
                <div className="bg-white p-4 rounded shadow-md w-[50%]">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Net Without VAT:
                      </label>
                      <input
                        type="text"
                        value={netWithOutVatExchange}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total VAT:
                      </label>
                      <input
                        type="text"
                        value={totalWithOutExchange}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total Amount With VAT:
                      </label>
                      <input
                        type="text"
                        value={totolAmountWithoutExchange}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* exchenage datagrid */}
          {exchangeData.length > 0 && (
            <div className="mt-10">
              <button className="px-3 py-2 bg-gray-300 font-sans font-semibold rounded-t-md">
                Exchange Items
              </button>
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="bg-secondary text-white truncate">
                    <tr>
                      <th className="px-4 py-2">SKU</th>
                      <th className="px-4 py-2">Barcode</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Item Size</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Item Price</th>
                      <th className="px-4 py-2">VAT (15%)</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchangeData?.map((item, index) => (
                      <tr key={index} className="bg-gray-100">
                        <td className="border px-4 py-2">
                          {/* {item.ItemCode || ""} */}
                          {item.SKU || ""}
                        </td>
                        {/* <td className="border px-4 py-2">{item.GTIN}</td> */}
                        <td className="border px-4 py-2">{item.Barcode}</td>
                        <td className="border px-4 py-2">{item.Description}</td>
                        <td className="border px-4 py-2">{item.ItemSize}</td>
                        <td className="border px-4 py-2">{item?.Qty}</td>
                        <td className="border px-4 py-2">{item.ItemPrice}</td>
                        <td className="border px-4 py-2">{item.VAT}</td>
                        <td className="border px-4 py-2">{item.Total}</td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => handleDeleteExchangeData(index)}
                          >
                            <MdRemoveCircle className="text-secondary text-xl hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end items-center">
                <div className="bg-white p-4 rounded shadow-md w-[50%]">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Net Without VAT:
                      </label>
                      <input
                        type="text"
                        value={netWithVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total VAT:
                      </label>
                      <input
                        type="text"
                        value={totalVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-gray-700 font-bold">
                        Total Amount With VAT:
                      </label>
                      <input
                        type="text"
                        value={totalAmountWithVat}
                        readOnly
                        className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DSALES NO INVOICE */}
          {selectedSalesType === "DSALES NO INVOICE" && (
            <>
              <div className="mt-10">
                <table className="table-auto w-full">
                  <thead className="bg-secondary text-white truncate">
                    <tr>
                      <th className="px-4 py-2">SKU</th>
                      <th className="px-4 py-2">Barcode</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Item Size</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Item Price</th>
                      <th className="px-4 py-2">VAT (15%)</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  {isLoading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div className="flex justify-center items-center w-full h-full">
                          <CircularProgress size={24} color="inherit" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tbody>
                      {DSalesNoInvoiceData.map((row, index) => (
                        <tr key={index} className="bg-gray-100">
                          <td className="border px-4 py-2">{row.SKU}</td>
                          <td className="border px-4 py-2">{row.Barcode}</td>
                          <td className="border px-4 py-2">
                            {row.Description}
                          </td>
                          <td className="border px-4 py-2">{row.ItemSize}</td>
                          <td className="border px-4 py-2">{row.Qty}</td>
                          <td className="border px-4 py-2">{row.ItemPrice}</td>
                          <td className="border px-4 py-2">{row.VAT}</td>
                          <td className="border px-4 py-2">{row.Total}</td>
                          <td className="border px-4 py-2 text-center relative">
                            <button
                              onClick={() => handleActionClick(index)}
                              className="bg-blue-700 text-white px-4 py-2 rounded-md font-bold transform hover:scale-95"
                            >
                              Actions
                            </button>
                            {openDropdown === index && (
                            <div className="absolute bg-white shadow-md border mt-2 rounded w-44 z-10 right-0">
                              <ul className="list-none p-0 m-0">
                                <li
                                  onClick={() => handleItemClick("exchange Dsales")}
                                  className="hover:bg-gray-100 cursor-pointer px-4 py-2 flex items-center truncate"
                                >
                                  <FaExchangeAlt className="text-secondary mr-2" />
                                  Exchange DSales
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleDelete(index)}
                                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                                  >
                                    <MdRemoveCircle className="text-secondary mr-2" />
                                    Remove
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                <div className="flex justify-end items-center">
                  <div className="bg-white p-4 rounded shadow-md w-[50%]">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-gray-700 font-bold">
                          Net Without VAT:
                        </label>
                        <input
                          type="text"
                          value={netWithOutVatDSalesNoInvoice}
                          readOnly
                          className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="block text-gray-700 font-bold">
                          Total VAT:
                        </label>
                        <input
                          type="text"
                          value={totalWithOutVatDSalesNoInvoice}
                          readOnly
                          className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <label className="block text-gray-700 font-bold">
                          Total Amount With VAT:
                        </label>
                        <input
                          type="text"
                          value={totolAmountWithoutVatDSalesNoInvoice}
                          readOnly
                          className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* DSALES Exchange data grid */}
              {dSalesNoInvoiceexchangeData.length > 0 && (
                <div className="mt-10">
                  <button className="px-3 py-2 bg-gray-300 font-sans font-semibold rounded-t-md">
                    Exchange Item DSales No Invoice
                  </button>
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                      <thead className="bg-secondary text-white truncate">
                        <tr>
                          <th className="px-4 py-2">SKU</th>
                          <th className="px-4 py-2">Barcode</th>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Item Size</th>
                          <th className="px-4 py-2">Qty</th>
                          <th className="px-4 py-2">Item Price</th>
                          <th className="px-4 py-2">VAT (15%)</th>
                          <th className="px-4 py-2">Total</th>
                          <th className="px-4 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dSalesNoInvoiceexchangeData?.map((item, index) => (
                          <tr key={index} className="bg-gray-100">
                            <td className="border px-4 py-2">
                              {/* {item.ItemCode || ""} */}
                              {item.SKU || ""}
                            </td>
                            {/* <td className="border px-4 py-2">{item.GTIN}</td> */}
                            <td className="border px-4 py-2">{item.Barcode}</td>
                            <td className="border px-4 py-2">
                              {item.Description}
                            </td>
                            <td className="border px-4 py-2">
                              {item.ItemSize}
                            </td>
                            <td className="border px-4 py-2">{item?.Qty}</td>
                            <td className="border px-4 py-2">
                              {item.ItemPrice}
                            </td>
                            <td className="border px-4 py-2">{item.VAT}</td>
                            <td className="border px-4 py-2">{item.Total}</td>
                            <td className="border px-4 py-2 text-center">
                              <button>
                                <MdRemoveCircle className="text-secondary hover:text-red-500" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end items-center">
                    <div className="bg-white p-4 rounded shadow-md w-[50%]">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-gray-700 font-bold">
                            Net Without VAT:
                          </label>
                          <input
                            type="text"
                            value={netWithVat}
                            readOnly
                            className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="block text-gray-700 font-bold">
                            Total VAT:
                          </label>
                          <input
                            type="text"
                            value={totalVat}
                            readOnly
                            className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="block text-gray-700 font-bold">
                            Total Amount With VAT:
                          </label>
                          <input
                            type="text"
                            value={totalAmountWithVat}
                            readOnly
                            className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded mb-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                <button
                  onClick={handleShowConfirmTransactionPopup}
                  className={`bg-blue-500 text-white py-4 px-4 rounded transform hover:scale-90 hover:cursor-pointer ${
                    isConfirmDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500"
                  }`}
                  disabled={isConfirmDisabled}
                >
                  Confirm Transactions
                </button>
                <button
                  onClick={handleShowCreatePopup}
                  className={`${
                    isTenderCashEnabled
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white py-4 px-4 rounded transform hover:scale-90 hover:cursor-pointer`}
                  disabled={!isTenderCashEnabled}
                >
                  F3 - Tender Cash
                </button>
              </div>
            </div>
          </div>

          {isCreatePopupVisible && (
            <F3TenderCashPopUp
              isVisible={isCreatePopupVisible}
              setVisibility={setCreatePopupVisibility}
              storeDatagridData={storeDatagridData}
              storeInvoiceDatagridData={storeInvoiceDatagridData}
              showOtpPopup={handleShowOtpPopup}
              handleClearData={handleClearData}
              // handleClearInvoiceData={handleClearInvoiceData}
              selectedSalesType={selectedSalesType}
              handleInvoiceGenerator={handleInvoiceGenerator}
              handleZatcaInvoiceGenerator={handleZatcaInvoiceGenerator}
              // pass in props netwithoutvat amount
              netWithVat={netWithVat}
              totalAmountWithVat={totalAmountWithVat}
              // invoice state without Exchange
              netWithOutVatExchange={netWithOutVatExchange}
              totolAmountWithoutExchange={totolAmountWithoutExchange}
              // state for Dsales No Invoice
              netWithOutVatDSalesNoInvoice={netWithOutVatDSalesNoInvoice}
              totolAmountWithoutVatDSalesNoInvoice={
                totolAmountWithoutVatDSalesNoInvoice
              }
              // insert the data in our pos history
              insertInvoiceRecord={insertInvoiceRecord}
              invoiceHeaderData={invoiceHeaderData?.invoiceHeader}
              mobileNo={mobileNo}
              customerName={customerName}
              remarks={remarks}
              selectedCustomerCode={selectedCustomerName}
              selectedCustomeNameWithDirectInvoice={
                selectedCustomeNameWithDirectInvoice
              }
              selectedTransactionCode={selectedTransactionCode}
              invoiceNumber={invoiceNumber}
              isExchangeClick={isExchangeClick}
              selectedRowData={selectedRowData}
              exchangeData={exchangeData}
              isExchangeDSalesClick={isExchangeDSalesClick}
              DSalesNoInvoiceData={DSalesNoInvoiceData}
              dSalesNoInvoiceexchangeData={dSalesNoInvoiceexchangeData}
              // save the documents no
              setDirectSalesInvoiceDocumentNo={setDirectSalesInvoiceDocumentNo}
              setDirectSalesReturnDocumentNo={setDirectSalesReturnDocumentNo}
              setDSalesNoInvoice={setDSalesNoInvoice}
              handleDocumentNoUpdate={handleDocumentNoUpdate}

              // return sales type
              selectedSalesReturnType={selectedSalesReturnType}
              // search invoice number 
              searchInvoiceNumber={searchInvoiceNumber}
            />
          )}

          {isOpenOtpPopupVisible && (
            <F3ResponsePopUp
              isVisible={isOpenOtpPopupVisible}
              setVisibility={setIsOpenOtpPopupVisible}
              apiResponse={apiResponse}
              handlePrintSalesInvoice={() => {
                handlePrintSalesInvoice(zatcaQrcode);
              }}
              handlePrintExchangeInvoice={() => {
                handlePrintExchangeInvoice(zatchaQrcodeExchange);
              }}
              selectedSalesType={selectedSalesType}
              isExchangeClick={isExchangeClick}
              isExchangeDSalesClick={isExchangeDSalesClick}
            />
          )}

          {isExchangeItemPopupVisible && (
            <ExchangeItemPopUp
              isVisible={isExchangeItemPopupVisible}
              setVisibility={setIsExchangeItemPopupVisible}
              addExchangeData={addExchangeData}
              selectedRowData={selectedRowData}
              invoiceHeaderData={
                invoiceHeaderData?.invoiceHeader?.SalesLocationCode
              }
              dsalesLocationCode={selectedLocation?.stockLocation}
              selectedSalesType={selectedSalesType}
              addDSalesExchangeData={addDSalesExchangeData}
              selectedCustomerName={selectedCustomerName}
              // return sales type
              selectedSalesReturnType={selectedSalesReturnType}
              selectedCustomeNameWithDirectInvoice={
                selectedCustomeNameWithDirectInvoice
              }
            />
          )}

          {isConfirmTransactionPopupVisible && (
            <ConfirmTransactionPopUp
              isVisible={isConfirmTransactionPopupVisible}
              setVisibility={setIsConfirmTransactionPopupVisible}
              onSelectionsSaved={handleSelectionsSaved}
            />
          )}

          {isMobileNumberPopupVisible && (
            <MobileNumberPopUp
              isVisible={isMobileNumberPopupVisible}
              setVisibility={setIsMobileNumberPopupVisible}
              mobileNo={mobileNo}
              onSelectInvoice={handleGetInvoiceDetails}
            />
          )}
        </div>
      </div>

      {/* What QR Code PopUp */}
      {showPopup && <QRCodePopup qrCode={qrCode} onClose={handleClosePopup} />}
    </SideNav>
  );
};

export default POS;
