import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditIcon from "@mui/icons-material/Edit";
import { I18nextProvider, useTranslation } from "react-i18next";
import AddLanguageChange from './AddLanguageChange';
import UpdataLanguageChange from './UpdataLanguageChange';
import axios from 'axios';
import { DataTableContext } from '../../../../Contexts/DataTableContext';
import DataTable from '../../../../components/Datatable/Datatable';
import {baseUrl } from '../../../../utils/config';
import { LanguageDataColumn } from '../../../../utils/datatablesource';
import SideNav from '../../../../components/Sidebar/SideNav';
// import i18n from "../../../../i18n";
const LaanguageChange = () => {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
    const [brandsData, setBrandsData] = useState([]);
    const handleShowCreatePopup = () => {
        setCreatePopupVisibility(true);
    };

    const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);

    const handleShowUpdatePopup = (row) => {
        setUpdatePopupVisibility(true);
        sessionStorage.setItem("updatelanguageData", JSON.stringify(row));
    };
    const {
      rowSelectionModel,
      setRowSelectionModel,
      tableSelectedRows,
      setTableSelectedRows,
    } = useContext(DataTableContext);
    const [filteredData, setFilteredData] = useState([]);

    const refreshcitiesData = async () => {
        try {
            const response = await axios.get(
              baseUrl + "/language/translations_table"
            );
            // const dataArray = Object.entries(response.data);
            const resdata = response?.data?.data;
            setData(resdata);
            console.log(resdata);
            
            setIsLoading(false)

        } catch (err) {
            setIsLoading(false)
        }
    };

    useEffect(() => {

        refreshcitiesData() // Calling the function within useEffect, not inside itself
    }, []);
    const formattedData = data.map((item, index) => ({
        id: index,
        nameEnglish: item[0], // English translation
        namearabic: item[1], // Arabic translation
    }));

    const handleRowClickInParent = (item) => {
        if (!item || item?.length === 0) {
            setTableSelectedRows(data)
            setFilteredData(data)
            return
        }

    }
   
    return (
        <div  >
             <SideNav>
            <div className={`p-0 h-full`}>
            
                <div className='flex justify-center items-center'>
                    <div className="h-auto w-[97%] px-0 pt-4">
                        <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md">

                            {/* </div> */}
                            <div className={`flex  sm:justify-start items-center flex-wrap gap-2 py-7 px-3 ${i18n.language === 'ar' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}>
                                <button
                                    onClick={handleShowCreatePopup}
                                    className="rounded-full bg-secondary font-body px-5 py-1 text-sm mb-3 text-white transition duration-200 hover:bg-primary">
                                    <i className="fas fa-plus mr-2"></i>{t('Add')}
                                </button>
                               
                            </div>
                            {/* DataGrid */}
                            <div style={{ marginLeft: '-11px', marginRight: '-11px' }}>

                                <DataTable data={data}
                                    title={t('Language')}
                                    columnsName={LanguageDataColumn(t)}
                                    loading={isLoading}
                                    secondaryColor="secondary"
                                    handleRowClickInParent={handleRowClickInParent}

                                    dropDownOptions={[
                                        {
                                            label: t("Edit"),
                                            icon: (
                                                <EditIcon
                                                    fontSize="small"
                                                    color="action"
                                                    style={{ color: "rgb(37 99 235)" }}
                                                />
                                            ),
                                            action: handleShowUpdatePopup,
                                        },
                                    ]}
                                    uniqueId="gtinMainTableId"
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* Addunit component with handleShowCreatePopup prop */}
                {isCreatePopupVisible && (
                    <AddLanguageChange isVisible={isCreatePopupVisible} setVisibility={setCreatePopupVisibility} refreshBrandData={refreshcitiesData} />
                )}
                {isUpdatePopupVisible && (
                    <UpdataLanguageChange isVisible={isUpdatePopupVisible} setVisibility={setUpdatePopupVisibility} refreshBrandData={refreshcitiesData} />
                )}

            </div>
            </SideNav>
        </div>
    )
}

export default LaanguageChange