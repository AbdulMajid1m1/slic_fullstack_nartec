import React, { useContext, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import SideNav from "../../../components/Sidebar/SideNav";
import { GtinColumn } from "../../../utils/datatablesource";
import { Button, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DataTable from "../../../components/Datatable/Datatable";
import { PiBarcodeDuotone } from "react-icons/pi";
import { MdPrint } from "react-icons/md";
import { FcPrint } from "react-icons/fc";
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import { DataTableContext } from "../../../Contexts/DataTableContext";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Swal from "sweetalert2";
import AddGTINPopUp from "./AddGTINPopUp";
import UpdateGTINPopUp from "./UpdateGTINPopUp";
import ViewGTINPopUp from "./ViewGTINPopUp";
import { useTranslation } from "react-i18next";
import FGBarcodePrint from "./FGBarcodePrint";
import GTINBarcodePrint from "./GTINBarcodePrint";

const GTIN = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);

  const {
    setRowSelectionModel,
    tableSelectedRows,
    setTableSelectedRows,
  } = useContext(DataTableContext);

  // React Query fetch function
  const fetchGTINData = async () => {
    const response = await newRequest.get("/itemCodes/v1/itemCodes/all", {
      headers: {
        Authorization: `Bearer ${memberData?.data?.token}`,
      },
    });
    return response?.data?.data || [];
  };

  // React Query hook with 5 minutes cache time
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['gtinData'],
    queryFn: fetchGTINData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to load data");
    },
  });

  // Manual refresh handler
  const handleRefresh = () => {
    toast.promise(
      refetch(),
      {
        pending: 'Refreshing data...',
        success: 'Data refreshed successfully!',
        error: 'Failed to refresh data'
      }
    );
  };

  // Invalidate and refetch data after mutations
  const refreshGTINData = () => {
    queryClient.invalidateQueries(['gtinData']);
  };

  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const handleShowCreatePopup = () => {
    setCreatePopupVisibility(true);
  };

  const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setUpdatePopupVisibility(true);
    sessionStorage.setItem("updateListOfEmployeeData", JSON.stringify(row));
  };

  const [isViewPopupVisible, setViewPopupVisibility] = useState(false);
  const handleShowViewPopup = (row) => {
    setViewPopupVisibility(true);
    sessionStorage.setItem("viewGtinBarcodesData", JSON.stringify(row));
  };

  // FG Barcode Print Handler
  const handlePrintFGBarcode = () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select a row to print");
      return;
    }
    document.getElementById('fg-print-trigger')?.click();
  };

  // GTIN Barcode Print Handler
  const handleGtinPage = () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select a row to print.");
      return;
    }
    document.getElementById('gtin-print-trigger')?.click();
  };

  // Handle print complete callback
  const handlePrintComplete = () => {
    setTableSelectedRows([]);
    setRowSelectionModel([]);
  };

  const handleRowClickInParent = (item) => {
    if (!item || item?.length === 0) {
      return;
    }
    const formattedItems = item.map((row) => ({
      ...row,
      updatedAt: new Date(row.updatedAt).toLocaleDateString(),
    }));
    console.log(formattedItems);
    setTableSelectedRows(formattedItems);
  };

  const handleDelete = (row) => {
    console.log(row);
    Swal.fire({
      title: `${t('Are you sure to delete this record?')}!`,
      text: `${t('You will not be able to recover this Products!')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${t('Yes Delete!')}`,
      cancelButtonText: `${t('No, keep it!')}`,
      confirmButtonColor: '#1E3B8B',
      cancelButtonColor: '#FF0032',
    }).then((result) => {
      if (result.isConfirmed) {
        const deletePromise = new Promise(async (resolve, reject) => {
          try {
            const response = await newRequest.delete("/itemCodes/v1/itemCode/" + row?.GTIN);
            if (response) {
              resolve(response?.data?.message || `${t('Products deleted successfully')}`);
              // Invalidate and refetch the query after successful deletion
              queryClient.invalidateQueries(['gtinData']);
            } else {
              reject(new Error('Failed to delete product'));
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            reject(error);
          }
        });
  
        toast.promise(
          deletePromise,
          {
            pending: 'Deleting product...',
            success: {
              render({ data }) {
                return data;
              }
            },
            error: {
              render({ data }) {
                return data.message || 'Failed to delete product';
              }
            }
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return;
      }
    });
  };

  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={t("GTIN Barcode")} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div
              className={`flex items-center flex-wrap gap-2 py-7 px-5 ${i18n.language==='ar'?'justify-start':'justify-end'}`}
            >
              {/* Refresh Button */}
              <Tooltip title={t("Refresh Data")}>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isFetching}
                  style={{
                    backgroundColor: "#CFDDE0",
                    color: "#1D2F90",
                    marginRight: '8px'
                  }}
                >
                  <RefreshIcon className={isFetching ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                onClick={handleShowCreatePopup}
                style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
                startIcon={<PiBarcodeDuotone />}
              >
                {t("Generate New Barcode")}
              </Button>

              <Button
                variant="contained"
                onClick={handleGtinPage}
                style={{
                  backgroundColor: "#CFDDE0",
                  color: "#1D2F90",
                  paddingLeft: 70,
                  paddingRight: 70,
                }}
                className="bg-[#B6BAD6]"
                startIcon={<MdPrint />}
              >
                {t("Print Products")}
              </Button>

              <Button
                variant="contained"
                onClick={handlePrintFGBarcode}
                style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
                className="bg-[#B6BAD6]"
                startIcon={<FcPrint />}
              >
                {t("Print FG Products")}
              </Button>
            </div>

            <div style={{marginTop: '-15px'}}>
              <DataTable
                data={data}
                title={t("Products List")}
                columnsName={GtinColumn(t)}
                loading={isLoading || isFetching}
                secondaryColor="secondary"
                uniqueId="customerListId"
                globalSearch={true}
                handleRowClickInParent={handleRowClickInParent}
                dropDownOptions={[
                  {
                    label: t("View"),
                    icon: (
                      <VisibilityIcon
                        fontSize="small"
                        color="action"
                        style={{ color: "rgb(37 99 235)" }}
                      />
                    ),
                    action: handleShowViewPopup,
                  },
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
                  {
                    label: t("Delete"),
                    icon: (
                      <DeleteIcon
                        fontSize="small"
                        color="action"
                        style={{ color: "rgb(37 99 235)" }}
                      />
                    ),
                    action: handleDelete,
                  },
                ]}
              />
            </div>
          </div>

          {/* Print Components */}
          <FGBarcodePrint 
            selectedRows={tableSelectedRows} 
            onPrintComplete={handlePrintComplete}
          />
          
          <GTINBarcodePrint 
            selectedRows={tableSelectedRows} 
            onPrintComplete={handlePrintComplete}
          />

          {/* Popups */}
          {isCreatePopupVisible && (
            <AddGTINPopUp
              isVisible={isCreatePopupVisible}
              setVisibility={setCreatePopupVisibility}
              refreshGTINData={refreshGTINData}
            />
          )}

          {isUpdatePopupVisible && (
            <UpdateGTINPopUp
              isVisible={isUpdatePopupVisible}
              setVisibility={setUpdatePopupVisibility}
              refreshGTINData={refreshGTINData}
            />
          )}

          {isViewPopupVisible && (
            <ViewGTINPopUp
              isVisible={isViewPopupVisible}
              setVisibility={setViewPopupVisibility}
              refreshGTINData={refreshGTINData}
            />
          )}
        </div>
      </SideNav>
    </div>
  );
};

export default GTIN;