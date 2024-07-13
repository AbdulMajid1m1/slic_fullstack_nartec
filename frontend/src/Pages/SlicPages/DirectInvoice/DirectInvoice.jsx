import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { GtinColumn } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";

const DirectInvoice = () => {
  const [data, setData] = useState([]);
  const memberDataString = sessionStorage.getItem("slicUserData");
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)

  const [isLoading, setIsLoading] = useState(true);
  const [secondGridData, setSecondGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // for the map markers
  const navigate = useNavigate();
  const [isAssemblingDataLoading, setIsAssemblingDataLoading] = useState(false);

  //     const fetchData = async () => {
  //       setIsLoading(true);
  //       try {
  //         const response = await newRequest.get(
  //           `/getadd_assemblingByuser_id?user_id=${memberData?.id}`
  //         );
  //         console.log(response.data);
  //         setData(response?.data || []);
  //         setIsLoading(false);
  //       } catch (err) {
  //         console.log(err);
  //         setIsLoading(false);
  //         openSnackbar(
  //           err?.response?.data?.message || "Something Is Wrong",
  //           "error"
  //         );
  //       }
  //     };
  
  //   useEffect(() => {
//     fetchData(); // Calling the function within useEffect, not inside itself
//   }, []);

//   const handleRowClickInParent = async (item) => {
//     if (item.length === 0) {
//       setFilteredData(secondGridData);
//       return;
//     }
//     const filteredData = secondGridData.filter((singleItem) => {
//       return Number(singleItem?.ProvGLN) == Number(item[0]?.ProvGLN);
//     });

//     // call api
//     setIsAssemblingDataLoading(true);
//     try {
//       // const res = await newRequest.get("/getbyglnassembling/" + item[0]?.barcode)
//       const res = await newRequest.get(
//         `/get_assembling_By_UserId_list?user_id=${memberData?.id}&GTIN=${item[0]?.GTIN}`
//       );
//       const filteredData = res?.data ?? [];
//       setFilteredData(filteredData);
//     } catch (error) {
//       console.log(error);
//       setFilteredData([]);
//     } finally {
//       setIsAssemblingDataLoading(false);
//     }
//   };

  return (
    <SideNav>
      <div
        className='p-3 h-full'
      >
        <div className="h-auto w-full shadow-xl">
          <div
            style={{
              marginLeft: "-11px",
              marginRight: "-11px",
            }}
          >
            <DataTable
              data={data}
              title={"Direct Invoice"}
              columnsName={GtinColumn}
              loading={isLoading}
              secondaryColor="secondary"
              checkboxSelection="disabled"
            //   handleRowClickInParent={handleRowClickInParent}
              actionColumnVisibility={false}
              // dropDownOptions={[
              //   {
              //     label: "View",
              //     icon: (
              //       <VisibilityIcon
              //         fontSize="small"
              //         color="action"
              //         style={{ color: "rgb(37 99 235)" }}
              //       />
              //     ),
              //     action: handleView,
              //   },
              // ]}
              uniqueId="assemblingId"
            />
          </div>
        </div>

        <div style={{ marginLeft: "-11px", marginRight: "-11px" }}>
          <DataTable
            data={filteredData}
            title={"Direct Invoice Details"}
            secondaryColor="secondary"
            columnsName={GtinColumn}
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
            loading={isAssemblingDataLoading}
          />
        </div>
      </div>
    </SideNav>
  );
};

export default DirectInvoice;
