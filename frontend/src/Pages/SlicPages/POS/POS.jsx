import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { IoBarcodeSharp } from "react-icons/io5";
import DataTable from "../../../components/Datatable/Datatable";
import { GtinColumn } from "../../../utils/datatablesource";
import DeleteIcon from "@mui/icons-material/Delete";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import { Autocomplete, CircularProgress, debounce, TextField } from "@mui/material";

const POS = () => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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



  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [selectedGtin, setSelectedGtin] = useState(null);
  const [isAutocompleteFilled, setIsAutocompleteFilled] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [adminList, setAdminList] = useState([]);
  const abortControllerRef = React.useRef(null);

  const handleGPCAutoCompleteChange = (event, value) => {
    setSelectedGtin(value);


    // Update the state variable when Autocomplete field is filled
    setIsAutocompleteFilled(value !== null && value !== '');

    // if (value) {
    //   fetchData(value);
    // }
  }

  // Use debounce to wrap the handleAutoCompleteInputChange function
  const debouncedHandleAutoCompleteInputChange = debounce(async (event, newInputValue, reason) => {
    setIsSubmitClicked(false);
    if (reason === 'reset' || reason === 'clear') {
      setAdminList([]); // Clear the data list if there is no input
      return; // Do not perform search if the input is cleared or an option is selected
    }
    if (reason === 'option') {
      return; // Do not perform search if the option is selected
    }

    if (!newInputValue || newInputValue.trim() === '') {
      // perform operation when input is cleared
      setAdminList([]);
      return;
    }

    // console.log(newInputValue);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort previous request
    }
    abortControllerRef.current = new AbortController(); // Create a new controller for the new request

    try {
      setAutocompleteLoading(true);
      setOpen(true);

      const res = await newRequest.get(`/itemCodes/v1/searchByGTIN?GTIN=${newInputValue}`, {
        signal: abortControllerRef.current.signal
      });
      // console.log(res?.data);
      
      const crs = res?.data?.data?.map(item => {
        return {
          GTIN: item.GTIN,
          ItemCode: item.ItemCode,
          EnglishName: item.EnglishName,
          ProductSize: item.ProductSize,
          
        };
      });

      setAdminList(crs);

      setOpen(true);
      setAutocompleteLoading(false);

      // fetchData();

    } catch (error) {
      // console.log(error);
      setAdminList([]); // Clear the data list if an error occurs
      setOpen(false);
      setAutocompleteLoading(false);
    }
  }, 400);

  const handleGetBarcodes = async () => {
    if (!selectedGtin) {
      toast.info("Please enter a barcode");
      return;
    }

    setIsLoading(true);
    try {
      const res = await newRequest.get(`/itemCodes/v1/searchByGTIN?GTIN=${selectedGtin?.GTIN}`);
      // console.log(res?.data);
      setData(res?.data?.data || []);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRowClickInParent = (item) => {
    if (!item || item?.length === 0) {
      // setTableSelectedRows(item)
      // setTableSelectedExportRows(item);
      // setFilteredData(data);
      return;
    }
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
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Choose...</option>
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
              <select className="w-full mt-1 p-2 border rounded border-gray-400">
                <option>Choose...</option>
              </select>
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
                <Autocomplete
                    id="companyName"
                    required
                    options={adminList}
                    
                    getOptionLabel={(option) => (option && option.GTIN) ? `${option?.GTIN} - ${option?.ItemCode} - ${option?.EnglishName} - ${option?.ProductSize} ` : ''}
                    onChange={handleGPCAutoCompleteChange}
                    value={selectedGtin}
                    onInputChange={(event, newInputValue, params) => debouncedHandleAutoCompleteInputChange(event, newInputValue, params)}
                    loading={autocompleteLoading}
                    sx={{ marginTop: '10px' }}
                    open={open}
                    onOpen={() => {
                      // setOpen(true);
                    }}
                    onClose={() => {
                      setOpen(false);
                    }}
                    renderOption={(props, option) => (
                      <li key={option.GTIN} {...props}>
                        {option ? `${option.GTIN} - ${option.ItemCode} - ${option.EnglishName} - ${option?.ProductSize} ` : 'No options'}
                      </li>
                    )}


                    renderInput={(params) => (
                      <TextField
                        // required
                        error={isSubmitClicked && !selectedGtin}
                        helperText={isSubmitClicked && !selectedGtin ? "Products is required" : ""}
                        {...params}
                        label={'Search Barcodes'}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {autocompleteLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                        sx={{
                          '& label.Mui-focused': {
                            color: '#00006A',
                          },
                          '& .MuiInput-underline:after': {
                            borderBottomColor: '#00006A',
                          },
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#000000',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#000000',
                            },
                          },
                        }}
                      />
                    )}

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
                <button className="bg-red-500 text-white py-4 px-4 rounded">
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
        </div>
      </div>
    </SideNav>
  );
};

export default POS;
