import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import sliclogo from "../../Images/sliclogo.png";
import dashboard from "../../Images/dashboard.png"
import barcode from "../../Images/barcode.png"
import userprofile from "../../Images/userprofile.png"
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import logout from "../../Images/logout.png";
import { toast } from "react-toastify";

function SideNav({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMangeOpen, setIsMangeOpen] = useState(false);
  const [isMangeSliderOpen, setIsMangeSliderOpen] = useState(false);
  const memberDataString = sessionStorage.getItem('employeeData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData?.adminUser)

  const navigate = useNavigate();

  const toggleSideNav = () => {
    setIsOpen(!isOpen);
  };

  
  const handleToggleMange = () => {
    setIsMangeOpen(!isMangeOpen);
  };
  const handleToggleMangeSlider = () => {
    setIsMangeSliderOpen(!isMangeSliderOpen);
  };

  const handleAllUsersClick = (e) => {
    if (memberData?.adminUser?.is_super_admin === 0) {
      e.preventDefault();
      toast.error("Access denied. Super Admins only.");
    }
  };

  return (
    <>
      {/* <DashboardHeader /> */}
      <div className="p-0 lg:h-screen">
        <div className="body-content" x-data="{ open: true }">
          <div className="relative lg:block navbar-menu">
            <nav
              className={`fixed top-0 transition-all bg-primary lg:mt-0 mt-16 left-0 bottom-0 flex flex-col shadow bg-primary-sidebar overflow-hidden z-50 ${
                isOpen ? "w-[280px]" : "w-0"
              }`}
              id="sidenav"
            >
              <div className="flex justify-center items-center w-full px-4 pt-4 pb-0 border-b border-gray-300 ">
                <Link to="/gtin-management">
                  <img
                    src={sliclogo}
                    alt="logo"
                    className="object-contain h-28 w-full"
                  />
                </Link>
              </div>
              <div className="pb-6 mt-4 overflow-x-hidden overflow-y-auto">
                <ul className="mb-8 text-sm ">
                  <li>
                  <li >
                    <Link
                      to="/gtin-management"
                      className="flex items-center py-1 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <img
                          src={dashboard}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          Dashboard
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/gtin"
                      className="flex items-center py-1 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <img
                          src={barcode}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          GTIN
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/user-profile"
                      className="flex items-center py-1 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <img
                          src={userprofile}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          User Profile
                        </span>
                      </div>
                    </Link>
                  </li>
                  {/* <li className="mt-3">
                    <Link
                      to="/employee-meals"
                      className="flex items-center py-1 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <img
                          src={employeemealsicon}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          Employee Meals
                        </span>
                      </div>
                    </Link>
                  </li> */}
                  <li className="mt-3">
                    <Link
                      to="/"
                      className="flex items-center py-1 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <img
                          src={logout}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          Log-out
                        </span>
                      </div>
                    </Link>
                  </li>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
        {/* top nav */}
        <div
          className={`mx-auto transition-all content-wrapper ${
            isOpen ? "lg:ml-[280px]" : "lg:ml-0"
          }`}
          id="dash"
        >
          <section className="sticky top-0 z-40 px-3 py-0 bg-primary shadow text-gray-100 lg:px-5">
            <nav className="relative">
              <div className="flex justify-between items-center flex-wrap">
              <div className="flex justify-start items-center">
                  <button
                    onClick={toggleSideNav}
                    className="px-2 py-5 "
                    >
                    <RxHamburgerMenu className='text-secondary h-auto w-6'/>
                  </button>
                    <p className='text-secondary font-sans font-bold'>GTIN Management</p>
              </div>
              <div className="flex justify-center items-center gap-3">
                <p className='text-secondary font-sans'>{memberData?.adminUser?.email}</p>
                <img src={sliclogo} className="h-8 w-auto object-contain" alt="" />
              </div>
            </div>
            </nav>
          </section>

          {/* main content */}
          {children}
        </div>
      </div>
    </>
  );
}

export default SideNav;
