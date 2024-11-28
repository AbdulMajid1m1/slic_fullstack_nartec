import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import "./AddGTIN.css";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

const UpdateGTINPopUp = ({ isVisible, setVisibility, refreshGTINData }) => {
  const { t, i18n } = useTranslation();
  const [barcode, setBarcode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [quantity, setQuantiity] = useState("");
  const [description, setDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");
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
  const updateProductsData = JSON.parse(sessionStorage.getItem("updateListOfEmployeeData"));

  // console.log(updateProductsData);

  useEffect(() => {
    setItemCode(updateProductsData?.ItemCode || "");
    setQuantiity(1 || "");
    setDescription(updateProductsData?.EnglishName || "");
    setArabicDescription(updateProductsData?.ArabicName || "");
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
        // quantity: quantity,
        itemCode: itemCode,
        description: description,
        startSize: startSize,
        ArabicName: arabicDescription,
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
                    {t("Update Products Barcodes")}
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
              <div className={`flex justify-between flex-col  sm:gap-3 gap-3 mt-5 ${i18n.language==='ar'? 'sm:flex-row-reverse':'sm:flex-row'}`}>
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      {/* <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="quantity"className={`text-secondary ${i18n.language==='ar'?'text-end':'text-start'}`}>
                          Quantity
                        </label>
                        <input
                          type="text"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantiity(e.target.value)}
                          placeholder="Enter Quantity"
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${i18n.language==='ar'?'text-end':'text-start'}`}
                          required
                        />
                      </div> */}
                    </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="englishName"
                         className={`text-secondary ${i18n.language==='ar'?'text-end':'text-start'}`}
                        >
                          {t("Description")}
                        </label>
                        <textarea
                          type="text"
                          id="englishName"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={t("Enter Description")}
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${i18n.language==='ar'?'text-end':'text-start'}`}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label
                          htmlFor="arabicName"
                         className={`text-secondary ${i18n.language==='ar'?'text-end':'text-start'}`}
                        >
                          {t("Arabic Description")}
                        </label>
                        <textarea
                          type="text"
                          id="arabicName"
                          value={arabicDescription}
                          onChange={(e) => setArabicDescription(e.target.value)}
                          placeholder={t("Enter Arabic Description")}
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${i18n.language==='ar'?'text-end':'text-start'}`}
                          required
                        />
                      </div>

                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="startsize"className={`text-secondary ${i18n.language==='ar'?'text-end':'text-start'}`}>
                          Size
                        </label>
                        <input
                          type="text"
                          id="startsize"
                          value={startSize}
                          onChange={(e) => setStartSize(e.target.value)}
                          placeholder="Enter Size"
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${i18n.language==='ar'?'text-end':'text-start'}`}
                          required
                        />
                      </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemCode"className={`text-secondary ${i18n.language==='ar'?'text-end':'text-start'}`}>
                          Item Code
                        </label>
                        <input
                          type="text"
                          id="itemCode"
                          value={itemCode}
                          onChange={(e) => setItemCode(e.target.value)}
                          placeholder="Enter item Code"
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${i18n.language==='ar'?'text-end':'text-start'}`}
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
                        {t("Update Changes")}
                      </Button>
                    </div>
                  </div>

                  <div className="sm:w-1/3 w-full flex flex-col justify-start items-center lg:mt-3 md:mt-3 gap-3">
                    <Barcode
                      value={barcode}
                    //   format="EAN13"
                      height={75}
                      width={1.3}
                      background="transparent"
                    />

                    <QRCodeSVG value={`${barcode}, ${itemCode}, ${quantity}, ${description}, ${startSize}`} height={120} width={150} />
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

export default UpdateGTINPopUp;
