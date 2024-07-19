import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { purchaseOrderColumn, purchaseOrderDetailsColumn } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import AddPurchaseOrderPopUp from "./AddPurchaseOrderPopUp";
import { Button } from "@mui/material";
import UpdatePurchaseOrderPopUp from "./UpdatePurchaseOrderPopUp";

const PurchaseOrder = () => {
  const [data, setData] = useState([]);
  const memberDataString = sessionStorage.getItem("slicUserData");
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

  const [isLoading, setIsLoading] = useState(true);
  const [secondGridData, setSecondGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // for the map markers
  const navigate = useNavigate();
  const [isPurchaseOrderDataLoading, setIsPurchaseOrderDataLoading] = useState(false);

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await newRequest.get('/foreignPO/v1/foreignPO/all', {
            headers: {
              Authorization: `Bearer ${memberData?.data?.token}`,
            },
          });
          // console.log(response.data);
          setData(response?.data?.data || []);
          setIsLoading(false);
        } catch (err) {
          // console.log(err);
          setIsLoading(false);
          toast.error(err?.response?.data?.message || "Something went Wrong")
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
    const filteredData = secondGridData.filter((singleItem) => {
      return Number(singleItem?.ProvGLN) == Number(item[0]?.ProvGLN);
    });

    // call api
    setIsPurchaseOrderDataLoading(true);
    try {
      // const res = await newRequest.get(`/lineItems/v1/699}`, {
      const res = await newRequest.get(`/lineItems/v1/${item[0]?.Head_SYS_ID}`, {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        },
      });
      console.log(res?.data)
      const filteredData = res?.data?.data ?? [];
      setFilteredData(filteredData);
    } catch (error) {
      // console.log(error);
      toast.error(error?.response?.data?.message ||"Something went wrong");
      setFilteredData([]);
    } finally {
      setIsPurchaseOrderDataLoading(false);
    }
  };



  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const handleShowCreatePopup = () => {
    setCreatePopupVisibility(true);
  };


  const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setUpdatePopupVisibility(true);
    // console.log(row)
    sessionStorage.setItem("updatePurchaseOrderData", JSON.stringify(row));
  };


  const handleDelete = (row) => {
    // console.log(row);
    Swal.fire({
      title: `${'Are you sure to delete this record?'}!`,
      text: `${'You will not be able to recover this Purchase Order'}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${'Yes Delete'}!`,
      cancelButtonText: `${'No, keep it'}!`,
      confirmButtonColor: '#1E3B8B',
      cancelButtonColor: '#FF0032',
    }).then((result) => {
      if (result.isConfirmed) {
        const deletePromise = new Promise(async (resolve, reject) => {
          try {
            const response = await newRequest.delete("/foreignPO/v1/foreignPO/" + row?.tblPOFPOMasterID);
            if (response) {
              // await refetch();
              resolve(response?.data?.message || 'Products deleted successfully');
              const updatedData = data.filter(item => item.tblPOFPOMasterID !== row.tblPOFPOMasterID);
              setData(updatedData);
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
    <SideNav>
      <div
        className='p-3 h-full'
      >
        {/* <div
          className={`flex justify-start items-center flex-wrap gap-2 py-3 px-3`}
        >
          <Button
            variant="contained"
            onClick={handleShowCreatePopup}
            style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
            // startIcon={<PiBarcodeDuotone />}
          >
            Add Purchase Order
          </Button>
        </div> */}
        <div className="h-auto w-full shadow-xl">
          <div
            style={{
              marginLeft: "-11px",
              marginRight: "-11px",
            }}
          >
            <DataTable
              data={data}
              title={"Purchase Order"}
              columnsName={purchaseOrderColumn}
              loading={isLoading}
              secondaryColor="secondary"
              checkboxSelection="disabled"
              handleRowClickInParent={handleRowClickInParent}
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
                  action: handleShowUpdatePopup,
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
                  action: handleDelete,
                },
              ]}
              uniqueId="assemblingId"
            />
          </div>
        </div>

        <div style={{ marginLeft: "-11px", marginRight: "-11px" }}>
          <DataTable
            data={filteredData}
            title={"Purchase Order Details"}
            secondaryColor="secondary"
            columnsName={purchaseOrderDetailsColumn}
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
            uniqueId={"shipmentRequestProductId"}
            loading={isPurchaseOrderDataLoading}
          />
        </div>


        {isCreatePopupVisible && (
          <AddPurchaseOrderPopUp
            isVisible={isCreatePopupVisible}
            setVisibility={setCreatePopupVisibility}
            refreshGTINData={fetchData}
          />
        )}


        {isUpdatePopupVisible && (
          <UpdatePurchaseOrderPopUp
            isVisible={isUpdatePopupVisible}
            setVisibility={setUpdatePopupVisibility}
            refreshGTINData={fetchData}
          />
        )}
      </div>
    </SideNav>
  );
};

export default PurchaseOrder;
