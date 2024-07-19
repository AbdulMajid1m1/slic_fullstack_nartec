import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";

const AddSalesOrderPopUp = ({ isVisible, setVisibility, refreshGTINData }) => {
  const [soNumber, setSoNumber] = useState("");
  const [soCustName, setSoCustName] = useState(0);
  const [soLocnCode, setSoLocnCode] = useState("");
  const [delLocn, setDelLocn] = useState(30);
  const [status, setStatus] = useState(50);
  const [headSysId, setHeadSysId] = useState(50);
  const [loading, setLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)


  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const handleAddSalesOrder = async (e) => {
    e.preventDefault();
    // console.log("1", itemCode, "2", quantity, "3", description, "4", startSize, "5", endSize);
    setLoading(true);

    try {
      const requestBody = {
        "SO_NUMBER": "SO001",
        "SO_CUST_NAME": "John Doe",
        "SO_LOCN_CODE": "LOC001",
        "DEL_LOCN": "Warehouse A",
        "STATUS": "Pending",
        "HEAD_SYS_ID": 12345.67
      };

      const response = await newRequest.post("/salesOrders/v1/create", requestBody, {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        },
      });
      toast.success(response?.data?.message || "GTIN added successfully");
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
                    Add Sales Orders
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
              <form onSubmit={handleAddSalesOrder} className="w-full overflow-y-auto">
                <div className="flex justify-between flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemCode" className={`text-secondary`}>
                          So Number
                        </label>
                        <input
                          type="text"
                          id="itemCode"
                          value={soNumber}
                          onChange={(e) => setSoNumber(e.target.value)}
                          placeholder="Enter So Number"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="quantity" className={`text-secondary`}>
                          So Cust Name
                        </label>
                        <input
                          type="text"
                          id="quantity"
                          value={soCustName}
                          onChange={(e) => setSoCustName(e.target.value)}
                          placeholder="Enter So Cust Name"
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
                          So Locn Code
                        </label>
                        <input
                          type="text"
                          id="englishName"
                          value={soLocnCode}
                          onChange={(e) => setSoLocnCode(e.target.value)}
                          placeholder="Enter So Locn Code"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize" className={`text-secondary`}>
                          Del Locn
                        </label>
                        <input
                          type="text"
                          id="startsize"
                          value={delLocn}
                          onChange={(e) => setDelLocn(e.target.value)}
                          placeholder="Enter "
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="endsize" className={`text-secondary`}>
                          Status
                        </label>
                        <select
                          id="endsize"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className={`border w-full rounded-md border-secondary p-2 mb-3`}
                        >
                          <option value="">-select status-</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize" className={`text-secondary`}>
                          Head System ID
                        </label>
                        <input
                          type="text"
                          id="startsize"
                          value={headSysId}
                          onChange={(e) => setHeadSysId(e.target.value)}
                          placeholder="Enter Head System ID"
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
                        Add Sales Order
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

export default AddSalesOrderPopUp;
