import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import sliclogo from "../../Images/sliclogo.png";
import dashboard from "../../Images/dashboard.png"
import barcode from "../../Images/barcode.png"
import userprofile from "../../Images/userprofile.png"
import posicon from "../../Images/posicon.png"
import Purchase from "../../Images/Purchase.png"
import salesorders from "../../Images/salesorders.png"
import directinvoice from "../../Images/directinvoice.png"
import transactioncodes from "../../Images/transactioncodes.png"
import customercodes from "../../Images/customercodes.png"
import POShistory from "../../Images/POShistory.png"
import POSArchive from "../../Images/POSArchive.png"
import { FaChevronDown, FaChevronUp, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import logout from "../../Images/logout.png";
import { toast } from "react-toastify";
import i18ns from "../../i18n";
import { I18nextProvider, useTranslation } from "react-i18next";
import LanguageSwitcher from "../../switer";

function SideNav({ children }) {

  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMangeOpen, setIsMangeOpen] = useState(false);
  const [isMangeSliderOpen, setIsMangeSliderOpen] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

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
              className={`fixed top-0 transition-all bg-primary lg:mt-0 mt-16  bottom-0 flex flex-col shadow bg-primary-sidebar overflow-hidden z-50 ${
                i18n.language === "ar" ? "right-0" : "left-0"
              } ${isOpen ? "w-[280px]" : "w-0"}`}
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
                    <li>
                      <Link
                        to="/gtin-management"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={dashboard}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Dashboard")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/gtin"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={barcode}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Products")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/purchase-order"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={Purchase}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Purchase Orders")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/sales-order"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={salesorders}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Sales Orders")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    {/* <li className="mt-3">
                    <Link
                      to="/direct-invoice"
                     className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                    >
                      <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                        <img
                          src={directinvoice}
                          alt="logo"
                          className="w-10 h-10 object-cover"
                        />
                        <span className="text-secondary font-medium text-lg">
                          Direct Invoice
                        </span>
                      </div>
                    </Link>
                  </li> */}
                    <li className="mt-3">
                      <Link
                        to="/user-profile"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={userprofile}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("User Profile")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/pos"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={posicon}
                            alt="logo"
                            className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("POS")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/pos-history"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={POShistory}
                            alt="logo"
                            className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("POS History")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/pos-archive"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={POSArchive}
                            alt="logo"
                            className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("POS Archive")}
                          </span>
                        </div>
                      </Link>
                    </li>
                    <li className="mt-3">
                      <div
                        className={`flex items-center py-1  text-gray-700 group hover:text-gray-600 hover:bg-gray-100 cursor-pointer ${i18n.language === "ar" ? "flex-row-reverse pr-3 pl-4" : "flex-row pl-3 pr-4" }`}
                        onClick={handleToggleMange}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={userprofile}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Master Data")}
                          </span>
                        </div>
                        <span className={`inline-block  sidenav-arrow ${i18n.language === "ar" ? "mr-auto" : "ml-auto" }`}>
                          {isMangeOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      </div>
                      {isMangeOpen && (
                        <div className={` transition border-gray-500 dropdown-section nested-menu ${i18n.language === "ar" ? "pr-1 mr-3" : "pl-1 ml-3" }`}>
                          <ul className="text-sm">
                            <li className="mt-3">
                              <Link
                                to="/users"
                               className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                              >
                                <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                                  <img
                                    src={posicon}
                                    alt="logo"
                                    className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                                  />
                                  <span className="text-secondary font-medium text-lg">
                                    {t("Users")}
                                  </span>
                                </div>
                              </Link>
                            </li>
                            <li className="mt-3">
                              <Link
                                to="/roles"
                               className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                              >
                                <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                                  <img
                                    src={posicon}
                                    alt="logo"
                                    className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                                  />
                                  <span className="text-secondary font-medium text-lg">
                                    {t("Roles")}
                                  </span>
                                </div>
                              </Link>
                            </li>
                            <li className="mt-3">
                              <Link
                                to="/Language/Dynamic"
                               className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                              >
                                <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                                  <img
                                    src={posicon}
                                    alt="logo"
                                    className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                                  />
                                  <span className="text-secondary font-medium text-lg">
                                    {t("Language")}
                                  </span>
                                </div>
                              </Link>
                            </li>
                            <li className="mt-3">
                              <Link
                                to="/transaction-codes"
                                className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                              >
                                <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                                  <img
                                    src={transactioncodes}
                                    alt="logo"
                                    className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                                  />
                                  <span className="text-secondary font-medium text-lg">
                                    {t("Transaction Codes")}
                                  </span>
                                </div>
                              </Link>
                            </li>
                            <li className="mt-3">
                              <Link
                                to="/customer-codes"
                               className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                              >
                                <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                                  <img
                                    src={customercodes}
                                    alt="logo"
                                    className="w-10 h-10 object-cover bg-blue-400 rounded-full"
                                  />
                                  <span className="text-secondary font-medium text-lg">
                                    {t("Customer Codes")}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/"
                       className={`flex items-center py-1  text-gray-700 rounded hover:bg-gray-100 ${i18n.language === "ar" ? "pr-3 pl-4 justify-end" : "pl-3 pr-4 justify-start" }`}
                      >
                        <div className={`flex justify-center items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row" }`}>
                          <img
                            src={logout}
                            alt="logo"
                            className="w-10 h-10 object-cover"
                          />
                          <span className="text-secondary font-medium text-lg">
                            {t("Log-out")}
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
          className={`mx-auto transition-all content-wrapper  ${
            isOpen ? `${i18n.language==='ar'?'lg:mr-[280px]':'lg:ml-[280px]'}` : "lg:ml-0"
          }`}
          id="dash"
        >
          <section className="sticky top-0 z-40 px-3 py-0 bg-primary shadow text-gray-100 lg:px-5">
            <nav className="relative">
              <div className={`flex justify-between items-center ${i18n.language==='ar'?'flex-row-reverse':'flex-row'} `}>
                <div className={`flex items-center ${i18n.language==='ar'?'justify-end flex-row-reverse':'justify-start flex-row'}`}>
                  <button onClick={toggleSideNav} className="px-2 py-5 ">
                    <RxHamburgerMenu className="text-secondary h-auto w-6" />
                  </button>
                  <p className="text-secondary font-sans font-bold">
                    {t("GTIN Management")}
                  </p>
                </div>
                <div
                  className={`flex justify-center items-center gap-3 ${
                    i18n.language === "ar"
                      ? "sm:flex-row-reverse"
                      : "sm:flex-row"
                  }`}
                >
                  <I18nextProvider i18n={i18ns}>
                    <LanguageSwitcher />
                  </I18nextProvider>
                  <p className="text-secondary font-sans">
                    {memberData?.data?.user?.UserLoginID}
                  </p>
                  <img
                    src={sliclogo}
                    className="h-8 w-auto object-contain"
                    alt=""
                  />
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
