import React from "react";
import sliclogo from "../../../Images/sliclogo.png";
import warehouse from "../../../Images/warehouse.png";
import gtinmanagement from "../../../Images/gtinmanagement.png";
import supplychain from "../../../Images/supplychain.png";
import pointofsale from "../../../Images/pointofsale.png";
import { useNavigate } from "react-router-dom";

const SlicFirstScreen = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="px-3 py-3 bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
        SLIC - Saudi Leather Industries Company
      </div>
      <div className="flex justify-center items-center h-auto mt-6 mb-6">
        <div className="sm:h-[725px] h-auto w-[95%] bg-[#e7f4f3] flex flex-col justify-start items-start border-2 border-primary rounded-md shadow-xl">
          <div className="flex items-center justify-between w-full p-10">
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
                  className="block sm:w-[70%] w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option>Company 1</option>
                  <option>Company 2</option>
                  <option>Company 3</option>
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
                  className="block sm:w-[70%] w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option>Location 1</option>
                  <option>Location 2</option>
                  <option>Location 3</option>
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
                  src={pointofsale}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlicFirstScreen;
