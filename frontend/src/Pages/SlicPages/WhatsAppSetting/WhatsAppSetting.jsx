import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import { CircleLoader } from 'react-spinners';
import QRCodePopup from "../../../components/WhatsAppQRCode/QRCodePopup";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const WhatsAppSetting = () => {
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkSesstionLoader, setCheckSesstionLoader] = useState(false);
  const [logoutSesstionLoader, setLogoutSesstionLoader] = useState(false);

  const [qrCode, setQrCode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchWhatsAppData = async () => {
    setLoading(true);
    try {
        const res = await newRequest.get('whatsapp/getUserProfile')
        // console.log(res.data);
        const userData = res.data.data;
        setUserName(userData?.name)
        setMobileNumber(userData?.number)
        setProfilePicUrl(userData?.profilePicUrl)
        toast.success(res.data.message || "SLIC User Connected Successfully.");
    } 
    catch (err) {
        // console.error(err);
        toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
        setLoading(false);
    }
  }
  
  // useEffect(() => {
  //   setTimeout(() => {
  //     fetchWhatsAppData();
  //   },5000)
  // }, [])
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWhatsAppData();
    }, 5000);
  
    return () => {
      clearTimeout(timeoutId); // Clean up the timeout if the component unmounts
    };
  }, []);
  


 // connect to whatsApp Api
 const checkSession = async () => {
    setCheckSesstionLoader(true);
    try {
      const reponse = await newRequest.get("/whatsapp/checkSession");
    //   console.log(reponse);
      const data = reponse.data;
      if (data.status === "failure" && data.qrCode) {
        setQrCode(data.qrCode);
        // console.log("QR code:", data.qrCode);
        setShowPopup(true);
      }
      setCheckSesstionLoader(false);
    } catch (error) {
      console.error("Error checking session:", error);
      setCheckSesstionLoader(false);
    }
  };   


 // log-out Api
 const logOutSession = async () => {
    setLogoutSesstionLoader(true);
    try {
      const reponse = await newRequest.post("/whatsapp/logoutWhatsApp");
      const data = reponse.data;
    //   console.log(data);
      toast.success(data.message || "SLIC User Logged Out Successfully.");
      setLogoutSesstionLoader(false);
    } catch (err) {
      console.log("Error checking session:", err);
      toast.error(err?.response?.data?.message || "Something went wrong.");
      setLogoutSesstionLoader(false);
    }
  };   

  const handleClosePopup = () => {
    setShowPopup(false);

    setTimeout(() => {
      fetchWhatsAppData();
    }, 5000)
  };

  return (
    <div>
         {loading &&

            <div className='loading-spinner-background'
                style={{
                    zIndex: 9999, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed'


                }}
            >
                <CircleLoader
                    size={45}
                    color={"#1D2F90"}
                    // height={4}
                    loading={loading}
                />
            </div>
            }
      <SideNav>
        <div>
          <RightDashboardHeader title={"SLIC User WhatsApp Profile"} />
        </div>

        <section class="py-3 my-auto dark:bg-gray-900">
          <div class="lg:w-[80%] md:w-[90%] xs:w-[96%] mx-auto flex gap-4 mb-6">
            <div class="lg:w-[88%] md:w-[80%] sm:w-[88%] xs:w-full mx-auto shadow-2xl p-4 rounded-xl h-fit self-center dark:bg-gray-800/40">
              <div class="">
                <h1 class="lg:text-3xl md:text-2xl sm:text-xl xs:text-xl font-sans font-semibold text-secondary mb-2 dark:text-white">
                  Profile
                </h1>
                <div>
                    <img 
                      class="mx-auto flex justify-center w-[221px] h-[221px] bg-blue-300/20 rounded-full bg-cover bg-center bg-no-repeat" 
                      src={profilePicUrl} alt="slic"
                    />
                      
                  <h2 class="text-center mt-1 font-semibold dark:text-gray-300">
                    SLIC User Profile
                  </h2>
                  <div class="flex lg:flex-row md:flex-col sm:flex-col xs:flex-col gap-2 justify-center w-full">
                    <div class="w-full  mb-4 mt-6">
                      <label for="" class="mb-2 dark:text-gray-300">
                        SLIC User Name
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        class="mt-2 p-2 w-full border rounded-lg border-secondary"
                        placeholder="User Name"
                        readOnly
                      />
                    </div>
                  </div>

                  <div class="flex lg:flex-row md:flex-col sm:flex-col xs:flex-col gap-2 justify-center w-full">
                    <div class="w-full">
                      <label for="" class="mb-2 dark:text-gray-300">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        class="mt-2 p-2 w-full border rounded-lg border-secondary"
                        placeholder="Mobile Number"
                        readOnly
                      />
                    </div>
                  </div>

                  <div class="flex justify-between gap-3 mt-4 text-white text-lg font-semibold">
                    <Button 
                     onClick={checkSession}
                     variant="contained"
                        style={{ backgroundColor:"#F35C08" }}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                         checkSesstionLoader ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                     >
                      WhatsApp Connection
                    </Button>

                    <Button 
                     onClick={logOutSession}
                     variant="contained"
                        style={{ backgroundColor:"#1d2f90" }}
                        className="sm:w-[70%] w-full ml-2"
                        endIcon={
                         logoutSesstionLoader ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : null
                        }
                    >
                      Log-out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What QR Code PopUp */}
        {showPopup && <QRCodePopup qrCode={qrCode} onClose={handleClosePopup} />}
      </SideNav>
    </div>
  );
};

export default WhatsAppSetting;
