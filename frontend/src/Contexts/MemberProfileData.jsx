import React, { createContext, useState } from 'react';
import newRequest from '../utils/userRequest';

export const MemberProfileDataContext = createContext();

const MemberProfileData = ({ children }) => {
    const [memberProfileDetails, setMemberProfileDetails] = useState([]);
    
    const fetchAllUserData = async (userId) => {
        // console.log("fetching user data", userId)
        try {
          const response = await newRequest.get(`/users?id=${userId}`);
        //   console.log(response.data[0]);
          setMemberProfileDetails(response?.data[0] || []);
            
        }
        catch (err)
        {
        //   console.log(err);
        }
    };

    return (
        <MemberProfileDataContext.Provider value={{
            memberProfileDetails, setMemberProfileDetails,
            fetchAllUserData
        }}>
            {children}
        </MemberProfileDataContext.Provider>
    );
};

export default MemberProfileData;
