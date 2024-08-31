import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import {
  fetchBarcodeData,
  fetchSecondApiData,
  fetchInvoiceDetails,
  fetchTransactionCodes,
  fetchCustomerNames,
} from "../../../utils/api/api";
import { useInvoiceUtils } from "../../../utils/invoiceUtils";
import { toast } from "react-toastify";
import F3TenderCashPopUp from "./F3TenderCashPopUp";
import F3ResponsePopUp from "./F3ResponsePopUp";
import CircularProgress from "@mui/material/CircularProgress";
import { Autocomplete, TextField } from "@mui/material";
import {
  useStoredCompanyData,
  useStoredLocationData,
  useFetchTransactionCodes,
  useFetchCustomerNames,
} from "../../../utils/hooks/usePOSUtils";

const POS = () => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSalesType, setSelectedSalesType] = useState("DIRECT SALES INVOICE");
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [transactionCodes, setTransactionCodes] = useState([]);
  const [selectedTransactionCode, setSelectedTransactionCode] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const [isOpenOtpPopupVisible, setIsOpenOtpPopupVisible] = useState(false);
  const [totalAmountWithVat, setTotalAmountWithVat] = useState(0);

  const handleShowCreatePopup = () => {
    setCreatePopupVisibility(true);
  };
  
  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate the items to display for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  useStoredCompanyData(setSelectedCompany);
  useStoredLocationData(setSelectedLocation);
  useFetchTransactionCodes(selectedLocation, setTransactionCodes);
  useFetchCustomerNames(setSearchCustomerName);

  const {
    currentTime,
    invoiceNumber,
    netWithVat,
    totalVat,
    invoiceLoader,
    handleInvoiceGenerator,
    calculateTotals,
  } = useInvoiceUtils();

  // Calculate totals whenever `data` changes
  useEffect(() => {
    const total = calculateTotals(data);
    setTotalAmountWithVat(total);
  }, [data]);

  const handleGetBarcodes = async (e) => {
    e.preventDefault();
    if (selectedSalesType === "DIRECT SALES RETURN") {
      await handleGetInvoiceDetails(e);
      return;
    }

    setIsLoading(true);
    try {
      const barcodeData = await fetchBarcodeData(barcode);
      if (barcodeData) {
        const { ItemCode, ProductSize, GTIN, EnglishName } = barcodeData;
        try {
          const secondApiData = await fetchSecondApiData(ItemCode, ProductSize, token);
          const itemRates = secondApiData.map((item) => item?.PRICELIST?.PLI_RATE);
          const itemPrice = itemRates.reduce((sum, rate) => sum + rate, 0);
          const vat = itemPrice * 0.15;
          const total = itemPrice + vat;

          setData((prevData) => {
            const existingItemIndex = prevData.findIndex((item) => item.Barcode === GTIN);
            if (existingItemIndex !== -1) {
              const updatedData = [...prevData];
              updatedData[existingItemIndex] = {
                ...updatedData[existingItemIndex],
                Qty: updatedData[existingItemIndex].Qty + 1,
                Total: (updatedData[existingItemIndex].Qty + 1) * (itemPrice + vat),
              };
              return updatedData;
            } else {
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
          toast.error("Error fetching additional data");
        }
        setBarcode("");
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Error fetching barcode data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInvoiceDetails = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const invoiceData = await fetchInvoiceDetails(searchInvoiceNumber);
      if (invoiceData) {
        const invoiceDetails = invoiceData.invoiceDetails;
        setData(
          invoiceDetails.map((item) => {
            const vat = item.ItemPrice * 0.15;
            const total = item.ItemPrice + vat;
            return {
              SKU: item.ItemSKU,
              Barcode: item.InvoiceNo,
              Description: item.Remarks || "No description",
              ItemSize: item.ItemSize,
              Qty: 1,
              ItemPrice: item.ItemPrice,
              VAT: vat,
              Total: total,
            };
          })
        );
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Error fetching invoice details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "next") {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev") {
      setCurrentPage((prev) => prev - 1);
    }
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
              <Autocomplete
                id="transactionId"
                options={transactionCodes}
                getOptionLabel={(option) =>
                  option && option.TXN_CODE && option.TXN_NAME
                    ? `${option.TXN_CODE} - ${option.TXN_NAME}`
                    : ""
                }
                onChange={(event, newValue) => {
                  setSelectedTransactionCode(newValue);
                }}
                value={selectedTransactionCode}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      className: "text-black",
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      style: { color: "black" },
                    }}
                    className="bg-gray-50 border border-gray-300 text-black text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                    placeholder={"Search Transaction Codes"}
                    required
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-gray-700">Sale Type *</label>
              <select
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value={selectedSalesType}
                onChange={(e) => setSelectedSalesType(e.target.value)}
              >
                <option value="DIRECT SALES INVOICE">DIRECT SALES INVOICE</option>
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
                value={invoiceNumber}
                className="w-full mt-1 p-2 border rounded border-gray-400"
                placeholder="Invoice"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Search Customer</label>
              <Autocomplete
                id="field1"
                options={searchCustomerName}
                getOptionLabel={(option) =>
                  option && option.CUST_CODE && option.CUST_NAME
                    ? `${option.CUST_CODE} - ${option.CUST_NAME}`
                    : ""
                }
                onChange={(event, newValue) => {
                  setSelectedCustomerName(newValue);
                }}
                value={selectedCustomerName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      className: "text-black",
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      style: { color: "black" },
                    }}
                    className="bg-gray-50 border border-gray-300 text-black text-xs rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 md:p-2.5"
                    placeholder={"Search Customer ID"}
                    required
                  />
                )}
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
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Walk-in customer"
                value={customerName}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
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
              <form onSubmit={handleGetInvoiceDetails} className="flex items-center col-span-3">
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
            </div>
            <div className="">
              <label className="block text-gray-700">Remarks *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
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

          {/* </div> */}

          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead className="bg-secondary text-white">
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
                <tbody>
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <div className="flex justify-center items-center w-full h-full">
                        <CircularProgress size={24} color="inherit" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {currentItems.map((row, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td className="px-4 py-2">{row.SKU}</td>
                      <td className="px-4 py-2">{row.Barcode}</td>
                      <td className="px-4 py-2">{row.Description}</td>
                      <td className="px-4 py-2">{row.ItemSize}</td>
                      <td className="px-4 py-2">{row.Qty}</td>
                      <td className="px-4 py-2">{row.ItemPrice}</td>
                      <td className="px-4 py-2">{row.VAT}</td>
                      <td className="px-4 py-2">{row.Total}</td>
                      <td
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => handleRemoveItem(index)}
                      >
                        X
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              className="m-2 px-4 py-2 border border-gray-400 bg-white text-black"
            >
              Previous
            </button>
            <span className="mx-2">{currentPage}</span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
              className="m-2 px-4 py-2 border border-gray-400 bg-white text-black"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <button className="bg-[#2596be] text-white py-4 px-4 rounded">
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
              // showOtpPopup={handleShowOtpPopup}
              handleClearData={handleClearData}
              selectedSalesType={selectedSalesType}
              handleInvoiceGenerator={handleInvoiceGenerator}
              totalAmountWithVat={totalAmountWithVat}
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
