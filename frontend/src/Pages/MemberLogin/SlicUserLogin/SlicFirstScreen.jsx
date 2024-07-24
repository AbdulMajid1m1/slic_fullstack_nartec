import React, { useEffect, useState } from "react";
import sliclogo from "../../../Images/sliclogo.png";
import warehouse from "../../../Images/warehouse.png";
import gtinmanagement from "../../../Images/gtinmanagement.png";
import supplychain from "../../../Images/supplychain.png";
import pointofsale from "../../../Images/pointofsale.png";
import { useNavigate } from "react-router-dom";
import newRequest from "../../../utils/userRequest";
import axios from "axios";
import { toast } from "react-toastify";

const SlicFirstScreen = () => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      const response = await newRequest.post(
        "/slicuat05api/v1/slicLogin",
        {
          apiKey: "b4d21674cd474705f6caa07d618b389ddc7ebc25a77a0dc591f49e9176beda01",
        },
        {
          headers: {
            "X-tenanttype": "live",
          },
        }
      );
      // console.log(response.data);
      sessionStorage.setItem("slicLoginToken", JSON.stringify(response?.data?.token));
    } catch (error) {
      console.log(error);
    }
  };
  

  // map All the companies api response data
  const flattenCompanies = (data) => {
    return data.map(company => {
      if (company.CompanyMaster) {
        return company.CompanyMaster;
      }
      return company;
    });
  };
  
  const getAllCompaniesDetails = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
      const res = await newRequest.post(
        '/slicuat05api/v1/getApi',
        {
          "filter": {},
          "M_COMP_CODE": "001",
          "M_USER_ID": "SYSADMIN",
          "APICODE": "CompanyMaster",
          "M_LANG_CODE": "ENG"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(res.data);
      const flattenedData = flattenCompanies(res.data);
      setCompanies(flattenedData);
      
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || error?.response?.data?.message || "Something went wrong!");
    }
  
  };


  // map All the location api response data
  const flattenLocations = (data) => {
    return data.map(location => {
      if (location.LocationMaster) {
        return location.LocationMaster;
      }
      return location;
    });
  };

  const getAllLocationsDetails = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
      const res = await newRequest.post(
        '/slicuat05api/v1/getApi',
        {
          "filter": {},
          "M_COMP_CODE": "001",
          "M_USER_ID": "SYSADMIN",
          "APICODE": "LocationMaster",
          "M_LANG_CODE": "ENG"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(res.data);
      const flattenedData = flattenLocations(res.data);
      setLocations(flattenedData);
      
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || error?.response?.data?.message || "Something went wrong!");
    }
  
  };
  
  useEffect(() => {
    const initialize = async () => {
      await handleLogin();
      await getAllCompaniesDetails();
      await getAllLocationsDetails();
    };
  
    initialize();
  }, []);



  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (selectedCompany) {
      sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
      // console.log(selectedCompany);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedLocation) {
      sessionStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
      // console.log(selectedLocation);
    }
  }, [selectedLocation]);

  const handleCompanyChange = (e) => {
    const selectedComp = companies.find(company => company.COMP_NAME === e.target.value);
    setSelectedCompany(selectedComp);
  };

  const handleLocationChange = (e) => {
    const selectedLoc = locations.find(location => location.LOCN_NAME === e.target.value);
    setSelectedLocation(selectedLoc);
  };


  return (
    <div>
      <div className="px-3 py-3 bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
        SLIC - Saudi Leather Industries Company
      </div>
      <div className="flex justify-center items-center h-auto mt-6 mb-6">
        <div className="3xl:h-[725px] 2xl:h-[725px] lg:h-[725px] h-auto w-[95%] pb-3 bg-[#e7f4f3] flex flex-col justify-start items-start border-2 border-primary rounded-md shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full p-10">
            <div className="flex flex-col items-start space-y-4 w-full">
              <img src={sliclogo} alt="SLIC Logo" className="h-36 mb-4" />
              <div className="w-full">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="company"
                >
                  Select Company
                </label>
                <select
                  id="company"
                  onChange={handleCompanyChange}
                  className="block sm:w-[70%] w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="" disabled>Select Company</option>
                  {companies.map((company) => (
                    <option>
                      {company.COMP_NAME}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="locations"
                >
                  Select Locations
                </label>
                <select
                  id="locations"
                  onChange={handleLocationChange}
                  className="block sm:w-[70%] w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="" disabled>Select Location</option>
                  {locations.map((location) => (
                    <option>
                      {location?.LOCN_NAME}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-shrink-0 ml-8">
              <img src={warehouse} alt="Warehouse" className="h-64" />
            </div>
          </div>

          {/* Last Cards */}
          <div className="grid 3xl:grid-cols-3 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 sm:gap-6 gap-4 sm:px-6 px-2 mt-6">
            <div onClick={() => navigate('/user-login')} className="h-auto w-full flex justify-center items-center bg-white border-[2px] rounded-lg shadow-lg px-2 py-4 shadow-[#B4B2AE] cursor-pointer transition-transform transform hover:scale-90">
              <div className="h-auto w-[35%]">
                <img
                  src={gtinmanagement}
                  className="h-auto w-auto object-contain"
                  alt=""
                />
              </div>
              <div className="h-auto w-[65%] flex flex-col gap-1 px-2">
                <h2 className="text-xl font-semibold text-secondary font-sans">
                  GTIN Management
                </h2>
                <p className="text-sm font-light text-black font-sans">
                  Manage GTINs to ensure product identification and data
                  accuracy. View barcode ,print and creation,
                </p>
              </div>
            </div>

            <div onClick={() => navigate('/user-login')} className="h-auto w-full flex justify-center items-center bg-white border-[2px] rounded-lg shadow-lg px-2 py-4 shadow-[#B4B2AE] cursor-pointer transition-transform transform hover:scale-90">
              <div className="h-auto w-[35%]">
                <img
                  src={supplychain}
                  className="h-auto w-auto object-contain"
                  alt=""
                />
              </div>
              <div className="h-auto w-[65%] flex flex-col gap-1 px-2">
                <h2 className="text-xl font-semibold text-secondary font-sans">
                  Supply Chain Application
                </h2>
                <p className="text-sm font-light text-black font-sans">
                  Optimize your supply chain with advanced applications for efficiency and transparency.
                </p>
              </div>
            </div>

            <div onClick={() => window.open('/pos', '_blank')} className="h-auto w-full flex justify-center items-center bg-white border-[2px] rounded-lg shadow-lg px-2 py-4 shadow-[#B4B2AE] cursor-pointer transition-transform transform hover:scale-90">
            {/* <div onClick={() => navigate('/pos')} className="h-auto w-full flex justify-center items-center bg-white border-[2px] rounded-lg shadow-lg px-2 py-4 shadow-[#B4B2AE] cursor-pointer transition-transform transform hover:scale-90"> */}
              <div className="h-auto w-[35%]">
                <img
                  src={pointofsale}
                  className="h-auto w-auto object-contain"
                  alt=""
                />
              </div>
              <div className="h-auto w-[65%] flex flex-col gap-1 px-2">
                <h2 className="text-xl font-semibold text-secondary font-sans">
                  Point of Sale System
                </h2>
                <p className="text-sm font-light text-black font-sans">
                  Efficiently manage sales, inventory, and customer data with a robust Point of Sale System.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlicFirstScreen;
