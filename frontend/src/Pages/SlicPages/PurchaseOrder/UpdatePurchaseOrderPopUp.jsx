import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";

const UpdatePurchaseOrderPopUp = ({ isVisible, setVisibility, refreshGTINData }) => {
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(0);
  const [supplierName, setSupplierName] = useState("");
  const [poStatus, setPoStatus] = useState('');
  const [headSysId, setHeadSysId] = useState('');
  const [loading, setLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)
  
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  // get this session data
  const updateProductsData = JSON.parse(sessionStorage.getItem("updatePurchaseOrderData"));

//   console.log(updateProductsData);

  useEffect(() => {
    setPoNumber(updateProductsData?.PONumber);
    setPoDate(updateProductsData?.PODate);
    setSupplierName(updateProductsData?.SupplierName);
    setPoStatus(updateProductsData?.POStatus);
    setHeadSysId(updateProductsData?.Head_SYS_ID);
  }, []);

  const handleUpdatePurchaseOrder = async (e) => {
    e.preventDefault();
    // console.log(itemCode, quantity, description, startSize, endSize);
    setLoading(true);

    try {
      const requestBody = {
        PONumber: poNumber,
        PODate: poDate,
        SupplierName: supplierName,
        POStatus: poStatus,
        Head_SYS_ID: headSysId,
      };

      //   console.log(requestBody);

      const response = await newRequest.put(`/foreignPO/v1/foreignPO/${updateProductsData?.tblPOFPOMasterID}`, requestBody, {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        }
      });
      // console.log(response?.data);
      toast.success(response?.data?.message || "Purchase Order Updated successfully");
      setLoading(false);
      handleCloseCreatePopup();
      refreshGTINData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error in adding GTIN");
      console.log(error);
      setLoading(false);
    }
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
                    Update Sales Order
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button className="text-white hover:text-gray-300 focus:outline-none"
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
                    <button className="text-white hover:text-gray-300 focus:outline-none"
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
              <form onSubmit={handleUpdatePurchaseOrder} className="w-full overflow-y-auto">
              <div className="flex justify-between flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemCode" className={`text-secondary`}>
                          Purchase Order Number
                        </label>
                        <input
                          type="text"
                          id="itemCode"
                          value={poNumber}
                          onChange={(e) => setPoNumber(e.target.value)}
                          placeholder="Enter Purchase Order Number"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="quantity" className={`text-secondary`}>
                          Purchase Order Date
                        </label>
                        <input
                          type="date"
                          id="quantity"
                          value={poDate}
                          onChange={(e) => setPoDate(e.target.value)}
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3 bg-gray-100`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="englishName"
                          className={`text-secondary`}
                        >
                          Supplier Name
                        </label>
                        <input
                          type="text"
                          id="englishName"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          placeholder="Enter Supplier Name"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize" className={`text-secondary`}>
                          PO Status
                        </label>
                        <select
                          id="startsize"
                          value={poStatus}
                          onChange={(e) => setPoStatus(e.target.value)}
                          className={`border w-full rounded-md border-secondary p-2 mb-3`}
                        >
                          <option value="">Select PO Status</option>
                          <option value="Active">Active</option>
                          <option value="inActive">InActive</option>
                        </select>
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="endsize" className={`text-secondary`}>
                          Head SYS ID
                        </label>
                        <input
                          type="text"
                          id="endsize"
                          value={headSysId}
                          onChange={(e) => setHeadSysId(e.target.value)}
                          placeholder="Enter Head SYS ID"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                        type="submit"
                        disabled={loading}
                        className="w-full ml-2"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <SendIcon />
                          )
                        }
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePurchaseOrderPopUp;
