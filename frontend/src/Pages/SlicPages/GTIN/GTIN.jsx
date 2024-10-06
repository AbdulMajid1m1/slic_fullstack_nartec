import React, { useContext, useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { GtinColumn } from "../../../utils/datatablesource";
import { Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../../../components/Datatable/Datatable";
import { PiBarcodeDuotone } from "react-icons/pi";
import { MdPrint } from "react-icons/md";
import { FcPrint } from "react-icons/fc";
import logo from "../../../Images/sliclogo.png"
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import Barcode from "react-barcode";
import { DataTableContext } from "../../../Contexts/DataTableContext";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import Swal from "sweetalert2";
import { useQuery } from "react-query";
import AddGTINPopUp from "./AddGTINPopUp";
import UpdateGTINPopUp from "./UpdateGTINPopUp";
import { QRCodeSVG } from "qrcode.react";
import ViewGTINPopUp from "./ViewGTINPopUp";
import { useTranslation } from "react-i18next";

const GTIN = () => {
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
      const response = await newRequest.get("/itemCodes/v1/itemCodes/all", {
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
    fetchData();
  },[])


  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const handleShowCreatePopup = () => {
    setCreatePopupVisibility(true);
  };

  const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setUpdatePopupVisibility(true);
    // console.log(row)
    sessionStorage.setItem("updateListOfEmployeeData", JSON.stringify(row));
  };

  const [isViewPopupVisible, setViewPopupVisibility] = useState(false);
  const handleShowViewPopup = (row) => {
    setViewPopupVisibility(true);
    // console.log(row)
    sessionStorage.setItem("viewGtinBarcodesData", JSON.stringify(row));
  };

  const handlePrintFGBarcode = () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select a row to print");
      return;
    }
    const printWindow = window.open('', 'Print Window', 'height=400,width=800');
  
    const html = '<html><head><title>FG Products</title>' +
      '<style>' +
      '@page { size: 3in 2in; margin: 0; }' +
      'body { font-size: 13px; line-height: 0.1;}' +
      '#header { display: flex; justify-content: start;}' +
      '#imglogo {height: 15px; width: 50px; visibility: hidden;}' +
      '#itemcode { font-size: 12px; font-weight: 400; display: flex; justify-content: between; align-items: center;}' +
      '#inside-BRCode { display: flex; justify-content: start; align-items: start; padding: 1px;}' +
      
      '#main-image {height: 100px; width: 100px; object-fit: contain;}' +
      '#description { display: flex; flex-direction: column; justify-content: start; align-items: start; gap: 12px; padding: 1px;}' +
      '#gtin { font-size: 12px; font-weight: 600; margin-top: 5px;}' +
      '#batch { font-size: 12px; font-weight: 600; margin-top: 9px;}'+
      '#2dBarcode { margin-top: 139px; }' +
      '#Qrcodeserails { height: 100%; width: 100%;}' +
      '</style>' +
      '</head><body>' +
      '<div id="printBarcode"></div>' +
      '</body></html>';

      printWindow.document.write(html);
      const barcodeContainer = printWindow.document.getElementById('printBarcode');
      const barcode = document.getElementById('barcode12').cloneNode(true);
      barcodeContainer.appendChild(barcode);


      const logoImg = new Image();
      logoImg.src = logo;

      logoImg.onload = function () {
        const printWindowLogoImg = printWindow.document.getElementById('imglogo');
        if (printWindowLogoImg) {
          printWindowLogoImg.src = logoImg.src;

          printWindow.print();
          printWindow.close();
          setTimeout(() => {
            setTableSelectedRows([]);
            setRowSelectionModel([]);
          }, 500);
        }
      };
    };


    const handleGtinPage = () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select a row to print.");
      return;
    }
    const printWindow = window.open("", "Print Window", "height=400,width=800");
    const html =
      "<html><head><title>GTIN Number</title>" +
      "<style>" +
      "@page { size: 2in 1in; margin: 0; }" +
      "body { font-size: 13px; line-height: 1.0; }" +
      "#header { display: flex; justify-content: start;}" +
      "#imglogo {height: 15px; width: 50px; visibility: hidden;}" +
      "#itemcode { font-size: 8px; font-weight: 400; }" +
      "#inside-BRCode { display: flex; justify-content: center; align-items: center; padding: 1px; margin-top: -15px;}" +

      "#description { width: 100%; display: flex; flex-direction: column; justify-content: between; align-items: center; margin-top: -3px;}" +
      "#itemSerialNo { font-size: 13px; font-weight: 400;}" +
      "#gtin { font-size: 7px; font-weight: 500; margin-top: 5px;}" +
      "#expiry { font-size: 8px; font-weight: 600; margin-top: 4px;}" +
      "#batch { font-size: 9px; font-weight: 600; margin-top: 4px;}" +

      "#Qrcodeserails { height: 100%; width: 100%;}" +
      "</style>" +
      "</head><body>" +
      '<div id="printBarcode12"></div>' +
      "</body></html>";

    printWindow.document.write(html);
    const barcodeContainer =
      printWindow.document.getElementById("printBarcode12");
    const barcode = document
      .getElementById("priniproducts")
      .cloneNode(true);
    barcodeContainer.appendChild(barcode);

    const logoImg = new Image();
    logoImg.src = logo;

    logoImg.onload = function () {
      // printWindow.document.getElementById('imglogo').src = logoImg.src;
      printWindow.print();
      printWindow.close();
      setTimeout(() => {
        setTableSelectedRows([]);
        setRowSelectionModel([]);
      }, 500);
    };
  };

    const handleRowClickInParent = (item) => {
      if (!item || item?.length === 0) {
        // setTableSelectedRows(item)
        // setTableSelectedExportRows(item);
        // setFilteredData(data);
        return;
      }
      const formattedItems = item.map((row) => ({
        ...row,
        updatedAt: new Date(row.updatedAt).toLocaleDateString(),
      }));
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
              // await refetch();
              resolve(response?.data?.message || `${t('Products deleted successfully')}`);
              const updatedData = data.filter(item => item.GTIN !== row.GTIN);
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
  

  // const handleFetchData = () => {
  //   refetch();
  // };

 
  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={t("GTIN Barcode")} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div
              className={`flex  items-center flex-wrap gap-2 py-7 px-5 ${i18n.language==='ar'?'justify-start':'justify-end'}`}
            >
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
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="customerListId"
                globalSearch={true}
                handleRowClickInParent={handleRowClickInParent}
                // checkboxSelection="disabled"
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


          {/* print barcode */}
        <div id="barcode12">
              {tableSelectedRows.map((barcode, index) => (
                <div id="Qrcodeserails" className="hidden" key={index}>
                  <div id="header">
                    <div>
                      <img src={logo} id="imglogo" alt="" />
                    </div>
                  </div>

                  <div id="itemcode">
                    <div id="inside-BRCode">
                      <img id="main-image" src={logo} alt="" />
                    </div>
                    
                    <div id="description">
                      <div id="batch">Size#: {barcode?.ItemCode}</div>
                      <div id="gtin">Color : {barcode?.ItemQty}</div>
                      <div id="batch">Width#: {barcode?.WHLocation}</div>
                      <div id="2dBarcode">
                        <Barcode
                          value={barcode?.GTIN}
                          format="EAN13"
                          width={1.5}
                          height={45}
                        />
                      </div>
                    </div>

                  </div>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '6px', fontWeight: 'bold'}}>
                    <span>Made in KSA</span>
                  </div>
                </div>
              ))}
            </div>


            {/* print barcode */}
            <div id="priniproducts">
              {tableSelectedRows.map((barcode, index) => {
                return (
                  <div id="Qrcodeserails" className="hidden" key={index}>
                    <div id="header">
                      <div>
                        <img src={logo} id="imglogo" alt="" />
                      </div>
                    </div>

                    <div id="itemcode">
                      <div id="inside-BRCode">
                        <QRCodeSVG
                          value={`${barcode?.ItemCode} - ${barcode?.EnglishName} - ${barcode?.ProductSize} - ${barcode?.GTIN}`}
                          width="65"
                          height="45"
                        />
                      </div>

                      <div id="description">
                        <div id="gtin">Style# : {barcode?.ItemCode} - {barcode?.EnglishName}</div>
                        <div id="expiry">Size# : {barcode?.ProductSize}</div>
                        <div id="batch">{barcode?.GTIN}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>


            {/* AddListOfEmployee component with handleShowCreatePopup prop */}
            {isCreatePopupVisible && (
              <AddGTINPopUp
                isVisible={isCreatePopupVisible}
                setVisibility={setCreatePopupVisibility}
                refreshGTINData={fetchData}
              />
            )}

            {isUpdatePopupVisible && (
              <UpdateGTINPopUp
                isVisible={isUpdatePopupVisible}
                setVisibility={setUpdatePopupVisibility}
                refreshGTINData={fetchData}
              />
            )}

            {isViewPopupVisible && (
              <ViewGTINPopUp
                isVisible={isViewPopupVisible}
                setVisibility={setViewPopupVisibility}
                refreshGTINData={fetchData}
              />
            )}
        </div>
      </SideNav>
    </div>
  );
};

export default GTIN;
