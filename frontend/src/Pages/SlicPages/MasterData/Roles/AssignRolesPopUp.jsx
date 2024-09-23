import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import newRequest from "../../../../utils/userRequest";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

const AssignRolesPopUp = ({ isVisible, setVisibility, refreshRolesData }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [rolesTypes, setRolesTypes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)
  
  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };
  // get this session data
  const updateProductsData = JSON.parse(sessionStorage.getItem("updateUserData"));

  // Fetch roles from the API
  const fetchRoles = async () => {
    try {
      const response = await newRequest.get("/roles/v1/get-all-roles");
      if (response?.data?.success) {
        setRolesTypes(response?.data?.data); // Set roles to state
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error fetching roles");
    }
  };


  useEffect(() => {
    setEmail(updateProductsData?.UserLoginID);

    fetchRoles();
  }, []);


  const handleRolesTypesChange = (event, value) => {
    setSelectedRoles(value);
    console.log(value);
    setSelectAll(false); // Uncheck "Select All" when individual options are selected/deselected
  };

 
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    // If "Select All" is checked, set all options as selected; otherwise, clear selections
    setSelectedRoles(isChecked ? rolesTypes : []);
    setSelectAll(isChecked);
  };


  const handleAddRoles = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        userLoginID: email,
        roleNames: selectedRoles.map((role) => role.RoleName),
        // roleName: selectedRoles?.RoleName,
      };
        // console.log(requestBody);

      const response = await newRequest.post('roles/v1/assign-roles', requestBody, {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        }
      });
      // console.log(response?.data);
      toast.success(response?.data?.message || "Role Assigned successfully");
      setLoading(false);
      handleCloseCreatePopup();
      refreshRolesData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error in adding User");
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
                    {t("Assign Roles")}
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
              <form onSubmit={handleAddRoles} className="w-full overflow-y-auto">
                <div className="flex justify-between items-center flex-col sm:flex-row sm:gap-3 gap-3 mt-5">
                  <div className="w-full lg:mt-0 md:mt-3 mt-6">
                    <div className="flex justify-center items-center sm:gap-3 gap-3">
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="itemCode" className={`text-secondary ${
                            i18n.language === "ar" ? "text-end" : "text-start"
                          }`}>
                          {t("User Email")}
                        </label>
                        <input
                          type="text"
                          id="itemCode"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("Enter your Email")}
                           className={`border w-full rounded-md border-secondary placeholder:text-secondary p-2 mb-3  ${
                            i18n.language === "ar" ? "text-end" : "text-start"
                          }`}
                          required
                        />
                      </div>
                    </div>
                      <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="SelectRoles" className={`text-secondary ${
                            i18n.language === "ar" ? "text-end" : "text-start"
                          }`}>
                          {t("User Roles")} 
                        </label>
                        <Autocomplete
                            multiple
                            id='SelectRoles'
                            options={rolesTypes}
                            getOptionLabel={(option) => option.RoleName}
                            value={selectedRoles}
                            onChange={handleRolesTypesChange}
                            filterSelectedOptions
                            renderInput={(params) => (
                            <TextField
                                autoComplete="off"
                                {...params}
                                label={t('Select Roles')}
                                placeholder={'Select Roles'}
                                variant='outlined'
                                
                            />
                            )}
                            required
                        />
                        <div className={`${i18n.language === "ar" ? "direction-rtl" : "direction-ltr" }`}>
                            <label>
                            <input
                                type='checkbox'
                                checked={selectAll}
                                onChange={handleSelectAllChange}
                            />
                            {t("Select All")}
                            </label>
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRolesPopUp;
