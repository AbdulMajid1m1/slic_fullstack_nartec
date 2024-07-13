import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import "./AddGTIN.css";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";

const AddGTINPopUp = ({ isVisible, setVisibility, refreshGTINData }) => {
  const [itemCode, setItemCode] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState("");
  const [startSize, setStartSize] = useState(30);
  const [endSize, setEndSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

  useEffect(() => {
    setQuantity(endSize - startSize + 1);
  }, [startSize, endSize]);

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const handleAddGTIN = async (e) => {
    e.preventDefault();
    // console.log("1", itemCode, "2", quantity, "3", description, "4", startSize, "5", endSize);
    setLoading(true);

    try {
      const requestBody = {
        itemCode: itemCode,
        quantity: quantity,
        description: description,
        startSize: startSize,
        endSize: endSize,
      };

      const response = await newRequest.post("/itemCodes/v2/itemCode", requestBody, {
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
                    Generating Products Barcodes
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
                <div className="flex justify-between flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
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
                          readOnly
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
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize" className={`text-secondary`}>
                          Start Size
                        </label>
                        <select
                          id="startsize"
                          value={startSize}
                          onChange={(e) => setStartSize(parseInt(e.target.value))}
                          className={`border w-full rounded-md border-secondary p-2 mb-3`}
                        >
                          {Array.from({ length: 21 }, (_, i) => 30 + i).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="endsize" className={`text-secondary`}>
                          End Size
                        </label>
                        <select
                          id="endsize"
                          value={endSize}
                          onChange={(e) => setEndSize(parseInt(e.target.value))}
                          className={`border w-full rounded-md border-secondary p-2 mb-3`}
                        >
                          {Array.from({ length: 21 }, (_, i) => 30 + i).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
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
                        Generate the Barcodes
                      </Button>
                    </div>
                  </div>

                  <div className="sm:w-1/3 w-full flex flex-col justify-start items-center lg:mt-0 md:mt-3 gap-3">
                    <Barcode
                      value={"192837129739"}
                      format="EAN13"
                      height={75}
                      width={1.3}
                      background="transparent"
                    />

                    <QRCodeSVG value={`${itemCode}, ${startSize}, ${description}`} height={120} width={150} />

                    <p className="text-secondary font-sans">Total Barcodes: {quantity}</p>
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

export default AddGTINPopUp;
