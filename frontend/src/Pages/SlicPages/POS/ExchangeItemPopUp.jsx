import React, { useState, useEffect } from "react";
import newRequest from "../../../utils/userRequest";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import { IoBarcodeSharp } from "react-icons/io5";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

const ExchangeItemPopUp = ({ isVisible, setVisibility, addExchangeData, selectedRowData, invoiceHeaderData, dsalesLocationCode, selectedSalesType, addDSalesExchangeData }) => {
  const [data, setData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    console.log("Selected Row Data" , selectedRowData);
  }, [selectedRowData]);

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
      console.log(data)
      if (data) {
        const { ItemCode, ProductSize, GTIN, EnglishName, ModelName } = data;

        // call the second api later in their
        const secondApiBody = {
          "filter": {
            "P_COMP_CODE": "SLIC",
            "P_ITEM_CODE": ItemCode,
            "P_CUST_CODE": "CL100948",
              "P_GRADE_CODE_1": ProductSize
          },
          "M_COMP_CODE": "SLIC",
          "M_USER_ID":"SYSADMIN",
          "APICODE": "PRICELIST",
          "M_LANG_CODE": "ENG"

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
          console.log(secondApiData)

          const itemRates = secondApiData.map(item => item?.PRICELIST?.PLI_RATE);
          
        const itemPrice = itemRates.reduce((sum, rate) => sum + rate, 0); // Sum of all item prices
        // const itemPrice = 250.0; // Hardcoded for now, ideally fetched from the second API.
        const vat = itemPrice * 0.15;
        const total = itemPrice + vat;
        // console.log(itemPrice);

        setData((prevData) => {
          return [
            ...prevData,
            {
              SKU: ItemCode,
              Barcode: GTIN,
              Description: EnglishName,
              ItemSize: ProductSize,
              Qty: selectedRowData.Qty,
              ItemPrice: itemPrice,
              ModelName: ModelName,
              VAT: vat,
              Total: total,
            },
          ];
        });
        } catch (secondApiError) {
          toast.error(
            secondApiError?.response?.data?.message ||
              "An error occurred while calling the second API"
          );
        }
        // barcode state empty once response is true
        // setBarcode('');
      } 
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  const handleExchangeItems = async () => {
    if (data.length === 0) {
      toast.error("Please scan a barcode first because data is empty");
      return;
    }
  
    const item = data[0]; // Assuming you are dealing with a single item at a time
    // console.log(item);
    
    const locationCode = selectedSalesType === "DSALES NO INVOICE" 
    ? dsalesLocationCode
    : invoiceHeaderData;
  

    // If stock is available, call the STOCK STATUS API
    const stockStatusBody = {
      "filter": {
        "M_COMP_CODE": "SLIC",
        "P_LOCN_CODE": locationCode,
        "P_ITEM_CODE": item?.SKU,
        // "P_ITEM_CODE": "55782",
        "P_GRADE_1": item?.ProductSize,
        "P_GRADE_2": "NA",
        },
        "M_COMP_CODE": "SLIC",
        "M_USER_ID": "SYSADMIN",
        "APICODE": "STOCKSTATUS",
        "M_LANG_CODE": "ENG"
    };
  
    try {
      const stockStatusResponse = await ErpTeamRequest.post(
        "/slicuat05api/v1/getApi",
        stockStatusBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const stockData = stockStatusResponse?.data;
      console.log(stockData);
      // You should check here whether the stockData indicates sufficient stock before proceeding
      const availableStock = stockData[0]?.STOCKSTATUS?.FREE_STOCK;
      // console.log(availableStock)
      if (availableStock >= item.Qty) {
        // console.log(item.Qty)
        const res = await newRequest.post('/exchangeInvoice/v1/createExchangeInvoice', {
          EnglishName: item.Description,
          GTIN: item.Barcode,
          ModelName: item.SKU,
          ProductSize: item.ItemSize,
        });
  
        // console.log(res?.data);
        toast.success(res?.data?.message || "Exchange Invoice created successfully");
  
        // addExchangeData(res?.data?.data);

        // i show the data based on user selection datagrid
        if (selectedSalesType === "DSALES NO INVOICE") {
          addDSalesExchangeData(res?.data?.data);
        } else {
          addExchangeData(res?.data?.data);
        }

        handleCloseCreatePopup();
      } else {
        // If stock is not available, show an error message
        toast.error("Stock not Available");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };  
  

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[50%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    Exchange Item
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button className="text-white hover:text-gray-300 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 14H4" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-red-600 focus:outline-none" onClick={handleCloseCreatePopup}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              

              {/* Exchange Item in Heading */}
              <form onSubmit={handleGetBarcodes} className="flex items-center w-full mt-6">
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
                  <IoBarcodeSharp size={24} />
                </button>
              </form>


              <div className="mt-6 w-full overflow-x-auto h-32">
                <table className="table-auto w-full">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-4 py-2">Item Code</th>
                      <th className="px-4 py-2">Item Size</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Item Price</th>
                      <th className="px-4 py-2">VAT (15%)</th>
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
                        <tr key={index} className="bg-gray-100 text-center">
                          <td className="border px-4 py-2">{row.SKU}</td>
                          <td className="border px-4 py-2">{row.ItemSize}</td>
                          <td className="border px-4 py-2">{row.Qty}</td>
                          <td className="border px-4 py-2">
                            {row.ItemPrice}
                          </td>
                          <td className="border px-4 py-2">{row.VAT}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              <div className="flex items-center justify-between w-full">
                <button
                  // type="submit"
                  onClick={handleExchangeItems}
                  className="p-3 border rounded bg-secondary hover:bg-[#424e9b] text-white flex items-center justify-center"
                >
                  Submit and Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeItemPopUp;
