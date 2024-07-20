import React, { useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import sliclogo from "../../../Images/sliclogo.png"
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const UserProfile = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      <SideNav>
        <div>
            <RightDashboardHeader title={'User Profile'}/>
        </div>
        
        <div className="h-auto w-full">
          <div className="h-auto w-full p-4 bg-white shadow-xl rounded-md pb-10">

          <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
                {/* Image container */}
                <div className="flex justify-center items-center gap-7 flex-wrap mb-4">
                  <div className="border-2 border-secondary h-56 w-56 relative flex justify-center">
                    {sliclogo && (
                      <div className="h-56 flex justify-center items-center object-contain w-auto">
                        <img
                          src={sliclogo}
                          className="h-56 w-56 object-contain"
                          alt="Selected Image"
                        />
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
             <div className="flex flex-col gap-3 sm:space-x-40 sm:flex-row sm:justify-between">
                <div className={`font-sans sm:text-base text-sm text-secondary flex flex-col gap-2 w-full`}>
                  <label htmlFor="username">
                    Users Name
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="border border-secondary rounded-md p-2 mb-3"
                  />
                </div>

                <div className={`font-sans sm:text-base text-sm text-secondary flex flex-col gap-2 w-full`}>
                  <label htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="border border-secondary rounded-md p-2 mb-3"
                  />
                </div>
              </div>   

              <div className="flex flex-col gap-3 sm:space-x-40 sm:flex-row sm:justify-between sm:mt-6 mt-3">
                <div className={`font-sans sm:text-base text-sm text-secondary flex flex-col gap-2 w-full`}>
                  <label htmlFor="position">
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    className="border border-secondary rounded-md p-2 mb-3"
                  />
                </div>

                <div className={`font-sans sm:text-base text-sm text-secondary flex flex-col gap-2 w-full`}>
                  <label htmlFor="mobilenumber">
                    Mobile Number
                  </label>
                  <input
                    id="mobilenumber"
                    type="number"
                    className="border border-secondary rounded-md p-2 mb-3"
                  />
                </div>
              </div>            

              <div className="flex flex-col gap-3 sm:space-x-40 sm:flex-row sm:justify-between sm:mt-6 mt-3">
                <div className={`font-sans sm:text-base text-sm text-secondary flex flex-col gap-2 w-full`}>
                  <label htmlFor="employeid">
                    Employee ID
                  </label>
                  <input
                    id="employeid"
                    type="text"
                    className="border border-secondary rounded-md p-2 mb-3"
                  />
                </div>

                <div className={`font-sans sm:text-base text-sm flex flex-col justify-center items-center gap-2 w-full mt-6`}>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                    type="submit"
                    // disabled={loading}
                    className="sm:w-[50%] w-full ml-2"
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        null
                      )
                    }
                  >
                    Update Profile
                  </Button>
                </div>
              </div>            

          </div>
        </div>

      </SideNav>
    </div>
  );
};

export default UserProfile;
