import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import "./AddGTIN.css";

const UpdateGTIN = ({ isVisible, setVisibility, refreshGTINData }) => {
  const [gtin, setGTIN] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [whLocation, setWHLocation] = useState("");
  const [binLocation, setBinLocation] = useState("");
  const [qrCodeInternational, setQRCodeInternational] = useState("");
  const [modelName, setModelName] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [productType, setProductType] = useState("");
  const [brandName, setBrandName] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [productUnit, setProductUnit] = useState("");
  const [productSize, setProductSize] = useState("");
  const [loading, setLoading] = useState(false);


  // get this session data
  const updateProductsData = JSON.parse(sessionStorage.getItem("updateListOfEmployeeData"));

//   console.log(updateProductsData);
  
  useEffect(() => {
    setGTIN(updateProductsData?.GTIN)
    setItemCode(updateProductsData?.ItemCode)
    setEnglishName(updateProductsData?.EnglishName)
    setArabicName(updateProductsData?.ArabicName)
    setLotNo(updateProductsData?.LotNo)
    setExpiryDate(updateProductsData?.ExpiryDate ? new Date(updateProductsData.ExpiryDate).toISOString().split('T')[0] : "");
    setSerialNumber(updateProductsData?.sERIALnUMBER)
    setItemQty(updateProductsData?.ItemQty)
    setWHLocation(updateProductsData?.WHLocation)
    setBinLocation(updateProductsData?.BinLocation)
    setQRCodeInternational(updateProductsData?.QRCodeInternational)
    setModelName(updateProductsData?.ModelName)
    setProductionDate(updateProductsData?.ProductionDate ? new Date(updateProductsData.ProductionDate).toISOString().split('T')[0] : "");
    setProductType(updateProductsData?.ProductType)
    setBrandName(updateProductsData?.BrandName)
    setPackagingType(updateProductsData?.PackagingType)
    setProductUnit(updateProductsData?.ProductUnit)
    setProductSize(updateProductsData?.ProductSize)

  },[])

  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  const handleAddGTIN = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ItemCode: itemCode,
        EnglishName: englishName,
        ArabicName: arabicName,
        LotNo: lotNo,
        ExpiryDate: expiryDate,
        sERIALnUMBER: serialNumber,
        ItemQty: Number(itemQty),
        WHLocation: whLocation,
        BinLocation: binLocation,
        QRCodeInternational: qrCodeInternational,
        ModelName: modelName,
        ProductionDate: productionDate,
        ProductType: productType,
        BrandName: brandName,
        PackagingType: packagingType,
        ProductUnit: productUnit,
        ProductSize: productSize,
      };

    //   console.log(payload);

      const response = await newRequest.put(`/itemCodes/v1/itemCode/${updateProductsData?.GTIN}`, payload);
    //   console.log(response?.data)
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
          <div className="popup-container h-auto sm:w-[45%] w-full">
            <div className="popup-form w-full" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <form
                onSubmit={handleAddGTIN}
                className="w-full overflow-y-auto"
              >
                <h2 className={`text-secondary font-sans font-semibold text-2xl`}>
                  Update GTIN Products
                </h2>
                <div className="flex flex-col sm:gap-3 gap-3 mt-5">
                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="gtin" className={`text-secondary`}>GTIN</label>
                      <input
                        type="text"
                        id="gtin"
                        value={gtin}
                        onChange={(e) => setGTIN(e.target.value)}
                        placeholder="Enter GTIN"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="itemCode" className={`text-secondary`}>Item Code</label>
                      <input
                        type="text"
                        id="itemCode"
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                        placeholder="Enter Item Code"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="englishName" className={`text-secondary`}>English Name</label>
                      <input
                        type="text"
                        id="englishName"
                        value={englishName}
                        onChange={(e) => setEnglishName(e.target.value)}
                        placeholder="Enter English Name"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="arabicName" className={`text-secondary`}>Arabic Name</label>
                      <input
                        type="text"
                        id="arabicName"
                        value={arabicName}
                        onChange={(e) => setArabicName(e.target.value)}
                        placeholder="Enter Arabic Name"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="lotNo" className={`text-secondary`}>Lot No</label>
                      <input
                        type="text"
                        id="lotNo"
                        value={lotNo}
                        onChange={(e) => setLotNo(e.target.value)}
                        placeholder="Enter Lot No"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="expiryDate" className={`text-secondary`}>Expiry Date</label>
                      <input
                        type="date"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="serialNumber" className={`text-secondary`}>Serial Number</label>
                      <input
                        type="text"
                        id="serialNumber"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Enter Serial Number"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="itemQty" className={`text-secondary`}>Item Quantity</label>
                      <input
                        type="number"
                        id="itemQty"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        placeholder="Enter Item Quantity"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="whLocation" className={`text-secondary`}>Warehouse Location</label>
                      <input
                        type="text"
                        id="whLocation"
                        value={whLocation}
                        onChange={(e) => setWHLocation(e.target.value)}
                        placeholder="Enter Warehouse Location"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="binLocation" className={`text-secondary`}>Bin Location</label>
                      <input
                        type="text"
                        id="binLocation"
                        value={binLocation}
                        onChange={(e) => setBinLocation(e.target.value)}
                        placeholder="Enter Bin Location"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="qrCodeInternational" className={`text-secondary`}>QR Code International</label>
                      <input
                        type="text"
                        id="qrCodeInternational"
                        value={qrCodeInternational}
                        onChange={(e) => setQRCodeInternational(e.target.value)}
                        placeholder="Enter QR Code URL"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="modelName" className={`text-secondary`}>Model Name</label>
                      <input
                        type="text"
                        id="modelName"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="Enter Model Name"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="productionDate" className={`text-secondary`}>Production Date</label>
                      <input
                        type="date"
                        id="productionDate"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="productType" className={`text-secondary`}>Product Type</label>
                      <input
                        type="text"
                        id="productType"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        placeholder="Enter Product Type"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="brandName" className={`text-secondary`}>Brand Name</label>
                      <input
                        type="text"
                        id="brandName"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Enter Brand Name"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="packagingType" className={`text-secondary`}>Packaging Type</label>
                      <input
                        type="text"
                        id="packagingType"
                        value={packagingType}
                        onChange={(e) => setPackagingType(e.target.value)}
                        placeholder="Enter Packaging Type"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="productUnit" className={`text-secondary`}>Product Unit</label>
                      <input
                        type="text"
                        id="productUnit"
                        value={productUnit}
                        onChange={(e) => setProductUnit(e.target.value)}
                        placeholder="Enter Product Unit"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="productSize" className={`text-secondary`}>Product Size</label>
                      <input
                        type="text"
                        id="productSize"
                        value={productSize}
                        onChange={(e) => setProductSize(e.target.value)}
                        placeholder="Enter Product Size"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center items-center gap-8 mt-10 mb-3">
                  <button
                    type="button"
                    className="px-5 py-2 w-[30%] rounded-sm bg-primary text-white font-body text-sm"
                    onClick={handleCloseCreatePopup}
                  >
                    Close
                  </button>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                    type="submit"
                    disabled={loading}
                    className="w-[70%] ml-2"
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <SendIcon />
                      )
                    }
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateGTIN;
