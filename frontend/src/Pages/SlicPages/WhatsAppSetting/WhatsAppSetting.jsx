import React, { useEffect, useState, useRef } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import { CircleLoader } from 'react-spinners';
import QRCodePopup from "../../../components/WhatsAppQRCode/QRCodePopup";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";

const WhatsAppSetting = () => {
  const { t, i18n } = useTranslation();
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkSesstionLoader, setCheckSesstionLoader] = useState(false);
  const [logoutSesstionLoader, setLogoutSesstionLoader] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [qrCode, setQrCode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  const fetchAttempts = useRef(0);
  const MAX_FETCH_ATTEMPTS = 3;

  const fetchWhatsAppData = async (showToast = false) => {
    // Don't fetch if we've tried too many times
    if (fetchAttempts.current >= MAX_FETCH_ATTEMPTS) {
      console.log("Max fetch attempts reached, skipping...");
      return;
    }

    setLoading(true);
    fetchAttempts.current++;
    
    try {
      const res = await newRequest.get('whatsapp/getUserProfile');
      
      if (!isMounted.current) return; // Don't update state if unmounted
      
      const userData = res.data.data;
      setUserName(userData?.name || '');
      setMobileNumber(userData?.number || '');
      setProfilePicUrl(userData?.profilePicUrl || null);
      setIsConnected(true);
      
      // Reset attempts on success
      fetchAttempts.current = 0;
      
      // Only show success toast if explicitly requested
      if (showToast && userData?.name) {
        toast.success(t("Profile loaded successfully"));
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      console.error("Error fetching WhatsApp data:", err);
      setIsConnected(false);
      
      // Clear profile data on error
      setUserName('');
      setMobileNumber('');
      setProfilePicUrl(null);
      
      // Only show error for non-400 errors (400 means not connected, which is expected)
      if (err?.response?.status !== 400 && showToast) {
        toast.error(err?.response?.data?.message || t("Could not load profile"));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAttempts.current = 0;
    
    // Initial fetch after a delay
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        fetchWhatsAppData(false);
      }
    }, 3000);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, []); // Only run once on mount

  // Connect to WhatsApp API
  const checkSession = async () => {
    setCheckSesstionLoader(true);
    try {
      const response = await newRequest.get("/whatsapp/checkSession");
      const data = response.data;
      
      if (data.status === "success") {
        toast.success(t("Already connected to WhatsApp"));
        // Fetch profile data after successful connection
        setTimeout(() => fetchWhatsAppData(true), 2000);
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        setShowPopup(true);
      } else if (data.status === "initializing") {
        toast.info(t("WhatsApp is initializing, please wait..."));
        // Retry after a delay
        setTimeout(() => checkSession(), 3000);
        return; // Don't set loader to false yet
      }
    } catch (error) {
      console.error("Error checking session:", error);
      toast.error(error?.response?.data?.error || t("Failed to check WhatsApp connection"));
    } finally {
      setCheckSesstionLoader(false);
    }
  };

  // Logout API
  const logOutSession = async () => {
    setLogoutSesstionLoader(true);
    try {
      const response = await newRequest.post("/whatsapp/logoutWhatsApp");
      const data = response.data;
      
      // Clear profile data
      setUserName('');
      setMobileNumber('');
      setProfilePicUrl(null);
      setIsConnected(false);
      fetchAttempts.current = 0;
      
      toast.success(data.message || t("Logged out successfully"));
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error(err?.response?.data?.message || t("Logout failed"));
    } finally {
      setLogoutSesstionLoader(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setQrCode(null);

    // Fetch profile data after QR scan
    setTimeout(() => {
      if (isMounted.current) {
        fetchWhatsAppData(true);
      }
    }, 5000);
  };

  return (
    <div>
      {loading && (
        <div
          className="loading-spinner-background"
          style={{
            zIndex: 9999,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircleLoader
            size={45}
            color={"#1D2F90"}
            loading={loading}
          />
        </div>
      )}
      <SideNav>
        <div>
          <RightDashboardHeader title={t("SLIC User WhatsApp Profile")} />
        </div>

        <section className="py-3 my-auto dark:bg-gray-900">
          <div className="lg:w-[80%] md:w-[90%] xs:w-[96%] mx-auto flex gap-4 mb-6">
            <div className="lg:w-[88%] md:w-[80%] sm:w-[88%] xs:w-full mx-auto shadow-2xl p-4 rounded-xl h-fit self-center dark:bg-gray-800/40">
              <div>
                <h1 className={`lg:text-3xl md:text-2xl sm:text-xl xs:text-xl font-sans font-semibold text-secondary mb-2 dark:text-white ${
                  i18n.language === "ar" ? "text-end" : "text-start"
                }`}>
                  {t("Profile")}
                </h1>
                
                {/* Connection Status Indicator */}
                <div className={`mb-4 flex items-center gap-2 ${
                  i18n.language === "ar" ? "justify-end" : "justify-start"
                }`}>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isConnected ? t("Connected") : t("Not Connected")}
                  </span>
                </div>

                <div>
                  <img
                    className="mx-auto flex justify-center w-[221px] h-[221px] bg-blue-300/20 rounded-full bg-cover bg-center bg-no-repeat"
                    src={profilePicUrl || "https://via.placeholder.com/221"}
                    alt="slic"
                  />

                  <h2 className="text-center mt-1 font-semibold dark:text-gray-300">
                    {t("SLIC User Profile")}
                  </h2>
                  
                  <div className="flex lg:flex-row md:flex-col sm:flex-col xs:flex-col gap-2 justify-center w-full">
                    <div className={`w-full mb-4 mt-6 ${
                      i18n.language === "ar" ? "text-end" : "text-start"
                    }`}>
                      <label
                        htmlFor="userName"
                        className={`mb-2 dark:text-gray-300 ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      >
                        {t("SLIC User Name")}
                      </label>
                      <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={`mt-2 p-2 w-full border rounded-lg border-secondary ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                        placeholder={t("User Name")}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex lg:flex-row md:flex-col sm:flex-col xs:flex-col gap-2 justify-center w-full">
                    <div className={`w-full ${
                      i18n.language === "ar" ? "text-end" : "text-start"
                    }`}>
                      <label
                        htmlFor="mobileNumber"
                        className={`mb-2 dark:text-gray-300 ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      >
                        {t("Mobile Number")}
                      </label>
                      <input
                        id="mobileNumber"
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className={`mt-2 p-2 w-full border rounded-lg border-secondary ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                        placeholder={t("Mobile Number")}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-4 text-white text-lg font-semibold">
                    <Button
                      onClick={checkSession}
                      variant="contained"
                      disabled={checkSesstionLoader}
                      style={{ backgroundColor: "#F35C08" }}
                      className="sm:w-[70%] w-full ml-2"
                      endIcon={
                        checkSesstionLoader ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : null
                      }
                    >
                      {t("WhatsApp Connection")}
                    </Button>

                    <Button
                      onClick={logOutSession}
                      variant="contained"
                      disabled={logoutSesstionLoader || !isConnected}
                      style={{ backgroundColor: "#1d2f90" }}
                      className="sm:w-[70%] w-full ml-2"
                      endIcon={
                        logoutSesstionLoader ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : null
                      }
                    >
                      {t("Log-out")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp QR Code PopUp */}
        {showPopup && (
          <QRCodePopup qrCode={qrCode} onClose={handleClosePopup} />
        )}
      </SideNav>
    </div>
  );
};

export default WhatsAppSetting;