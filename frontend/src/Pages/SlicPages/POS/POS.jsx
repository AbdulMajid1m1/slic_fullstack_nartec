import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import F3TenderCashPopUp from "./F3TenderCashPopUp";
import F3ResponsePopUp from "./F3ResponsePopUp";
import CircularProgress from "@mui/material/CircularProgress";

const POS = () => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSalesType, setSelectedSalesType] = useState('DIRECT SALES INVOICE');

  useEffect(() => {
    const storedCompanyData = sessionStorage.getItem('selectedCompany');
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
      }
    }

    const storedLocationData = sessionStorage.getItem('selectedLocation');
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
      }
    }
  }, []);

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

 
  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));

  const handleGetBarcodes = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get(`/itemCodes/v2/searchByGTIN?GTIN=${barcode}`);
      const data = response?.data?.data;
      console.log(data);
  
      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName } = data;
  
        const secondApiBody = {
          "filter": {
              "P_COMP_CODE": "SLIC",
              "P_CUST_CODE": "CL100729",
              "P_ITEM_CODE": ItemCode,
              "P_GRADE_CODE_1": ProductSize,
          },
          "M_COMP_CODE": "001",
          "M_USER_ID": "SYSADMIN",
          "APICODE": "ItemRate",
          "M_LANG_CODE": "ENG"
        };
  
        try {
          const secondApiResponse = await newRequest.post('/slicuat05api/v1/getApi', secondApiBody, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const secondApiData = secondApiResponse?.data;
  
          let storedData = sessionStorage.getItem("secondApiResponses");
          storedData = storedData ? JSON.parse(storedData) : {};
  
          storedData[ItemCode] = secondApiData;
  
          sessionStorage.setItem("secondApiResponses", JSON.stringify(storedData));
  
          const itemPrice = secondApiData.ItemRate || 0;
          const vat = itemPrice * 0.15;
          const total = itemPrice + vat;
  
          setData(prevData => {
            const existingRecordIndex = prevData.findIndex(record => record.Barcode === GTIN);
  
            if (existingRecordIndex !== -1) {
              const updatedData = [...prevData];
              updatedData[existingRecordIndex].Qty += 1;
              updatedData[existingRecordIndex].Total = (updatedData[existingRecordIndex].Qty * itemPrice) + (updatedData[existingRecordIndex].Qty * vat);
              return updatedData;
            } else {
              return [...prevData, {
                SKU: ItemCode,
                Barcode: GTIN,
                Description: EnglishName,
                ItemSize: ProductSize,
                Qty: 1,
                ItemPrice: itemPrice,
                Discount: 0,
                VAT: vat,
                Total: total
              }];
            }
          });
  
        } catch (secondApiError) {
          toast.error(secondApiError?.response?.data?.message || "An error occurred while calling the second API");
        }
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
    if (!isCreatePopupVisible) {
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
  const [selectedTransactionCode, setSelectedTransactionCode] = useState('');

  const fetchTransactionCodes = async () => {
    try {
      const response = await newRequest.post(
        '/slicuat05api/v1/getApi',
        {
          filter: {
            P_TXN_TYPE: "LTRFO"
          },
          M_COMP_CODE: "SLIC",
          M_USER_ID: "SYSADMIN",
          APICODE: "ListOfTransactionCode",
          M_LANG_CODE: "ENG"
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

  useEffect(() => {
    fetchTransactionCodes();
  }, []);

  useEffect(() => {
    // console.log(selectedTransactionCode)
  },[selectedTransactionCode])


  return (
    <SideNav>
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 shadow-md">
          <div className="px-3 py-3 flex justify-between bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
              <span>{selectedSalesType === 'DIRECT SALES INVOICE' ? 'Sales Entry Form (Direct Invoice)' : 'Sales Entry Form (Direct Sales Return)'}</span>
              <p className="text-end">{currentTime}</p>
          </div>

          <div className="mb-4 mt-4 flex justify-between">
              <h2 className="text-2xl font-semibold bg-yellow-100 px-2 py-1">{selectedSalesType === 'DIRECT SALES INVOICE' ? 'NEW SALE' : 'SALES RETURN'}</h2>
              <p className="text-2xl font-semibold bg-yellow-100 px-2 py-1">Cashier : CreativeM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
           <div>
              <label className="block text-gray-700">Transactions Codes *</label>
              <select 
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value={selectedTransactionCode}
                onChange={(e) => setSelectedTransactionCode(e.target.value)}
              >
                {transactionCodes.map((code, index) => (
                  <option key={index} value={code.ListOfTransactionCod.TXN_CODE}>
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
                <option value="DIRECT SALES INVOICE">DIRECT SALES INVOICE</option>
                <option value="DIRECT SALES RETURN">DIRECT SALES RETURN</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Sales Locations *</label>
              <input className="w-full mt-1 p-2 border rounded border-gray-400" 
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
              <input
                type="text"
                placeholder="Search Customer by Mobile"
                className="w-full mt-1 p-2 border rounded bg-yellow-200 border-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-700">Delivery *</label>
              <input 
               type="text"
               value={selectedLocation?.LOCN_NAME}
               className="w-full mt-1 p-2 border rounded border-gray-400" />
            </div>
            <div>
              <label className="block text-gray-700">Customer *</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="Walk-in customer"
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
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Barcode</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Item Size</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Item Price</th>
                  <th className="px-4 py-2">Discount</th>
                  <th className="px-4 py-2">VAT (15%)</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              {isLoading ? (
                <div className="flex justify-center items-center h-14">
                  <CircularProgress size={24} color="inherit" />
                </div>
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
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        value={row.Discount}
                        onChange={(e) => {
                          const discount = parseFloat(e.target.value) || 0;
                          const updatedData = [...data];
                          updatedData[index].Discount = discount;
                          updatedData[index].Total = (updatedData[index].ItemPrice - discount) + updatedData[index].VAT;
                          setData(updatedData);
                        }}
                        className="w-full text-center"
                      />
                    </td>
                    <td className="border px-4 py-2">{row.VAT.toFixed(2)}</td>
                    <td className="border px-4 py-2">{row.Total.toFixed(2)}</td>
                    <td className="border px-4 py-2 text-center">
                      <button onClick={() => {
                        const updatedData = data.filter((_, i) => i !== index);
                        setData(updatedData);
                      }}>
                        <span className="text-red-500 font-bold">X</span>
                      </button>
                    </td>
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
                <button onClick={handleShowCreatePopup} className="bg-red-500 text-white py-4 px-4 rounded">
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
                    <label className="block text-gray-700 font-bold">Net With VAT:</label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Total VAT(15%):
                    </label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">
                      Tender Amount:
                    </label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold">Balance:</label>
                    <input
                      type="number"
                      className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                      placeholder="0.00"
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
