import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import F3TenderCashPopUp from "./F3TenderCashPopUp";
import F3ResponsePopUp from "./F3ResponsePopUp";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import sliclogo from "../../../Images/sliclogo.png";
import QRCode from "qrcode";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import { Autocomplete, TextField } from "@mui/material";
import ExchangeItemPopUp from "./ExchangeItemPopUp";
import ConfirmTransactionPopUp from "./ConfirmTransactionPopUp";

const POS = () => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSalesType, setSelectedSalesType] = useState(
    "DIRECT SALES INVOICE"
  );
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const handleActionClick = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
    setSelectedRowData(invoiceData[index]); // Save the selected row data
  };


  const handleItemClick = (action) => {
    setOpenDropdown(null);
    if (action === "exchange") {
      handleShowExhangeItemPopup(selectedRowData);
    } else if (action === "return") {
    }
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
    }
  }, []);

  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
  const [totalAmountWithVat, setTotalAmountWithVat] = useState(0); // To store total amount with VAT

  // Fetch barcode data from API
  const handleGetBarcodes = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/itemCodes/v2/searchByGTIN?GTIN=${barcode}`
      );
      const data = response?.data?.data;

      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName } = data;

        // call the second api later in their
        const secondApiBody = {
          filter: {
            P_COMP_CODE: "SLIC",
            P_ITEM_CODE: ItemCode,
            P_CUST_CODE: "CL100948",
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

  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const [storeDatagridData, setStoreDatagridData] = useState([]);
  const handleShowCreatePopup = () => {
    // if (!isCreatePopupVisible) {
    // if (!data || data.length === 0) {
    //   toast.warning(
    //     "The datagrid is empty. Please ensure data is available before proceeding."
    //   );
    // } else {
      setStoreDatagridData([...data]);
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

  const [isConfirmTransactionPopupVisible, setIsConfirmTransactionPopupVisible] =
    useState(false);
  const handleShowConfirmTransactionPopup = () => {
    setIsConfirmTransactionPopupVisible(true);
  };

  const handleClearData = () => {
    setData([]);
  };

  // transaction Codes Api
  const [transactionCodes, setTransactionCodes] = useState([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState("");
  const fetchTransactionCodes = async () => {
    try {
      const response = await newRequest.get(
        `/transactions/v1/byLocationCode?locationCode=${selectedLocation?.LOCN_CODE}`
      );
      // console.log(response.data?.data);
      setTransactionCodes(response.data?.data);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  const handleTransactionCodes = (event, value) => {
    setSelectedTransactionCode(value ? value : "");
  };

  useEffect(() => {
    if (selectedLocation?.LOCN_CODE) {
      fetchTransactionCodes();
    }
  }, [selectedLocation]);

  // fetch All Customer Names api
  const [searchCustomerName, setSearchCustomerName] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const fetchCustomerNames = async () => {
    try {
      const response = await newRequest.get("/customerNames/v1/all");
      // console.log(response.data);
      setSearchCustomerName(response?.data?.data);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  const handleSearchCustomerName = (event, value) => {
    // console.log(value);
    setSelectedCustomerName(value);
  };

  useEffect(() => {
    // fetchTransactionCodes();
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
    return `INV-${timestamp}`; // Or simply `timestamp` if you prefer it as a pure numeric value
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

  // Invoice generation api
  const [netWithVat, setNetWithVat] = useState("");
  const [totalVat, setTotalVat] = useState("");
  const [invoiceLoader, setInvoiceLoader] = useState(false);

  const handleInvoiceGenerator = async (e) => {
    // e.preventDefault();

    if (data.length === 0) {
      toast.error(
        "Please ensure barcode and data is available before proceeding."
      );
      return;
    }
    setInvoiceLoader(true);
    try {
      const res = await newRequest.post("/zatca/generateZatcaQRCode", {
        invoiceDate: todayDate,
        totalWithVat: totalAmountWithVat,
        vatTotal: Number(totalVat),
      });
      // console.log('invoice', res?.data);

      const qrCodeDataFromApi = res?.data?.qrCodeData;
      handlePrintSalesInvoice(qrCodeDataFromApi);

      setNetWithVat("");
      setTotalVat("");
      toast.success("Invoice generated successfully!");
      setInvoiceLoader(false);
    } catch (err) {
      // console.log(err);
      toast.error(
        err?.response?.data?.errors[0] ||
          "An error occurred while generating the invoice"
      );
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

    calculateTotals();
  }, [data]);

  // invoice generate
  const handlePrintSalesInvoice = async (qrCodeData) => {
    const newInvoiceNumber = generateInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);
    const printWindow = window.open("", "Print Window", "height=800,width=800");

    // Generate QR code data URL
    const qrCodeDataURL = await QRCode.toDataURL(`${invoiceNumber}`);
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

          <div class="sales-invoice-title">Sales Invoice</div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>${
              // selectedCustomerName?.CUST_NAME
              customerName
            }</div>
            <div><span class="field-label">VAT#: </span>${netWithVat}</div>
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
              ${data
                .map(
                  (item) => `
                <tr>
                  <td>${item.SKU}</td>
                  <td>${item.Qty}</td>
                  <td>${item.ItemPrice}</td>
                  <td>${item.ItemPrice * item.Qty}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total-section">
            <div class="left-side">
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

      // console.log(qrCodeData);
    };
  };

  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [invoiceHeaderData, setInvoiceHeaderData] = useState([]);
  const [invoiceDataLoader, setInvoiceDataLoader] = useState("");
  // Fetch invoice details when searching by invoice number for a sales return
  const handleGetInvoiceDetails = async (e) => {
    e.preventDefault();
    setInvoiceDataLoader(true);

    try {
      const response = await newRequest.get(
        `/invoice/v1/headers-and-line-items?InvoiceNo=${searchInvoiceNumber}`
      );
      const data = response?.data?.data;
      setInvoiceHeaderData(data);
      console.log(data)
      if (data) {
        const invoiceDetails = data.invoiceDetails;

        setInvoiceData(
          invoiceDetails.map((item) => {
            const vat = item.ItemPrice * 0.15;
            const total = item.ItemPrice + vat;
            return {
              SKU: item.ItemSKU,
              Barcode: item.InvoiceNo, // Assuming InvoiceNo acts as the barcode in this case
              Description: item.Remarks || "No description",
              ItemSize: item.ItemSize,
              Qty: item?.ItemQry,
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


  const [exchangeData, setExchangeData] = useState([]);
  const addExchangeData = async (newData) => {
    console.log(exchangeData);
    // Extract necessary data from newData
    const { ItemCode, ItemSize } = newData;

    // Get the corresponding invoice item to extract the Qty
    console.log(invoiceData[0]?.Qty);
    const Qty = invoiceData[0]?.Qty;
    // const Qty = 1;

    const secondApiBody = {
      filter: {
        P_COMP_CODE: "SLIC",
        P_ITEM_CODE: ItemCode,
        P_CUST_CODE: "CL100948",
        P_GRADE_CODE_1: ItemSize,
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

      if (secondApiResponse?.data) {
        const secondApiData = secondApiResponse.data;
        console.log("second Exhcnage", secondApiData);
        const itemRates = secondApiData.map(
          (item) => item?.PRICELIST?.PLI_RATE
        );
        const itemPrice = itemRates.reduce((sum, rate) => sum + rate, 0); // Sum of all item prices
        const vat = itemPrice * 0.15;
        const total = itemPrice * Qty + vat; // Multiply by Qty for the total

        // Insert the new item into exchangeData only if the API call is successful
        const newExchangeItem = {
          ...newData,
          ItemPrice: itemPrice,
          VAT: vat,
          Total: total,
          Qty: Qty, 
        };

        setExchangeData((prevData) => [...prevData, newExchangeItem]); // Add the new item to exchangeData
      } else {
        throw new Error("Failed to retrieve item prices");
      }
    } catch (error) {
      console.error("Error fetching item prices:", error);
      toast.error("Error fetching item prices");
    }
  };

  useEffect(() => {
    const calculateTotals = () => {
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

    calculateTotals();
  }, [exchangeData]);


  const [isTenderCashEnabled, setIsTenderCashEnabled] = useState(false);
  const handleSelectionsSaved = () => {
    setIsTenderCashEnabled(true); // Enable the Tender Cash button
  };

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
              Cashier : {selectedLocation?.LOCN_NAME}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="transactionId" className="block text-gray-700">
                Transactions Codes *
              </label>
              {selectedSalesType === "DIRECT SALES RETURN" ? (
                <input
                  id="transactionId"
                  className="w-full mt-1 p-2 border rounded bg-gray-200 border-gray-400"
                  value={invoiceHeaderData?.invoiceHeader?.TransactionCode || ""}
                  readOnly
                  required
                />
              ) : (
                <Autocomplete
                  id="transactionId"
                  options={transactionCodes}
                  getOptionLabel={(option) => option.TXN_CODE || ""}
                  onChange={handleTransactionCodes}
                  value={
                    transactionCodes.find(
                      (option) => option.TXN_CODE === selectedTransactionCode?.TXN_CODE
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
              )}
            </div>
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
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Sales Locations *</label>
              <input
                className={selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black' : 'w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black'}
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.SalesLocationCode || ""
                    : selectedLocation?.LOCN_NAME
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
                className={selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black' : 'w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black'}                   
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Search Customer</label>
                {selectedSalesType === "DIRECT SALES RETURN" ? (
                  <input
                    id="field1"
                    className={selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black' : 'w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black'}
                    value={invoiceHeaderData?.invoiceHeader?.CustomerCode || ""}
                    readOnly
                    required
                  />
                ) : (
                  <Autocomplete
                    id="field1"
                    options={searchCustomerName}
                    getOptionLabel={(option) => option?.CUST_CODE || ""}
                    onChange={handleSearchCustomerName}
                    value={
                      searchCustomerName.find(
                        (option) =>
                          option?.CUST_CODE === selectedCustomerName?.CUST_CODE
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.CUST_CODE === value?.CUST_CODE
                    }
                    onInputChange={(event, value) => {
                      if (!value) {
                        setSelectedCustomerName(""); // Clear selection
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
                    : selectedLocation?.LOCN_NAME || ""
                }
                className={selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black' : 'w-full mt-1 p-2 border rounded border-gray-400 bg-white placeholder:text-black'}
                readOnly={selectedSalesType === "DIRECT SALES RETURN"} // Disable if Sales Return
              />
            </div>
            <div>
              <label className="block text-gray-700">Customer Name*</label>
              <input
                type="text"
                onChange={(e) => setCustomerName(e.target.value)}
                className={selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200 w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black' : 'w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black'}
                placeholder="Walk-in customer"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceHeaderData?.invoiceHeader?.CustomerCode || ""
                    : customerName
                }
                readOnly={selectedSalesType === "DIRECT SALES RETURN"} // Disable if Sales Return
              />
            </div>
            <div>
              <label className="block text-gray-700">Mobile *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Mobile"
              />
            </div>
            {selectedSalesType === "DIRECT SALES INVOICE" ? (
              <form onSubmit={handleGetBarcodes} className="flex items-center">
                <div className="w-full">
                  <label className="block text-gray-700">Scan Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
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
            ) : (
              <form
                onSubmit={handleGetInvoiceDetails}
                className="flex items-center"
              >
                <div className="w-full">
                  <label className="block text-gray-700">Scan Invoice</label>
                  <input
                    type="text"
                    value={searchInvoiceNumber}
                    onChange={(e) => setSearchInvoiceNumber(e.target.value)}
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
                    : ""
                }
                className={`w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black ${selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200' : 'bg-green-200'}`}
                placeholder="Remarks"
                disabled={selectedSalesType === "DIRECT SALES RETURN"}
              />
            </div>
            <div>
              <label className="block text-gray-700">Type *</label>
              <select
                className={`w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black ${selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200' : 'bg-green-200'}`}
                disabled={selectedSalesType === "DIRECT SALES RETURN"}
              >
                <option>Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">VAT #</label>
              <input
                type="text"
                value={
                  selectedSalesType === "DIRECT SALES RETURN"
                    ? invoiceData?.VAT || ""
                    : ""
                }
                className={`w-full mt-1 p-2 border rounded border-gray-400 placeholder:text-black ${selectedSalesType === "DIRECT SALES RETURN" ? 'bg-gray-200' : 'bg-green-200'}`}
                disabled={selectedSalesType === "DIRECT SALES RETURN"}
                placeholder="VAT"
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
                    {/* <th className="px-4 py-2">Action</th> */}
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
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
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
                        <td className="border px-4 py-2">{row.Qty}</td>
                        <td className="border px-4 py-2">{row.ItemPrice}</td>
                        <td className="border px-4 py-2">{row.VAT}</td>
                        <td className="border px-4 py-2">{row.Total}</td>
                        <td className="border px-4 py-2 text-center relative">
                          <button
                            onClick={() => handleActionClick(index)}
                            className="bg-blue-500 text-white px-4 py-2 font-bold transform hover:scale-95"
                          >
                            Actions
                          </button>
                          {openDropdown === index && (
                            <div className="absolute bg-white shadow-md border mt-2 rounded w-40 z-10">
                              <ul>
                                <li
                                  onClick={() => handleItemClick("exchange")}
                                  className="hover:bg-gray-100 cursor-pointer px-4 py-2"
                                >
                                  Exchange Item
                                </li>
                                <li
                                  onClick={() => handleItemClick("return")}
                                  className="hover:bg-gray-100 cursor-pointer px-4 py-2"
                                >
                                  Return
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
                    </tr>
                  </thead>
                  <tbody>
                    {exchangeData?.map((item, index) => (
                      <tr key={index} className="bg-gray-100">
                        <td className="border px-4 py-2">
                          {item.ItemCode || ""}
                        </td>
                        <td className="border px-4 py-2">{item.GTIN}</td>
                        <td className="border px-4 py-2">{item.Description}</td>
                        <td className="border px-4 py-2">{item.ItemSize}</td>
                        <td className="border px-4 py-2">{item?.Qty}</td>
                        <td className="border px-4 py-2">{item.ItemPrice}</td>
                        <td className="border px-4 py-2">{item.VAT}</td>
                        <td className="border px-4 py-2">{item.Total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded mb-4">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                <button
                  onClick={handleShowConfirmTransactionPopup}
                  className="bg-blue-500 text-white py-4 px-4 rounded transform hover:scale-90 hover:cursor-pointer"
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
            <div>
              <div className="bg-white p-4 rounded shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Net With VAT:
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

          {isCreatePopupVisible && (
            <F3TenderCashPopUp
              isVisible={isCreatePopupVisible}
              setVisibility={setCreatePopupVisibility}
              storeDatagridData={storeDatagridData}
              showOtpPopup={handleShowOtpPopup}
              handleClearData={handleClearData}
              selectedSalesType={selectedSalesType}
              handleInvoiceGenerator={handleInvoiceGenerator}
              totalAmountWithVat={totalAmountWithVat}
              invoiceHeaderData={invoiceHeaderData?.invoiceHeader}
            />
          )}

          {isOpenOtpPopupVisible && (
            <F3ResponsePopUp
              isVisible={isOpenOtpPopupVisible}
              setVisibility={setIsOpenOtpPopupVisible}
              apiResponse={apiResponse}
            />
          )}

          {isExchangeItemPopupVisible && (
            <ExchangeItemPopUp
              isVisible={isExchangeItemPopupVisible}
              setVisibility={setIsExchangeItemPopupVisible}
              addExchangeData={addExchangeData}
              selectedRowData={selectedRowData}
            />
          )}

          {isConfirmTransactionPopupVisible && (
            <ConfirmTransactionPopUp
              isVisible={isConfirmTransactionPopupVisible}
              setVisibility={setIsConfirmTransactionPopupVisible}
              onSelectionsSaved={handleSelectionsSaved}
            />
          )}
        </div>
      </div>
    </SideNav>
  );
};

export default POS;
