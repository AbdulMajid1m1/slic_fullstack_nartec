import React, { useContext, useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import DataTable from "../../../components/Datatable/Datatable";
import { GtinColumn } from "../../../utils/datatablesource";
import DeleteIcon from "@mui/icons-material/Delete";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import F3TenderCashPopUp from "./F3TenderCashPopUp";
import F3ResponsePopUp from "./F3ResponsePopUp";
import { DataContext } from "../../../Contexts/DataContext";

const POS = () => {
  // const [data, setData] = useState([]);
  const { data, setData } = useContext(DataContext);
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const storedCompanyData = sessionStorage.getItem('selectedCompany');
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      // Only update state if different from current state
      if (JSON.stringify(companyData) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(companyData);
        // console.log(companyData);
      }
    }

    const storedLocationData = sessionStorage.getItem('selectedLocation');
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      // Only update state if different from current state
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
        console.log(locationData);
      }
    }
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }));
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);


  const handleRowClickInParent = (item) => {
    if (!item || item?.length === 0) {
      // setTableSelectedRows(item)
      // setTableSelectedExportRows(item);
      // setFilteredData(data);
      return;
    }
  };

  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
  
  const handleGetBarcodes = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get(`/itemCodes/v2/searchByGTIN?GTIN=${barcode}`);
      const data = response?.data?.data;
      // console.log(data);
  
      if (data) {
        const { ItemCode, ProductSize, GTIN, ItemQty } = data;

        setData(prevData => {
          // Check if the GTIN already exists in the previous data
          const existingRecordIndex = prevData.findIndex(record => record.GTIN === GTIN);

          if (existingRecordIndex !== -1) {
            // If it exists, update the ItemQty
            const updatedData = [...prevData];
            updatedData[existingRecordIndex].ItemQty += ItemQty;
            return updatedData;
          } else {
            // If it doesn't exist, append the new data
            return [...prevData, data];
          }
        });
  
        // Prepare the body for the second API request
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
  
      // Call the second API
      try {
        const secondApiResponse = await newRequest.post('/slicuat05api/v1/getApi', secondApiBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const secondApiData = secondApiResponse?.data;
        // console.log(secondApiData);

        // Retrieve the current session storage
        let storedData = sessionStorage.getItem("secondApiResponses");
        storedData = storedData ? JSON.parse(storedData) : {};

        // Update the session storage with new key-value pair
        storedData[ItemCode] = secondApiData;

        // Save the updated session storage
        sessionStorage.setItem("secondApiResponses", JSON.stringify(storedData));

      } catch (secondApiError) {
        toast.error(secondApiError?.response?.data?.message || "An error occurred while calling the second API");
        console.error(secondApiError);
      }
    } else {
      setData([]);
    }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  


  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const [storeDatagridData, setStoreDatagridData] = useState([]);
  const handleShowCreatePopup = () => {
    if (!isCreatePopupVisible) {
      setStoreDatagridData([...data]); // Create a new array to avoid reference issues
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

  return (
    <SideNav>
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 shadow-md">
          <div className="px-3 py-3 flex justify-between bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
            <span>Sales Entry Form (Direct Invoice)</span>
            <p className="text-end">{currentTime}</p>
          </div>

          <div className="mb-4 mt-4 flex justify-between">
            <h2 className="text-2xl font-semibold bg-yellow-100 px-2 py-1">NEW SALE</h2>
            <p className="text-2xl font-semibold bg-yellow-100 px-2 py-1">Cashier : CreativeM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Transactions *</label>
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Direct Sales Invoice</option>
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
              <label className="block text-gray-700">VAT #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400 bg-green-200 placeholder:text-black"
                placeholder="VAT"
              />
            </div>
            <div>
              <label className="block text-gray-700">Invoice #</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded border-gray-400"
                value="1720253863"
                readOnly
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
          </div>
          <div className="mt-10">
            {/* <div className="bg-blue-500 text-white font-semibold flex justify-between flex-wrap">
              <div className="px-4 py-2">GTIN</div>
              <div className="px-4 py-2">Description</div>
              <div className="px-4 py-2">Price</div>
              <div className="px-4 py-2">Qty</div>
              <div className="px-4 py-2">Discount</div>
              <div className="px-4 py-2">VAT</div>
              <div className="px-4 py-2">Total</div>
              <div className="px-4 py-2">Action</div>
            </div> */}
            <div style={{marginLeft: '-20px', marginRight: '-20px', marginTop: '-25px'}}>
              <DataTable
                data={data}
                // title={"Products List"}
                columnsName={GtinColumn}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="posListId"
                handleRowClickInParent={handleRowClickInParent}
                showToolbarSlot={false}
                checkboxSelection="disabled"
                dropDownOptions={[
                  {
                    label: "Delete",
                    icon: (
                      <DeleteIcon
                        fontSize="small"
                        color="action"
                        style={{ color: "rgb(37 99 235)" }}
                      />
                    ),
                    // action: handleDelete,
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
