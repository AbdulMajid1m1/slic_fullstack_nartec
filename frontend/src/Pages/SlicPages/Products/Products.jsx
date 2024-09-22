import React, { useContext, useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { GtinColumn } from "../../../utils/datatablesource";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataTable from "../../../components/Datatable/Datatable";
import logo from "../../../Images/sliclogo.png"
import RightDashboardHeader from "../../../components/RightDashboardHeader/RightDashboardHeader";
import Barcode from "react-barcode";
import { DataTableContext } from "../../../Contexts/DataTableContext";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import { QRCodeSVG } from "qrcode.react";
import ViewGTINPopUp from "./ViewGTINPopUp";

const Products = () => {
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
      "body { font-size: 13px; line-height: 0.1;}" +
      "#header { display: flex; justify-content: start;}" +
      "#imglogo {height: 15px; width: 50px; visibility: hidden;}" +
      "#itemcode { font-size: 8px; font-weight: 400; }" +
      "#inside-BRCode { display: flex; justify-content: center; align-items: center; padding: 1px; margin-top: -11px;}" +

      "#description { width: 100%; display: flex; flex-direction: column; justify-content: between; align-items: center; }" +
      "#itemSerialNo { font-size: 13px; font-weight: 400;}" +
      "#gtin { font-size: 7px; font-weight: 500; margin-top: 5px;}" +
      "#expiry { font-size: 8px; font-weight: 600; margin-top: 9px;}" +
      "#batch { font-size: 9px; font-weight: 600; margin-top: 9px;}" +

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
          <RightDashboardHeader title={"Products Barcode View"} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div style={{marginTop: '-15px'}}>
              <DataTable
                data={data}
                title={"Products List View"}
                columnsName={GtinColumn}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="customerListId"
                globalSearch={true}
                handleRowClickInParent={handleRowClickInParent}
                // checkboxSelection="disabled"
                dropDownOptions={[
                  {
                    label: "View",
                    icon: (
                      <VisibilityIcon
                        fontSize="small"
                        color="action"
                        style={{ color: "rgb(37 99 235)" }}
                      />
                    ),
                    action: handleShowViewPopup,
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
                          value={`${barcode?.GTIN} - ${barcode?.EnglishName} - ${barcode?.ProductSize}`}
                          width="65"
                          height="45"
                        />
                      </div>

                      <div id="description">
                        <div id="gtin">Style# : {barcode?.EnglishName}</div>
                        <div id="expiry">Size# : {barcode?.ProductSize}</div>
                        <div id="batch">{barcode?.GTIN}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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

export default Products;
