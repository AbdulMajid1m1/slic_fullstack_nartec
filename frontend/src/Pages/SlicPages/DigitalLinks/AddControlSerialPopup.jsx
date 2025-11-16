import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";

const AddControlSerialPopup = ({ isVisible, setVisibility, refreshData, itemCode, size }) => {
  const { t, i18n } = useTranslation();
  const [qty, setQty] = useState(10);
  const [poNumber, setPoNumber] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supplierData, setSupplierData] = useState([]);
  const queryClient = useQueryClient();

  const handleClosePopup = () => {
    setVisibility(false);
    setQty(10);
    setPoNumber("");
    setSelectedSupplier(null);
  };

  const fetchAllSupplierData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        '/suppliers/v1?page=1&limit=100&status=approved'
      );
      
      // Map the API response to the expected data structure for Autocomplete
      const mappedData = response.data.data.suppliers.map(supplier => ({
        label: `${supplier.name} (${supplier.email})`,
        value: supplier.id,
        name: supplier.name,
        email: supplier.email,
        id: supplier.id
      }));

      setSupplierData(mappedData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      // console.error("Error fetching supplier data:", err);
      toast.error(err?.response?.data?.message || t("Failed to load suppliers. Please try again."));
    }
  };

  // Fetch supplier data when popup becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchAllSupplierData();
    }
  }, [isVisible]);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemCode) {
      toast.error(t("Item code is required"));
      return;
    }

    if (qty <= 0) {
      toast.error(t("Quantity must be greater than 0"));
      return;
    }

    if (!selectedSupplier) {
      toast.error(t("Please select a supplier"));
      return;
    }

    if (!poNumber.trim()) {
      toast.error(t("PO Number is required"));
      return;
    }

    setLoading(true);

    try {
      const response = await newRequest.post("/controlSerials", {
        ItemCode: itemCode,
        qty: qty,
        supplierId: selectedSupplier.id,
        poNumber: poNumber,
        size: size || ""
      });
      
      toast.success(response?.data?.message || t("Control serials added successfully"));
      queryClient.invalidateQueries(['purchaseOrders']);
      setLoading(false);
      handleClosePopup();
      // refreshData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || t("Error in adding control serials"));
      setLoading(false);
    }
  };

  return (
    <div>
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[40%] w-full">
            <div
              className="popup-form w-full"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    {t("Add Control Serials")}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleClosePopup}
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
                    <button
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleClosePopup}
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

              <form onSubmit={handleSubmit} className="w-full overflow-y-auto mt-6 px-4">
                <div className="space-y-4">
                  {/* PO Number and Size Row */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 font-body sm:text-base text-sm flex flex-col gap-2">
                      <label 
                        htmlFor="poNumber" 
                        className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                      >
                        {t("PO Number")} *:
                      </label>
                      <input
                        type="text"
                        id="poNumber"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        placeholder={t("Enter PO Number")}
                        className={`border w-full rounded-md border-secondary placeholder:text-gray-400 p-2 ${i18n.language==='ar'?'text-end':'text-start'}`}
                        required
                      />
                    </div>

                    {size && (
                      <div className="font-body sm:text-base text-sm flex flex-col justify-center gap-2">
                        <div className="text-blue-600 font-bold text-lg pt-9">
                          {t("Size")} : {size}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supplier Row */}
                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label 
                      className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                    >
                      {t("Supplier")} *:
                    </label>
                    <Autocomplete
                      options={supplierData}
                      getOptionLabel={(option) => option.label || ""}
                      value={selectedSupplier}
                      onChange={(event, newValue) => {
                        setSelectedSupplier(newValue);
                      }}
                      loading={isLoading}
                      disabled={isLoading}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{option.name}</span>
                            <span className="text-sm text-gray-600">{option.email}</span>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={isLoading ? t("Loading suppliers...") : t("selection / search")}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#021F69',
                              },
                            },
                          }}
                          required
                        />
                      )}
                      sx={{ width: '100%' }}
                    />
                    {selectedSupplier && (
                      <div className="text-xs text-gray-600 mt-1 flex flex-col gap-1">
                        <div><strong>{t("Name")}:</strong> {selectedSupplier.name}</div>
                        <div><strong>{t("Email")}:</strong> {selectedSupplier.email}</div>
                      </div>
                    )}
                  </div>

                  {/* Item Code Row */}
                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label 
                      htmlFor="itemCode" 
                      className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                    >
                      {t("Item Code")}
                    </label>
                    <input
                      type="text"
                      id="itemCode"
                      value={itemCode}
                      readOnly
                      className={`border w-full rounded-md border-secondary bg-gray-100 p-2 ${i18n.language==='ar'?'text-end':'text-start'}`}
                    />
                  </div>

                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label 
                      htmlFor="qty" 
                      className={`text-secondary font-semibold ${i18n.language==='ar'?'text-end':'text-start'}`}
                    >
                      {t("Quantity")} *
                    </label>
                    <input
                      type="number"
                      id="qty"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      placeholder={t("Enter quantity")}
                      min="1"
                      className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 ${i18n.language==='ar'?'text-end':'text-start'}`}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("Number of control serials to generate")}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>{t("Note")}:</strong> {t("This will generate")} {qty} {t("control serial numbers for item code")} <strong>{itemCode}</strong>
                      {size && <> {t("with size")} <strong>{size}</strong></>}
                    </p>
                  </div>

                  <div className="mt-6 py-4 border-t">
                    <Button
                      variant="contained"
                      style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                      type="submit"
                      disabled={loading}
                      className="w-full"
                      endIcon={
                        loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                    >
                      {t("GENERATE CONTROL SERIALS")}
                    </Button>
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

export default AddControlSerialPopup;