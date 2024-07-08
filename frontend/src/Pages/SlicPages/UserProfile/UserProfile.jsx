import React from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";

const UserProfile = () => {
  return (
    <div>
      <SideNav>
        <div>
            <RightDashboardHeader title={'User Profile'}/>
        </div>
        
        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            

          </div>
        </div>

      </SideNav>
    </div>
  );
};

export default UserProfile;
