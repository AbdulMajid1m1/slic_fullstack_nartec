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
import { encode } from "js-base64";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import { Autocomplete, TextField } from "@mui/material";

const POS = () => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSalesType, setSelectedSalesType] = useState(
    "DIRECT SALES INVOICE"
  );

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

  // const handleGetBarcodes = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await newRequest.get(
  //       `/itemCodes/v2/searchByGTIN?GTIN=${barcode}`
  //     );
  //     const data = response?.data?.data;
  //     console.log(data);

  //     if (data) {
  //       const { ItemCode, ProductSize, GTIN, EnglishName } = data;

  //       const secondApiBody = {
  //         filter: {
  //           P_COMP_CODE: "SLIC",
  //           P_CUST_CODE: "CL100729",
  //           "P_ITEM_CODE": ItemCode,
  //           P_ITEM_CODE: "45",
  //           P_GRADE_CODE_1: ProductSize,
  //         },
  //         M_COMP_CODE: "001",
  //         M_USER_ID: "SYSADMIN",
  //         APICODE: "ItemRate",
  //         M_LANG_CODE: "ENG",
  //       };

  //       try {
  //         const secondApiResponse = await ErpTeamRequest.post(
  //           "/slicuat05api/v1/getApi",
  //           secondApiBody,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );
  //         const secondApiData = secondApiResponse?.data;

  //         let storedData = sessionStorage.getItem("secondApiResponses");
  //         storedData = storedData ? JSON.parse(storedData) : {};

  //         storedData[ItemCode] = secondApiData;

  //         sessionStorage.setItem(
  //           "secondApiResponses",
  //           JSON.stringify(storedData)
  //         );

  //         const itemPrice = secondApiData[0].ItemRate?.RATE;
  //         const vat = itemPrice * 0.15;
  //         const total = itemPrice + vat;
  //         // console.log(itemPrice)

  //         setData((prevData) => {
  //           const existingRecordIndex = prevData.findIndex(
  //             (record) => record.Barcode === GTIN
  //           );

  //           if (existingRecordIndex !== -1) {
  //             const updatedData = [...prevData];
  //             updatedData[existingRecordIndex].Qty += 1;
  //             updatedData[existingRecordIndex].Total =
  //               updatedData[existingRecordIndex].Qty * itemPrice +
  //               updatedData[existingRecordIndex].Qty * vat;
  //             return updatedData;
  //           } else {
  //             return [
  //               ...prevData,
  //               {
  //                 SKU: ItemCode,
  //                 Barcode: GTIN,
  //                 Description: EnglishName,
  //                 ItemSize: ProductSize,
  //                 Qty: 1,
  //                 // ItemPrice: itemPrice,
  //                 ItemPrice: 250.00,
  //                 Discount: 0,
  //                 VAT: vat,
  //                 Total: total,
  //               },
  //             ];
  //           }
  //         });
  //       } catch (secondApiError) {
  //         toast.error(
  //           secondApiError?.response?.data?.message ||
  //             "An error occurred while calling the second API"
  //         );
  //       }
  //     } else {
  //       setData([]);
  //     }
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message || "An error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  // Fetch barcode data from API
  const handleGetBarcodes = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/itemCodes/v2/searchByGTIN?GTIN=${barcode}`
      );
      const data = response?.data?.data;

      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName } = data;

        const itemPrice = 250.00; // Hardcoded for now, ideally fetched from the second API.
        const vat = itemPrice * 0.15;
        const total = itemPrice + vat;

        setData((prevData) => {
          const existingItemIndex = prevData.findIndex(item => item.Barcode === GTIN);
  
          if (existingItemIndex !== -1) {
            // If the item already exists, just update the Qty and Total
            const updatedData = [...prevData];
            updatedData[existingItemIndex].Qty += 1;
            updatedData[existingItemIndex].Total = updatedData[existingItemIndex].Qty * (itemPrice + vat);
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

      } else {
        setData([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals for Net with VAT, Total VAT, and Total Amount with VAT
  useEffect(() => {
    const calculateTotals = () => {
      let totalNet = 0;
      let totalVat = 0;
    
      data.forEach(item => {
        totalNet += item.ItemPrice * item.Qty;
        totalVat += item.VAT * item.Qty;
      });

      setNetWithVat(totalNet);
      setTotalVat(totalVat);
      setTotalAmountWithVat(totalNet + totalVat);
    };

    calculateTotals();
  }, [data]);


  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const [storeDatagridData, setStoreDatagridData] = useState([]);
  const handleShowCreatePopup = () => {
    // if (!isCreatePopupVisible) {
    if (!data || data.length === 0) {
      toast.warning("The datagrid is empty. Please ensure data is available before proceeding.");
    } else {
      setStoreDatagridData([...data]);
      setCreatePopupVisibility(true);
    }
  };

  const [apiResponse, setApiResponse] = useState(null);
  const [isOpenOtpPopupVisible, setIsOpenOtpPopupVisible] = useState(false);
  const handleShowOtpPopup = (response) => {
    setCreatePopupVisibility(false);
    setApiResponse(response);
    setIsOpenOtpPopupVisible(true);
  };

  const handleClearData = () => {
    setData([]);
  };

  // transaction Codes Api
  const [transactionCodes, setTransactionCodes] = useState([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState("");

  const fetchTransactionCodes = async () => {
    try {
      const response = await ErpTeamRequest.post(
        "/slicuat05api/v1/getApi",
        {
          filter: {
            P_TXN_TYPE: "LTRFO",
          },
          M_COMP_CODE: "SLIC",
          M_USER_ID: "SYSADMIN",
          APICODE: "ListOfTransactionCode",
          M_LANG_CODE: "ENG",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);
      setTransactionCodes(response.data);
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  
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
    fetchTransactionCodes();
    fetchCustomerNames();
  }, []);

  useEffect(() => {
    // console.log(selectedTransactionCode)
  }, [selectedTransactionCode]);


  // picked current date and time 
  const [currentTime, setCurrentTime] = useState("");
  const [todayDate, setTodayDate] = useState('');
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

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Invoice States
  const [netWithVat, setNetWithVat] = useState('');
  const [totalVat, setTotalVat] = useState('');
  const [invoiceLoader, setInvoiceLoader] = useState(false);
 
  const handleInvoiceGenerator = async (e) => {
    e.preventDefault();
    setInvoiceLoader(true);
    try {
      const res = await newRequest.post('/zatca/generateZatcaQRCode', {
        invoiceDate: todayDate,
        // totalWithVat: Number(netWithVat),
        // totalWithVat: Number(netWithVat) + Number(totalVat),
        totalWithVat: totalAmountWithVat,
        vatTotal: Number(totalVat), 
      }
    )
      // console.log('invoice', res?.data);
      
      const qrCodeDataFromApi = res?.data?.qrCodeData;
      handlePrintSalesInvoice(qrCodeDataFromApi);

      setNetWithVat('');
      setTotalVat('');
      toast.success('Invoice generated successfully!');
      setInvoiceLoader(false);
    } catch(error) {
      console.log(error);
      toast.error('Failed to generate invoice. Please try again.');
      setInvoiceLoader(false);
    }
  }
  
  // invoice generate
  const handlePrintSalesInvoice = (qrCodeData) => {
    const printWindow = window.open("", "Print Window", "height=800,width=800");

    const html = `
      <html>
        <head>
          <title>Sales Invoice</title>
          <style>
            @page { size: 3in 8in; margin: 0; }
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
            .table th, .table td {
              text-align: left;
              padding: 5px;
              border-bottom: 1px solid black;
              font-size: 15px;
            }
            .total-section {
              font-size: 15px;
              text-align: left;
              line-height: 1.5;
              display: flex;
              justify-content: space-between;
            }
            .left-side {
              text-align: left;
            }
            .right-side {
              text-align: right;
              font-family: 'Arial', sans-serif;
              direction: rtl;
              margin-left: 5px;
            }
            .qr-section {
              text-align: center;
              margin-top: 70px;
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
            <div><span class="field-label">Customer: </span>${selectedCustomerName?.CUST_NAME}</div>
            <div><span class="field-label">VAT#: </span>${netWithVat}</div>
            <div><span class="field-label">Receipt: </span>2024003612</div>
            <div><span class="field-label">Date: </span>${currentTime}</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>QTY</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.SKU}</td>
                  <td>${item.Qty}</td>
                  <td>${item.ItemPrice.toFixed(2)}</td>
                  <td>${(item.ItemPrice * item.Qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="left-side">
              <div><strong>Gross:</strong> ${netWithVat}</div>
              <div><strong>VAT :</strong> ${totalVat}</div>
              <div><strong>Total Amount With VAT:</strong> ${totalAmountWithVat}</div>
              <div><strong>Paid:</strong> </div>
              <div><strong>Change Due:</strong> </div>
            </div>
            <div class="right-side">
              <div>(ريال) المجموع</div>
              <div>ضريبة القيمة المضافة</div>
              <div>المجموع</div>
              <div>المدفوع</div>
              <div>المتبقي</div>
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
      QRCode.toCanvas(qrCodeCanvas, qrCodeData, function (error) {
        if (error) console.error(error);
        else {
          // Trigger the print dialog after the QR code is rendered
          printWindow.print();
          printWindow.close();
        }
      });

      // console.log(qrCodeData);
    };
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
              <label className="block text-gray-700">
                Transactions Codes *
              </label>
              <select
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value={selectedTransactionCode}
                onChange={(e) => setSelectedTransactionCode(e.target.value)}
              >
                {transactionCodes.map((code, index) => (
                  <option
                    key={index}
                    value={code.ListOfTransactionCod.TXN_CODE}
                  >
                    {code.ListOfTransactionCod.TXN_CODE}
                  </option>
                ))}
              </select>
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
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value={selectedLocation?.LOCN_NAME}
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700">Invoice #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400"
                placeholder="Invoice"
                // readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Search Customer</label>
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
            </div>
            <div>
              <label className="block text-gray-700">Delivery *</label>
              <input
                type="text"
                value={selectedLocation?.LOCN_NAME}
                className="w-full mt-1 p-2 border rounded border-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-700">Customer Name*</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Walk-in customer"
                value={selectedCustomerName?.CUST_NAME}
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
            <div className="flex items-center">
              <div className="w-full">
                <label className="block text-gray-700">Scan Barcode</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                  placeholder="Search Barcode"
                />
              </div>
              <button
                onClick={handleGetBarcodes}
                className="ml-2 p-2 mt-7 border rounded bg-secondary hover:bg-primary text-white flex items-center justify-center"
              >
                <IoBarcodeSharp size={20} />
              </button>
            </div>

            <div>
              <label className="block text-gray-700">Remarks *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400"
                placeholder="Remarks"
              />
            </div>
            <div>
              <label className="block text-gray-700">Type *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">VAT #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="VAT"
              />
            </div>
          </div>
          <div className="mt-10">
            <table className="table-auto w-full">
              <thead className="bg-secondary text-white">
                <tr>
                  {/* <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Barcode</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Item Size</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Item Price</th>
                  <th className="px-4 py-2">Discount</th>
                  <th className="px-4 py-2">VAT (15%)</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Action</th> */}
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
                  {/* {data.map((row, index) => (
                    <tr key={index} className="bg-gray-100">
                      <td className="border px-4 py-2">{row.SKU}</td>
                      <td className="border px-4 py-2">{row.Barcode}</td>
                      <td className="border px-4 py-2">{row.Description}</td>
                      <td className="border px-4 py-2">{row.ItemSize}</td>
                      <td className="border px-4 py-2">{row.Qty}</td>
                      <td className="border px-4 py-2">{row.ItemPrice}</td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          value={row.Discount}
                          onChange={(e) => {
                            const discount = parseFloat(e.target.value) || 0;
                            const updatedData = [...data];
                            updatedData[index].Discount = discount;
                            updatedData[index].Total =
                              updatedData[index].ItemPrice -
                              discount +
                              updatedData[index].VAT;
                            setData(updatedData);
                          }}
                          className="w-full text-center"
                        />
                      </td>
                      <td className="border px-4 py-2">{row.VAT.toFixed(2)}</td>
                      <td className="border px-4 py-2">
                        {row.Total.toFixed(2)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => {
                            const updatedData = data.filter(
                              (_, i) => i !== index
                            );
                            setData(updatedData);
                          }}
                        >
                          <span className="text-red-500 font-bold">X</span>
                        </button>
                      </td>
                    </tr>
                  ))} */}
                  {data.map((row, index) => (
                    <tr key={index} className="bg-gray-100">
                      <td className="border px-4 py-2">{row.SKU}</td>
                      <td className="border px-4 py-2">{row.Barcode}</td>
                      <td className="border px-4 py-2">{row.Description}</td>
                      <td className="border px-4 py-2">{row.ItemSize}</td>
                      <td className="border px-4 py-2">{row.Qty}</td>
                      <td className="border px-4 py-2">{row.ItemPrice.toFixed(2)}</td>
                      <td className="border px-4 py-2">{row.VAT.toFixed(2)}</td>
                      <td className="border px-4 py-2">{row.Total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <button className="bg-[#2596be] t</div>ext-white py-4 px-4 rounded">
                  F10 - Open Drawer
                </button>
                <button className="bg-[#037de2] text-white py-4 px-4 rounded">
                  F6 - PLU Inquiry
                </button>
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
                  F7 - Department
                </button>
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
                <button className="bg-gray-500 text-white py-4 px-4 rounded">
                  F1 - Edit Qty
                </button>
                <button className="bg-yellow-500 text-white py-4 px-4 rounded">
                  F9 - Old Invoice
                </button>
                <button className="bg-[#0dcaf0] text-white py-4 px-4 rounded">
                  F2 - Delete Line
                </button>
                <button className="bg-blue-500 text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
                <button
                  onClick={handleShowCreatePopup}
                  className="bg-red-500 text-white py-4 px-4 rounded transform hover:scale-90 hover:cursor-pointer"
                >
                  F3 - Tender Cash
                </button>
                <button className="bg-black text-white py-4 px-4 rounded">
                  F8 - Z Report
                </button>
                <button className="bg-red-600 text-white py-4 px-4 rounded">
                  F5 - Return Items
                </button>
                <button className="bg-blue-500 text-white py-4 px-4 rounded">
                  F4 - Last Receipt
                </button>
              </div>
            </div>
            <div>
              <div className="bg-white p-4 rounded shadow-md">
                <form onSubmit={handleInvoiceGenerator} className="flex flex-col gap-4">
                  {/* <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Net With VAT:
                    </label>
                    <input
                      type="number"
                      value={netWithVat}
                      onChange={(e) => setNetWithVat(e.target.value)}
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Total VAT:
                    </label>
                    <input
                      type="number"
                      value={totalVat}
                      onChange={(e) => setTotalVat(e.target.value)}
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Total Amount With VAT:</label>
                    <input
                      type="text"
                      value={Number(netWithVat) + Number(totalVat)}
                      readOnly
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                    />
                  </div> */}
                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Net With VAT:</label>
                    <input
                      type="text"
                      value={netWithVat}
                      readOnly
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Total VAT:</label>
                    <input
                      type="text"
                      value={totalVat}
                      readOnly
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Total Amount With VAT:</label>
                    <input
                      type="text"
                      value={totalAmountWithVat}
                      readOnly
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                    />
                  </div>

                  <div className="flex justify-between items-center w-full">
                    <Button
                        variant="contained"
                        style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                        type="submit"
                        disabled={invoiceLoader}
                        className="w-full ml-2"
                        endIcon={
                          invoiceLoader ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                      >
                        Print Receipt
                      </Button>
                  </div>
                </form>
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
            />
          )}

          {isOpenOtpPopupVisible && (
            <F3ResponsePopUp
              isVisible={isOpenOtpPopupVisible}
              setVisibility={setIsOpenOtpPopupVisible}
              apiResponse={apiResponse}
            />
          )}
        </div>
      </div>
    </SideNav>
  );
};

export default POS;
