import React, { useContext, useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { taxSettingsColumn } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import { DataTableContext } from "../../../Contexts/DataTableContext";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import newRequest from "../../../utils/userRequest";
import { useTranslation } from "react-i18next";
import UpdateTaxPopup from "./UpdateTaxPopup";

const TaxSettings = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

  const {
    rowSelectionModel,
    setRowSelectionModel,
    tableSelectedRows,
    setTableSelectedRows,
  } = useContext(DataTableContext);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get("/invoice/v1/getTaxRecords", {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        },
      });
    //   console.log(response?.data);
      setData(response?.data || []);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.error || "failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  },[])

  const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setUpdatePopupVisibility(true);
    // console.log(row)
    sessionStorage.setItem("updateTaxAmountData", JSON.stringify(row));
  };

    const handleRowClickInParent = (item) => {
      if (!item || item?.length === 0) {
        return;
      }
      const formattedItems = item.map((row) => ({
        ...row,
        updatedAt: new Date(row.updatedAt).toLocaleDateString(),
      }));
      setTableSelectedRows(formattedItems);
    };

 
  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={t("Tax Settings")} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div style={{marginTop: '-15px'}}>
              <DataTable
                data={data}
                title={t("Tax Settings")}
                columnsName={taxSettingsColumn(t)}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="taxSettingId"
                handleRowClickInParent={handleRowClickInParent}
                checkboxSelection="disabled"
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
              />
            </div>
          </div>
        {isUpdatePopupVisible && (
          <UpdateTaxPopup
            isVisible={isUpdatePopupVisible}
            setVisibility={setUpdatePopupVisibility}
            refreshGTINData={fetchData}
          />
        )}
        </div>
      </SideNav>
    </div>
  );
};

export default TaxSettings;
