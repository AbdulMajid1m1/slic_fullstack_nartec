import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { usersColumn } from "../../../utils/datatablesource";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "../../../components/Datatable/Datatable";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import { useTranslation } from "react-i18next";

const SupplierList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get("/users/v1/all", {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        },
      });
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
    // fetchData();
  },[])

  const handleRowClickInParent = (item) => {
    if (!item || item?.length === 0) {
      return;
    }
  };  

  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={t("Supplier List")} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div style={{ marginTop: "-15px" }}>
              <DataTable
                data={data}
                title={t("Supplier List")}
                columnsName={usersColumn(t)}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="customerListId"
                handleRowClickInParent={handleRowClickInParent}
                checkboxSelection="disabled"
                actionColumnVisibility={false}
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
                    // action: handleShowUpdatePopup,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default SupplierList;