import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";

const UpdateSalesOrderPopUp = ({ isVisible, setVisibility, refreshGTINData }) => {
  const [barcode, setBarcode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [quantity, setQuantiity] = useState("");
  const [description, setDescription] = useState("");
  const [startSize, setStartSize] = useState("");
  const [endSize, setEndSize] = useState("");
  const [loading, setLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)
  
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  // get this session data
  const updateProductsData = JSON.parse(sessionStorage.getItem("updateSalesOrderData"));

  // console.log(updateProductsData);

  useEffect(() => {
    setItemCode(updateProductsData?.ItemCode || "");
    setQuantiity(1 || "");
    setDescription(updateProductsData?.EnglishName || "");
    setStartSize(updateProductsData?.ProductSize || "");
    setEndSize(updateProductsData?.EndSize || "");
    setBarcode(updateProductsData?.GTIN || "");
  }, []);

  const handleAddGTIN = async (e) => {
    e.preventDefault();
    // console.log(itemCode, quantity, description, startSize, endSize);
    setLoading(true);

    try {
      const requestBody = {
        // GTIN: gtin,
        // itemCode: itemCode,
        // quantity: quantity,
        description: description,
        // startSize: startSize,
        // endSize: endSize,
      };

      //   console.log(requestBody);

      const response = await newRequest.put(`/itemCodes/v1/itemCode/${updateProductsData?.GTIN}`, requestBody, {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        }
      });
      // console.log(response?.data);
      toast.success(response?.data?.message || "GTIN Updated successfully");
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
              <form onSubmit={handleAddGTIN} className="w-full overflow-y-auto">
                <div className="flex justify-between items-center flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    {/* <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemCode" className={`text-secondary`}>
                          Item Code
                        </label>
                        <input
                          type="text"
                          id="itemCode"
                          value={itemCode}
                          onChange={(e) => setItemCode(e.target.value)}
                          placeholder="Enter item Code"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="quantity" className={`text-secondary`}>
                          Quantity
                        </label>
                        <input
                          type="text"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantiity(e.target.value)}
                          placeholder="Enter Quantity"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div> */}

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="englishName"
                          className={`text-secondary`}
                        >
                          Description
                        </label>
                        <textarea
                          type="text"
                          id="englishName"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter Description"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      {/* <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize" className={`text-secondary`}>
                          Size
                        </label>
                        <input
                          type="number"
                          id="startsize"
                          value={startSize}
                          onChange={(e) => setStartSize(e.target.value)}
                          placeholder="Enter Size"
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div> */}
                      {/* <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="endsize" className={`text-secondary`}>
                          End Size
                        </label>
                        <input
                          type="number"
                          id="endsize"
                          placeholder="Enter End Size"
                          value={endSize}
                          onChange={(e) => setEndSize(e.target.value)}
                          className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3`}
                          required
                        />
                      </div> */}
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
                        Update Changes
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

export default UpdateSalesOrderPopUp;
