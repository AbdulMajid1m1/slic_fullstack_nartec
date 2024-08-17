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
import sliclogo from "../../../Images/sliclogo.png";
import QRCode from 'qrcode';

const GTIN = () => {
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

  // const {
  //   isLoading: queryLoading,
  //   error,
  //   data,
  //   refetch,
  // } = useQuery(
  //   "fetchProducts",
  //   async () => {
  //     const response = await newRequest.get("/itemCodes/v1/itemCodes/all");
  //     return response?.data?.data || [];
  //   },
  //   {
  //     onError: (error) => {
  //       // Display toast message for the error
  //       console.error("Error fetching members:", error);
  //       toast.error(
  //         error?.response?.data?.error || "Something went wrong");
  //     },
  //     onSuccess: () => {
  //       setIsLoading(false); // Set loading state to false on success
  //     },
  //   }
  // );

  // useEffect(() => {
  //   if (!queryLoading) {
  //     setIsLoading(false); // Set loading state to false after query loading is finished
  //   }
  // }, [queryLoading]);


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
      title: `${'Are you sure to delete this record?'}!`,
      text: `${'You will not be able to recover this Products'}!`,
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
            const response = await newRequest.delete("/itemCodes/v1/itemCode/" + row?.GTIN);
            if (response) {
              // await refetch();
              resolve(response?.data?.message || 'Products deleted successfully');
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

 


  const handlePrintSalesInvoice = () => {
    const printWindow = window.open('', 'Print Window', 'height=800,width=800');

    const html = `
      <html>
        <head>
          <title>Sales Invoice</title>
          <style>
            @page { size: 3in 8in; margin: 0; }
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 5px; }
            .invoice-header, .invoice-footer {
              text-align: center;
              font-size: 10px;
              margin-bottom: 5px;
            }
            .invoice-header {
              font-weight: bold;
            }
            .invoice-section {
              margin: 10px 0;
              font-size: 10px;
            }
            .sales-invoice-title {
              text-align: center;
              font-size: 12px;
              font-weight: bold;
              margin-top: 5px;
              margin-bottom: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th, .table td {
              text-align: left;
              padding: 5px;
              border-bottom: 1px solid black;
              font-size: 10px;
            }
            .total-section {
              font-size: 10px;
              text-align: left;
              line-height: 1.5;
              display: flex;
              justify-content: space-between;
            }
            .left-side {
              text-align: left;
            }
            .right-side {
              text-align: right;
              font-family: 'Arial', sans-serif;
              direction: rtl;
              margin-left: 5px;
            }
            .qr-section {
              text-align: center;
              margin-top: 20px;
            }
            .receipt-footer {
              margin-top: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
            }
            .customer-info div {
              margin-bottom: 6px; /* Add space between each div */
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <img src="${sliclogo}" alt="SLIC Logo" width="100"/>
            <div>Saudi Leather Industries Factory Co.</div>
            <div>VAT#: 300456416500003</div>
            <div>CR#: 2050011041</div>
            <div>Unit No 1, Dammam 34334 - 3844, Saudi Arabia</div>
            <div>Tel. Number: 013 8121066</div>
          </div>

          <div class="sales-invoice-title">Sales Invoice</div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>Miscellaneous</div>
            <div><span class="field-label">VAT#: </span>CL100586</div>
            <div><span class="field-label">Receipt: </span>2024003612</div>
            <div><span class="field-label">Date: </span>27/03/2024, 2:55:03 PM</div>
            <div><span class="field-label">Name: </span>Miscellaneous</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr class="item">
                <td>Safety Shoe</td>
                <td>1.00</td>
                <td>65.00 SAR</td>
                <td>65.00 SAR</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="left-side">
              <div><strong>Gross:</strong> 65.00 SAR</div>
              <div><strong>VAT (15%):</strong> 9.75 SAR</div>
              <div><strong>Total:</strong> 74.75 SAR</div>
              <div><strong>Paid:</strong> 74.75 SAR</div>
              <div><strong>Change Due:</strong> 0.00 SAR</div>
            </div>
            <div class="right-side">
              <div>(ريال) المجموع</div>
              <div>ضريبة القيمة المضافة 15%</div>
              <div>المجموع</div>
              <div>المدفوع</div>
              <div>المتبقي</div>
            </div>
          </div>

          <div class="qr-section">
            <canvas id="qrcode-canvas"></canvas>
          </div>

          <div class="receipt-footer">Thank you for shopping with us!</div>
        </body>
      </html>
    `;

    // Write the static HTML into the print window
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait until the print window has loaded fully
    printWindow.onload = () => {
        const qrCodeCanvas = printWindow.document.getElementById('qrcode-canvas');
        
        // Generate the QR code using the `qrcode` library
        QRCode.toCanvas(qrCodeCanvas, "23984liuoiuu293873", function (error) {
            if (error) console.error(error);
            else {
                // Trigger the print dialog after the QR code is rendered
                printWindow.print();
                printWindow.close();
            }
        });
    };
};


  return (
    <div>
      <SideNav>
        <div>
          <RightDashboardHeader title={"GTIN Barcode"} />
        </div>

        <div className="h-auto w-full">
          <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md pb-10">
            <div
              className={`flex justify-end items-center flex-wrap gap-2 py-7 px-5`}
            >
              <Button
                variant="contained"
                onClick={handleShowCreatePopup}
                style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
                startIcon={<PiBarcodeDuotone />}
              >
                Generate New Barcode
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
                Print Products
              </Button>

              <Button
                variant="contained"
                onClick={handlePrintFGBarcode}
                style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
                className="bg-[#B6BAD6]"
                startIcon={<FcPrint />}
              >
                Print FG Products
              </Button>

              <Button
                variant="contained"
                onClick={handlePrintSalesInvoice}
                style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
                className="bg-[#B6BAD6]"
                startIcon={<FcPrint />}
              >
                Print Invoice
              </Button>
            </div>

            <div style={{marginTop: '-15px'}}>
              <DataTable
                data={data}
                title={"Products List"}
                columnsName={GtinColumn}
                loading={isLoading}
                secondaryColor="secondary"
                uniqueId="customerListId"
                handleRowClickInParent={handleRowClickInParent}
                // checkboxSelection="disabled"
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
        </div>
      </SideNav>
    </div>
  );
};

export default GTIN;
