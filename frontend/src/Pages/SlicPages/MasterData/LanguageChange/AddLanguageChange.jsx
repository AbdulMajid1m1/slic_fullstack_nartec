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
                        <div className="popup-form w-full">
                            <form className='w-full'>
                                <h2 className={`text-secondary font-sans font-semibold text-2xl ${i18n.language === "ar" ? "text-end" : "text-start"}`}>{t('Add')} {t('Language Word')} </h2>
                                <div className="flex flex-col sm:gap-3 gap-3 mt-5">
                                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                                        <label htmlFor="field1" className={`text-secondary  ${i18n.language === "ar" ? "text-end" : "text-start" }`}>{t('Word[English]')}</label>
                                        <input
                                            type="text"
                                            id="category_name_en"
                                            value={category_name_en}
                                            onChange={(e) => setcategory_name_en(e.target.value)}
                                            placeholder={`${t('Enter')} ${t('Word[English]')}`}
                                            className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3 ${i18n.language === "ar" ? "text-end" : "text-start" }`}
                                        />
                                    </div>

                                    <div className="w-full font-body sm:text-base text-sm flex flex-col gap-2">
                                        <label htmlFor="field1" className={`text-secondary  ${i18n.language === "ar" ? "text-end" : "text-start" }`}>{t('Word[Arabic]')}</label>
                                        <input
                                            type="text"
                                            id="category_name_ar"
                                            value={category_name_ar}
                                            onChange={(e) => setcategory_name_ar(e.target.value)}
                                            placeholder={`${t('Enter')} ${t('Word[Arabic]')}`}
                                            className={`border w-full rounded-sm border-[#8E9CAB] p-2 mb-3 ${i18n.language === "ar" ? "text-end" : "text-start" }`}
                                        />
                                    </div>

                                </div>

                                <div className="w-full flex justify-center items-center gap-8 mt-5">
                                    <button
                                        type="button"
                                        className="px-5 py-2 w-[30%] rounded-sm bg-primary text-white font-body text-sm"
                                        onClick={handleCloseCreatePopup}
                                    >
                                        {t('Close')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddCompany}
                                        className="px-5 py-2 rounded-sm w-[70%] bg-secondary text-white font-body text-sm ml-2"
                                    >
                                        {t('Add')}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default AddLanguageChange