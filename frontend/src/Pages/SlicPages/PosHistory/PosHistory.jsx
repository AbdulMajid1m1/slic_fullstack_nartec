import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { posHistoryInvoiceColumns } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, CircularProgress } from "@mui/material";

const PosHistory = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [secondGridData, setSecondGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // for the map markers
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isPurchaseOrderDataLoading, setIsPurchaseOrderDataLoading] =
    useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get("/Invoice/v1/masters");
      // console.log(response?.data?.data);
      setData(response?.data?.data || []);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  useEffect(() => {
    fetchData(); // Calling the function within useEffect, not inside itself
  }, []);

  const handleRowClickInParent = async (item) => {
    // console.log(item)
    if (item.length === 0) {
      setFilteredData(secondGridData);
      return;
    }

    // call api
    setIsPurchaseOrderDataLoading(true);
    try {
      const res = await newRequest.get(
        `/Invoice/v1/detailsByInvoiceNo?InvoiceNo=${item[0].InvoiceNo}`
      );
      // console.log(res?.data?.data);

      setFilteredData(res?.data?.data || []);
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Something went wrong"
      );
      setFilteredData([]);
    } finally {
      setIsPurchaseOrderDataLoading(false);
    }
  };

  return (
    <SideNav>
      <div className="p-3 h-full">
        <div className="flex justify-center items-center">
          <div className="h-auto w-full">
            <div className="h-auto w-full bg-white shadow-xl rounded-md">
              <div className="sm:flex p-4 gap-2 w-full">
                <div className="flex flex-col w-full">
                  <label className='font-sans font-semibold text-sm text-secondary'>DATE FROM</label>
                  <input
                    // onChange={(e) => setStartDate(e.target.value)}
                    // value={startDate}
                    type="date"
                    className="border border-gray-300 p-2 rounded-lg"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className='font-sans font-semibold text-sm text-secondary'>DATE TO</label>
                  <input
                    // onChange={(e) => setEndDate(e.target.value)}
                    // value={endDate}
                    type="date"
                    className="border border-gray-300 p-2 rounded-lg"
                  />
                </div>

                <div className="flex justify-center items-center mt-4">
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                    disabled={loading}
                    className="w-full"
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : null
                    }
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-auto w-full shadow-xl">
          <div
            style={{
              marginLeft: "-11px",
              marginRight: "-11px",
            }}
          >
            <DataTable
              data={data}
              title={"POS History"}
              columnsName={posHistoryInvoiceColumns}
              loading={isLoading}
              secondaryColor="secondary"
              checkboxSelection="disabled"
              handleRowClickInParent={handleRowClickInParent}
              globalSearch={true}
              actionColumnVisibility={false}
              dropDownOptions={[
                {
                  label: "Edit",
                  icon: (
                    <EditIcon
                      fontSize="small"
                      color="action"
                      style={{ color: "rgb(37 99 235)" }}
                    />
                  ),
                  //   action: handleShowUpdatePopup,
                },
                {
                  label: "Delete",
                  icon: (
                    <DeleteIcon
                      fontSize="small"
                      color="action"
                      style={{ color: "rgb(37 99 235)" }}
                    />
                  ),
                  //   action: handleDelete,
                },
              ]}
              uniqueId="posHistoryId"
            />
          </div>
        </div>

        <div style={{ marginLeft: "-11px", marginRight: "-11px" }}>
          <DataTable
            data={filteredData}
            title={"POS History Details"}
            secondaryColor="secondary"
            columnsName={posHistoryInvoiceColumns}
            backButton={true}
            checkboxSelection="disabled"
            actionColumnVisibility={false}
            // dropDownOptions={[
            //   {
            //     label: "Delete",
            //     icon: <DeleteIcon fontSize="small" style={{ color: '#FF0032' }} />
            //     ,
            //     action: handleShipmentDelete,
            //   },
            // ]}
            uniqueId={"posHistoryDetailsId"}
            loading={isPurchaseOrderDataLoading}
          />
        </div>
      </div>
    </SideNav>
  );
};

export default PosHistory;
