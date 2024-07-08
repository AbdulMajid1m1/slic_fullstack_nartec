import React, { useContext, useEffect, useRef, useState } from "react";
import DataTable from "../../../components/Datatable/Datatable";
import { listOfEmployeeColumn } from "../../../utils/datatablesource";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import newRequest from "../../../utils/userRequest";
import SideNav from "../../../components/Sidebar/SideNav";
import AddListOfEmployee from "./AddListOfEmployee";
import UpdateListOfEmployee from "./UpdateListOfEmployee";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as xlsx from "xlsx";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadIcon from "@mui/icons-material/Download";
// import upload file icon
import { DataTableContext } from "../../../Contexts/DataTableContext";
import { QRCodeSVG } from "qrcode.react";
import imageLiveUrl from "../../../utils/urlConverter/imageLiveUrl";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";

const ListOfEmployee = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const memberDataString = sessionStorage.getItem('employeeData');
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData?.adminUser)

  const navigate = useNavigate();
  const {
    rowSelectionModel,
    setRowSelectionModel,
    tableSelectedRows,
    setTableSelectedRows,
    tableSelectedExportRows,
    setTableSelectedExportRows,
  } = useContext(DataTableContext);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.value = ""; // Reset the file input value to ensure onChange fires
    fileInputRef.current.click();
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get("/employee");
      // console.log(response.data?.employees);
      setData(response?.data?.employees || []);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.error || "failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    console.log("trigger");
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      try {
        const response = await newRequest.post(
          "/employee/bulkEmployeesImport",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response.data);
        toast.success(
          response.data.message || "Employees imported successfully"
        );
        fetchData();
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Failed to import employees"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportProductsTemplate = () => {
    // Columns required in the template
    const columns = [
      "Employee Name",
      "Employee Number",
      "Nationality",
      "Company Name",
      "Iqama Number / Passport Number",
      "Employee Type",
      "Job Title",
      "Room Number",
    ];

    // Create a worksheet with only headers
    const headerWorksheet = xlsx.utils.json_to_sheet([{}], {
      header: columns,
    });

    // Create a workbook and append the header worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, headerWorksheet, "Header Only");

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save Excel file
    saveAs(dataBlob, "employee_import_template.xlsx");
  };

  useEffect(() => {
    fetchData(); // Calling the function within useEffect, not inside itself

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []); // Empty array dependency ensures this useEffect runs once on component mount

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

  const handleDelete = async () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select at least one row to delete");
      return;
    }
  
    Swal.fire({
      title: "Are you sure to delete selected records?",
      text: "You will not be able to recover these Employees!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "No, keep it!",
      confirmButtonColor: "#1E3B8B",
      cancelButtonColor: "#FF0032",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idsToDelete = tableSelectedRows.map((row) => row.id); // Extract IDs from selected rows
  
          const isDeleted = await newRequest.delete("/employee", {
            data: { ids: idsToDelete }, // Send IDs in the request body as an array of numbers
          });
  
          if (isDeleted) {
            toast.success(
              isDeleted?.data?.message || "Employees deleted successfully"
            );
  
            const filteredData = data.filter((item) => !idsToDelete.includes(item.id));
            setData(filteredData);
          } else {
            toast.error("Failed to delete the Employees");
          }
        } catch (error) {
          console.error("Error deleting users:", error);
          toast.error("Something went wrong while deleting users");
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return;
      }
    });
  };
  

  // 2d Barcode Page Print
  const handleCardGenerate = () => {
    if (tableSelectedRows.length === 0) {
      toast.info("Please select a row to print");
      return;
    }
    const printWindow = window.open("", "Print Window", "height=400,width=800");
    const html =
      "<html><head><title>BEC Card</title>" +
      "<style>" +
      // "@page { size: 3.375in 2.125in; margin: 0;}" +
      "@page { size: 2.125in 3.375in; margin: 0;}" +
      "body { font-size: 13px; line-height: 1.2; margin: 0; padding: 0;}" +
      "#header {}" +
      "#becheaderimg {width: 100%; height: 30px; margin-top: -22px;}" +
      "#becfooterimg {width: 100%; height: 30px; position: fixed; bottom: 0;}" +
      // "#imglogo {height: 50px; width: 100px; }" +
      "#userimg {display: flex; justify-content: center; align-items: center;}" +
      "#imglogo { width: 33%; height: 70px; object-fit: contain; margin-bottom: 2px; margin-top: -12px; border-radius: 50%; border: 1px solid #1F0567;}" +
      "#becimageframe {width: 100%; height: 55px; object-fit: contain; margin-top: 2px;}" +
      "#employeedetails {width: 100%; display: flex; justify-content: center; align-items: center; gap: 70px; margin-left: 10px; margin-top: -20px;}" +
      "#sideimage { height: 55px; object-fit: contain; margin-bottom: 2px; padding-right: 10px;}" +
      "#itemcode { font-size: 13px; text-align: center; color: #1F0567; font-weight: 900; font-family: Calibri, Arial, Helvetica, sans-serif; margin-top: -0.1px;}" +
      "#itemcodeline { font-size: 10px; text-align: center; color: #1F0567; font-weight: 700; font-family: Calibri, Arial, Helvetica, sans-serif; margin-top: -8px;}" +
      "#inside-BRCode { display: flex; justify-content: space-between; align-items: center; margin-top: -6px;}" +
      "#island { font-size: 18px; font-weight: 800; transform: rotate(-90deg); margin-right: 10px; font-family: Calibri, Arial, Helvetica, sans-serif;}" +
      "#qrcode { margin: 0 auto; }" +
      "#expdate { font-size: 11px; font-weight: 600; transform: rotate(-90deg); margin-left: 10px; font-family: Calibri, Arial, Helvetica, sans-serif; display: inline-block; min-width: 60px; white-space: nowrap;}" +  
      "#itemcodejobtitle { font-size: 14px; text-align: center; color: #1F0567; font-weight: 700; font-family: Calibri, Arial, Helvetica, sans-serif;}" +
      "#itemSerialNo { font-size: 13px; font-weight: 600; margin-top: 3px;}" +
      "#Qrcodeserails { height: 100%; width: 100%;}" +
      "</style>" +
      "</head><body>" +
      '<div id="printBarcode"></div>' +
      "</body></html>";

    printWindow.document.write(html);
    const barcodeContainer =
      printWindow.document.getElementById("printBarcode");
    const barcode = document.getElementById("barcodeCard").cloneNode(true);
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

    // const barcodes = item.map((row) => row.name);
    // console.log(barcodes); // This will log an array of barcodes
    setTableSelectedRows(formattedItems);
  };

  // Function to format date as day/month/year
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  // Export excel file
  const handleExportListOfEmployee = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    // Assuming these are the specific columns you want to export
    const selectedColumns = [
      "employeeCode",
      "companyName",
      "passportNumber",
      "name",
      "nationality",
      "employmentType",
      "jobTitle",
      "roomNumber",
    ];S

    // Create a worksheet with headers and selected data
    const filteredData = data.map((row) => {
      const filteredRow = {};
      selectedColumns.forEach((column) => {
        filteredRow[column] = row[column];
      });
      return filteredRow;
    });

    // Create a worksheet with headers and data
    const worksheet = XLSX.utils.json_to_sheet([{}].concat(filteredData), {
      header: selectedColumns,
    });

    // Set column widths in the !cols property
    const columnWidths = selectedColumns.map((column, index) => ({
      width: index === 3 ? 35 : 20, // Set the width to 35 for the fourth column, and 20 for the rest
    }));
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "List Of Employee");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save Excel file
    saveAs(dataBlob, "list_of_employee.xlsx");
  };


  const filterDropdownOptions = (row, dropDownOptions) => {
    if (memberData?.adminUser?.is_super_admin === 0) {
      return dropDownOptions.filter((option) => option.label !== "Edit" && option.label !== "Delete");
    }
    if (memberData?.adminUser?.is_super_admin === 1) {
      return dropDownOptions;
    }
  };

  return (
    <div>
      <SideNav>
        <div className={`p-0 h-full bg-dashboard-color`}>
          <div className="flex justify-center items-center">
            <div className="h-auto w-full px-0 pt-4">
              <div className="h-auto w-full p-0 bg-white shadow-xl rounded-md">
                {/* <div className='h-auto w-full shadow-xl'> */}
                <div
                  className={`flex justify-between items-center flex-wrap gap-2 py-7 px-3`}
                >
                  {/* <button
                    onClick={handleShowCreatePopup}
                    className="rounded-full bg-primary font-body px-5 py-1 text-sm mb-3 text-white transition duration-200 hover:bg-secondary"
                  >
                    Add Employee <i className="fas fa-plus mr-1"></i>
                  </button> */}
                  <Button
                    variant="contained"
                    onClick={handleShowCreatePopup}
                    className={`bg-[#B6BAD6] ${memberData?.adminUser?.is_super_admin === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={memberData?.adminUser?.is_super_admin === 0} // This will disable the button
                    style={{ backgroundColor: "#1F0567", color: "#ffffff" }}
                    endIcon={<PersonAddAlt1Icon />}
                  >
                    Add Employee
                  </Button>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="contained"
                      onClick={handleExportListOfEmployee}
                      style={{ backgroundColor: "#1F0567", color: "#ffffff" }}
                      className={`bg-[#B6BAD6] ${memberData?.adminUser?.is_super_admin === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={memberData?.adminUser?.is_super_admin === 0} // This will disable the button
                      // className="bg-[#B6BAD6]"
                      endIcon={<DownloadIcon />}
                    >
                      Export To Excel
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleExportProductsTemplate}
                      style={{ backgroundColor: "#1F0567", color: "#ffffff" }}
                      className="bg-[#B6BAD6]"
                      endIcon={<DownloadIcon />}
                    >
                      Download Import Template
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleButtonClick}
                      style={{ backgroundColor: "#1F0567", color: "#ffffff" }}
                      className={`bg-[#B6BAD6] ${memberData?.adminUser?.is_super_admin === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={memberData?.adminUser?.is_super_admin === 0 || loading}
                      endIcon={
                        loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <FileUploadIcon />
                        )
                      }
                    >
                      {loading ? "Importing..." : "Import From Excel"}
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleDelete}
                      style={{ backgroundColor: "#E02266", color: "#ffffff" }}
                      className={`bg-[#B6BAD6] ${memberData?.adminUser?.is_super_admin === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={memberData?.adminUser?.is_super_admin === 0} // This will disable the button
                      endIcon={<DeleteIcon />}
                    >
                      Delete Employees
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls, .csv"
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: "-11px",
                    marginRight: "-11px",
                    marginTop: "-15px",
                  }}
                >
                  <DataTable
                    data={data}
                    title={"List Of Employee"}
                    columnsName={listOfEmployeeColumn}
                    loading={isLoading}
                    secondaryColor="secondary"
                    uniqueId="customerListId"
                    handleRowClickInParent={handleRowClickInParent}
                    getFilteredOptions={filterDropdownOptions}
                    // checkboxSelection="disabled"
                    dropDownOptions={[
                      {
                        label: "Print Badge",
                        icon: (
                          <VisibilityIcon
                            fontSize="small"
                            color="action"
                            style={{ color: "rgb(37 99 235)" }}
                          />
                        ),
                        action: handleCardGenerate,
                      },
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
            </div>

            {/* AddListOfEmployee component with handleShowCreatePopup prop */}
            {isCreatePopupVisible && (
              <AddListOfEmployee
                isVisible={isCreatePopupVisible}
                setVisibility={setCreatePopupVisibility}
                refreshBrandData={fetchData}
              />
            )}
            {/* UpdateListOfEmployee component with handleShowUpdatePopup prop */}
            {isUpdatePopupVisible && (
              <UpdateListOfEmployee
                isVisible={isUpdatePopupVisible}
                setVisibility={setUpdatePopupVisibility}
                refreshBrandData={fetchData}
              />
            )}
          </div>
        </div>
      </SideNav>
    </div>
  );
};

export default ListOfEmployee;
