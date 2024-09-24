import React, { useContext, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import SideNav from "../../../../components/Sidebar/SideNav";
import { GtinColumn, transactionCodesColumn } from "../../../../utils/datatablesource";
import newRequest from "../../../../utils/userRequest";
import RightDashboardHeader from "../../../../components/RightDashboardHeader/RightDashboardHeader";
import DataTable from "../../../../components/Datatable/Datatable";
import { DataTableContext } from "../../../../Contexts/DataTableContext";
import ErpTeamRequest from "../../../../utils/ErpTeamRequest";
import { useTranslation } from "react-i18next";

const TransactionCodes = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [headerBtnLoading, setHeaderBtnLoading] = useState(false);
  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
  
  const {
    rowSelectionModel,
    setRowSelectionModel,
    tableSelectedRows,
    setTableSelectedRows,
  } = useContext(DataTableContext);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get("/transactions/v1/all");
      // console.log(response?.data?.data);
      setData(response?.data?.data || []);
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


  const handleProductSync = async () => {
    setHeaderBtnLoading(true);
    try {
      const response = await ErpTeamRequest.post("/transactions/v1/sync",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    //   console.log(response.data);
      const totalSynced = response?.data?.data?.addedCodes?.length || 0;
      toast.success(`Products have been synced successfully. ${totalSynced} new codes added.`);
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Something went wrong while syncing products");
    } finally {
      setHeaderBtnLoading(false);
    }
  };
  

  const handleRowClickInParent = (item) => {
    if (!item || item?.length === 0) {
      return;
    }
  };

 
  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={t("Transaction Codes")} />
        </div>
        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div style={{marginTop: '-15px'}}>
              <DataTable
                data={data}
                title={t("Transaction Codes")}
                columnsName={transactionCodesColumn(t)}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="transactionCodesId"
                handleRowClickInParent={handleRowClickInParent}
                checkboxSelection="disabled"
                actionColumnVisibility={false}
                headerButtonVisibility={true}
                buttonTitle={t("Sync Products")}
                buttonFunction={handleProductSync}
                headerBtnLoading={headerBtnLoading}
                dropDownOptions={[
                //   {
                //     label: "Delete",
                //     icon: (
                //       <DeleteIcon
                //         fontSize="small"
                //         color="action"
                //         style={{ color: "rgb(37 99 235)" }}
                //       />
                //     ),
                //     action: handleDelete,
                //   },
                ]}
              />
            </div>
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default TransactionCodes;
