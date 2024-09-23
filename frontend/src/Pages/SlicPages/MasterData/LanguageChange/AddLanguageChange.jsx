import { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { baseUrl } from '../../../../utils/config';

const AddLanguageChange = ({ isVisible, setVisibility, refreshBrandData }) => {
    const [category_name_en, setcategory_name_en] = useState("");
    const [category_name_ar, setcategory_name_ar] = useState("");
    const { t, i18n } = useTranslation();

    const [Pagedropdown, setPagedropdown] = useState([])
    const handleCloseCreatePopup = () => {
        setVisibility(false);
    };

    const handleAddCompany = async () => {
        try {
            const response = await axios.post(baseUrl + '/language/translations_post', {
                'key': category_name_en,
                'value': category_name_ar,
            });

            toast.success(`${t('Word')} ${category_name_ar} ${t('has been added successfully')}.`, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            });
            refreshBrandData();
            handleCloseCreatePopup();
        } catch (error) {
            toast.error(error|| 'Error', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            });
        }


    };


    return (
      <div>
        {/* create the post api popup */}
        {isVisible && (
          <div className="popup-overlay">
            <div className="popup-container h-auto sm:w-[45%] w-full">
              <div className="relative">
                <div className="fixed top-0 left-0 z-10 flex justify-between w-full px-3 bg-secondary">
                  <h2 className="text-white sm:text-xl text-lg font-body font-semibold">
                    {t("Add")} {t("Language Word")}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 14H4"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-gray-300 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4h16v16H4z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-white hover:text-red-600 focus:outline-none"
                      onClick={handleCloseCreatePopup}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="popup-form w-full">
                <form className="w-full">
                  <div className="flex flex-col sm:gap-3 gap-3 mt-5">
                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                      <label
                        htmlFor="field1"
                        className={`text-secondary  ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      >
                        {t("Word[English]")}
                      </label>
                      <input
                        type="text"
                        id="category_name_en"
                        value={category_name_en}
                        onChange={(e) => setcategory_name_en(e.target.value)}
                        placeholder={`${t("Enter")} ${t("Word[English]")}`}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3 ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      />
                    </div>

                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                      <label
                        htmlFor="field1"
                        className={`text-secondary  ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      >
                        {t("Word[Arabic]")}
                      </label>
                      <input
                        type="text"
                        id="category_name_ar"
                        value={category_name_ar}
                        onChange={(e) => setcategory_name_ar(e.target.value)}
                        placeholder={`${t("Enter")} ${t("Word[Arabic]")}`}
                        className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3 ${
                          i18n.language === "ar" ? "text-end" : "text-start"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="w-full flex justify-center items-center gap-8 mt-5">
                    <button
                      type="button"
                      className="px-5 py-2 w-[30%] rounded-sm bg-primary text-white font-body text-sm"
                      onClick={handleCloseCreatePopup}
                    >
                      {t("Close")}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCompany}
                      className="px-5 py-2 rounded-sm w-[70%] bg-secondary text-white font-body text-sm ml-2"
                    >
                      {t("Add")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}

export default AddLanguageChange