import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import newRequest from '../../../utils/userRequest';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import './ListOfEmployee.css'
import imageLiveUrl from '../../../utils/urlConverter/imageLiveUrl';

const UpdateListOfEmployee = ({ isVisible, setVisibility, refreshBrandData }) => {
  const [name, setName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [islandColor, setIslandColor] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // State to hold initial values
  const [initialName, setInitialName] = useState("");
  const [initialEmployeeCode, setInitialEmployeeCode] = useState("");

   // get this session data
   const updateListOfEmployeeData = JSON.parse(sessionStorage.getItem("updateListOfEmployeeData"));

   console.log(updateListOfEmployeeData);

  const handleImageChange = (event) => {
    const imageFile = event.target.files[0];
    const imageUrl = URL.createObjectURL(imageFile);
    setSelectedImage(imageUrl);
  };

   useEffect(() => {
        setName(updateListOfEmployeeData?.name || "");
        setPassportNumber(updateListOfEmployeeData?.passportNumber || "");
        setLocation(updateListOfEmployeeData?.location || "");
        setEmployeeCode(updateListOfEmployeeData?.employeeCode || "");
        setRoomNumber(updateListOfEmployeeData?.roomNumber || "");
        setNationality(updateListOfEmployeeData?.nationality || "");
        setJobTitle(updateListOfEmployeeData?.jobTitle || "");
        setExpiryDate(updateListOfEmployeeData?.expiryDate ? new Date(updateListOfEmployeeData.expiryDate).toISOString().split('T')[0] : "");
        setIslandColor(updateListOfEmployeeData?.logoColor || "");
        setEmploymentType(updateListOfEmployeeData?.employmentType || "");
        setCompanyName(updateListOfEmployeeData?.companyName || "");
        setSelectedImage(imageLiveUrl(updateListOfEmployeeData?.profilePicture));

        // Set initial values
        setInitialName(updateListOfEmployeeData?.name || "");
        setInitialEmployeeCode(updateListOfEmployeeData?.employeeCode || "");
  }, []);


  const handleCloseCreatePopup = () => {
    setVisibility(false);
  };

  
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const formData = new FormData();
        // Append new values only if they have changed
        if (name !== initialName) {
          formData.append("name", name);
        }
        if (employeeCode !== initialEmployeeCode) {
            formData.append("employeeCode", employeeCode);
        }
        
        formData.append("passportNumber", passportNumber);
        formData.append("location", location);
        formData.append("nationality", nationality);
        formData.append("companyName", companyName);
        formData.append("roomNumber", roomNumber);
        formData.append("jobTitle", jobTitle);
        formData.append("expiryDate", expiryDate);
        formData.append("logoColor", islandColor);
        formData.append("employmentType", employmentType);

        // Append front image file
        const imageInput = document.querySelector('#imageInput');
        if (imageInput.files && imageInput.files[0]) {
          formData.append('profile_image', imageInput.files[0]);
        }

        const response = await newRequest.put(`/employee/${updateListOfEmployeeData?.id}`, formData);
        // console.log(response?.data);
        toast.success(response?.data?.message || "Employee Updated Successfully");
        setLoading(false);
        handleCloseCreatePopup();
        refreshBrandData();
    }
    catch (error) {
        // console.log(error);
        toast.error(error?.response?.data?.error || "Error in updating employee");
        setLoading(false);
    }
  };


  return (
    <div>
      {/* create the post api popup */}
      {isVisible && (
        <div className="popup-overlay z-50">
          <div className="popup-container h-auto sm:w-[45%] w-full">
            <div className="popup-form w-full">
              <form onSubmit={handleUpdateEmployee} className='w-full overflow-y-auto' style={{ maxHeight: "calc(100vh - 200px)" }}>
                <h2 className={`text-secondary font-sans font-semibold text-2xl`}>Update Employee</h2>
                <div className="flex flex-col sm:gap-3 gap-3 mt-5">
                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                    <label htmlFor="field1" className={`text-secondary`}> Name</label>
                    <input
                      type="text"
                      id="field1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Enter Name'
                      className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                      required
                    />
                  </div>
                
                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                   <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="field1" className={`text-secondary`}>
                        {" "}
                        Passport Number
                      </label>
                      <input
                        type="text"
                        id="field1"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        placeholder="Enter Passport Number"
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        required
                      />
                    </div>

                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="field3" className={`text-secondary`}>
                        Employment Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="field3"
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        required
                        placeholder={"Enter Employment Type"}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="field4" className={`text-secondary`}>Location <span className='text-red-500'>*</span></label>
                        <input
                        type="text"
                        id="field4"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder={'Enter Location'}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        />
                    </div>

                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="field5" className={`text-secondary`}>Employee Code <span className='text-red-500'>*</span></label>
                        <input
                        type="text"
                        id="field5"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        required
                        placeholder={'Enter Employee Code'}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        />
                    </div>
                  </div>


                  <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                        <label htmlFor="field6" className={`text-secondary`}>Room Number <span className='text-red-500'>*</span></label>
                        <input
                        type="text"
                        id="field6"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                        placeholder={'Enter Room number'}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        />
                    </div>
                    
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                     <label htmlFor="field7" className={`text-secondary`}>Nationality <span className='text-red-500'>*</span></label>
                        <input
                        type="text"
                        id="field7"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        required
                        placeholder={'Enter Nationality'}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                        />
                    </div>
                  </div>

                 <div className="flex justify-center items-center sm:gap-3 gap-3">
                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                    <label htmlFor="field8" className={`text-secondary`}>Company Name <span className='text-red-500'>*</span></label>
                    <input
                    type="text"
                    id="field8"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder={'Enter Company Name'}
                    className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                    />
                  </div>

                  <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                    <label htmlFor="field9" className={`text-secondary`}>Job Title <span className='text-red-500'>*</span></label>
                    <input
                    type="text"
                    id="field9"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    placeholder={'Enter Job Title'}
                    className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                    />
                  </div>
                 </div>

                 <div className="flex justify-center items-center sm:gap-3 gap-3">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="field9" className={`text-secondary`}>
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="field9"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        required
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                      />
                    </div>

                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-0">
                      <label htmlFor="field10" className={`text-secondary`}>
                        ISLAND Color <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        id="field10"
                        value={islandColor}
                        onChange={(e) => setIslandColor(e.target.value)}
                        required
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3`}
                      >
                        <option value="">-select Color-</option>
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="yellow">Yellow</option>
                      </select>
                    </div>
                  </div>

                 <div className="">
                    <span className="text-secondary font-body sm:text-base text-sm">
                      {" "}
                      Profile Image
                    </span>
                    <div className="border-2 border-dashed h-56 w-56 relative flex justify-center">
                      <div className="absolute -bottom-4 flex justify-center items-center h-10 w-3/4 bg-secondary text-white font-body">
                        <label
                          htmlFor="imageInput"
                          className="cursor-pointer whitespace-nowrap"
                        >
                          Select Image
                          <input
                            type="file"
                            id="imageInput"
                            // accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                      {selectedImage && (
                        <div className="h-56 flex justify-center items-center object-contain w-auto">
                          <img
                            src={selectedImage}
                            className="h-56 w-56"
                            alt="Selected Image"
                          />
                        </div>
                      )}
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
                    style={{ backgroundColor: '#021F69', color: '#ffffff' }}
                    type="submit"
                    // onClick={handleAddCompany}
                    disabled={loading}
                    className="w-[70%] ml-2"
                    endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
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
  )
}

export default UpdateListOfEmployee