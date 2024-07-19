import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import imageLiveUrl from "../utils/urlConverter/imageLiveUrl";
import QRCode from "qrcode.react";
import { backendUrl, baseUrl } from "./config";
import { useGridApiContext } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const QRCodeCell = (props) => {
  const url = `https://gs1ksa.org/?gtin=${props.value}`;
  return <QRCode value={url} size={40} />;
};

function ImageEditInputCell(props) {
  const { id, field, fieldUpdated, value, mode } = props;
  const apiRef = useGridApiContext();

  const handleFileChange = (event) => {
    const file = event.target?.files?.[0];

    if (!file) {
      apiRef.current.setEditCellValue({
        id,
        field: fieldUpdated,
        value: false,
      });
      return;
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const imageValue = reader.result;
        apiRef.current.setEditCellValue({
          id,
          field: fieldUpdated,
          value: true,
        });
        apiRef.current.setEditCellValue({
          id,
          field,
          value: { file, dataURL: imageValue, isUpdate: true },
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRef = (element) => {
    if (element) {
      const input = element.querySelector('input[type="file"]');
      input?.focus();
    }
  };

  if (mode === "edit") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
        <input
          ref={handleRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Box>
    );
  }

  console.log("Value");
  console.log(value);
}

const renderImageEditInputCell = (params) => {
  const { field, fieldUpdated } = params;
  return (
    <ImageEditInputCell {...params} mode="edit" fieldUpdated={fieldUpdated} />
  );
};

const GTINCell = (params) => {
  const style = {
    backgroundColor: "rgb(21 128 61)",
    color: "white",
    borderRadius: "30px",
    padding: "2px 10px",
  };
  return <div style={style}>{params.value}</div>;
};

export const GtinColumn = [
  {
    field: "EnglishName",
    headerName: "English Name",
    width: 280,
  },
  {
    field: "ArabicName",
    headerName: "Arabic Name",
    width: 280,
  },
  {
    field: "ItemCode",
    headerName: "Item Code",
    width: 180,
  },
  {
    field: "sERIALnUMBER",
    headerName: "Serial Number",
    renderCell: (params) => <QRCodeCell value={params.row.sERIALnUMBER} />,
    // width: 50, // Adjust this width as needed
  },
  {
    field: "LotNo",
    headerName: "Lot No",
    width: 180,
  },
  {
    field: "GTIN",
    headerName: "Barcode",
    renderCell: GTINCell,
    width: 150,
  },
  {
    field: "ItemQty",
    headerName: "Item Qty",
    width: 180,
  },
  {
    field: "WHLocation",
    headerName: "WH Location",
    width: 180,
  },
  {
    field: "BinLocation",
    headerName: "Bin Location",
    width: 180,
  },
  // {
  //   field: "QRCodeInternational",
  //   headerName: "QR Code International",
  //   width: 180,
  // },
  // {
  //   field: "ModelName",
  //   headerName: "Model Name",
  //   width: 180,
  // },
  // {
  //   field: "ProductionDate",
  //   headerName: "Production Date",
  //   width: 180,
  // },
  // {
  //   field: "ProductType",
  //   headerName: "Product Type",
  //   width: 180,
  // },
  // {
  //   field: "BrandName",
  //   headerName: "Brand Name",
  //   width: 180,
  // },
  // {
  //   field: "PackagingType",
  //   headerName: "Packaging Type",
  //   width: 180,
  // },
  // {
  //   field: "ProductUnit",
  //   headerName: "Product Unit",
  //   width: 180,
  // },
  {
    field: "ProductSize",
    headerName: "ProductSize",
    width: 180,
  },
];

export const listOfEmployeeColumn = [
  {
    field: "employeeCode",
    headerName: "Employee Code",
    width: 150,
  },
  {
    field: "companyName",
    headerName: "Company Name",
    width: 180,
  },
  {
    field: "passportNumber",
    headerName: "Passport Number",
    width: 150,
  },
  {
    field: "name",
    headerName: "Employee Name",
    width: 180,
  },
  {
    field: "nationality",
    headerName: "Nationality",
    width: 180,
  },
  {
    field: "employmentType",
    headerName: "Employment Type",
    width: 180,
  },
  {
    field: "jobTitle",
    headerName: "Job Title",
    width: 180,
  },
  {
    field: "roomNumber",
    headerName: "Room Number",
    width: 150,
  },
  {
    field: "profilePicture",
    headerName: "Profile Picture",
    width: 180,
    editable: true,
    renderCell: (params) => (
      <img
        src={imageLiveUrl(params.row.profilePicture)}
        // src={backendUrl + "/" + params.row.address_image}
        alt="address_image"
        style={{
          width: "90%",
          height: "90%",
          objectFit: "contain",
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(
            imageLiveUrl(params.row.profilePicture),
            "_blank",
            "width=400,height=300,top=0,left=0"
          );
        }}
      />
    ),
  },
  {
    field: "expiryDate",
    headerName: 'Expiry Date',
    width: 180,

    type: "dateTime",
    valueGetter: (params) => {
      // Convert the string date to a Date object
      return params.value ? new Date(params.value) : null;
    },
  },
  {
    field: "logoColor",
    headerName: 'Logo Color',
    width: 180,
    renderCell: GTINCell,
  },
  // {
  //   field: "location",
  //   headerName: 'Location',
  //   width: 180,
  // },
  // {
  //   field: "locationCode",
  //   headerName: 'Location Code',
  //   width: 180,
  // },

  // {
  //   field: "qrcode",
  //   headerName: 'QRCode',
  //   renderCell: (params) => <QRCodeCell value={params.row.barcode} />,
  //   // width: 50, // Adjust this width as needed
  // },
  // {
  //   field: "createdAt",
  //   headerName: "Created At",
  //   width: 180,

  //   type: "dateTime",
  //   valueGetter: (params) => {
  //     // Convert the string date to a Date object
  //     return params.value ? new Date(params.value) : null;
  //   },
  // },
  // {
  //   field: "updatedAt",
  //   headerName: "Updated At",
  //   width: 180,
  //   type: "dateTime",
  //   valueGetter: (params) => {
  //     // Convert the string date to a Date object
  //     return params.value ? new Date(params.value) : null;
  //   },
  // },
];


export const archivedUserColumn = [
  {
    field: "id",
    headerName: "Employee ID",
    width: 120,
  },
  {
    field: "name",
    headerName: "Employee Name",
    width: 180,
  },
  {
    field: "companyName",
    headerName: "Company Name",
    width: 180,
  },
  {
    field: "employmentType",
    headerName: "Employment Type",
    width: 150,
  },
  {
    field: "jobTitle",
    headerName: "Job Title",
    width: 180,
  },
  {
    field: "nationality",
    headerName: "Nationality",
    width: 180,
  },
  {
    field: "passportNumber",
    headerName: "Passport Number",
    width: 180,
  },
  {
    field: "roomNumber",
    headerName: "Room Number",
    width: 150,
  },
  {
    field: "username",
    headerName: "Username",
    width: 180,
  },
  {
    field: "profilePicture",
    headerName: "Profile Picture",
    width: 180,
    editable: true,
    renderCell: (params) => (
      <img
        src={imageLiveUrl(params.row.profilePicture)}
        // src={backendUrl + "/" + params.row.address_image}
        alt="address_image"
        style={{
          width: "90%",
          height: "90%",
          objectFit: "contain",
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(
            imageLiveUrl(params.row.profilePicture),
            "_blank",
            "width=400,height=300,top=0,left=0"
          );
        }}
      />
    ),
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 180,

    type: "dateTime",
    valueGetter: (params) => {
      // Convert the string date to a Date object
      return params.value ? new Date(params.value) : null;
    },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 180,
    type: "dateTime",
    valueGetter: (params) => {
      // Convert the string date to a Date object
      return params.value ? new Date(params.value) : null;
    },
  },
];



export const purchaseOrderColumn = [
  {
    field: "Head_SYS_ID",
    headerName: "Head System ID",
    width: 180,
  },
  {
    field: "SupplierName",
    headerName: "Supplier Name",
    renderCell: GTINCell,
    width: 280,
  },
  {
    field: "PONumber",
    headerName: "PO Number",
    width: 180,
  },
  {
    field: "POStatus",
    headerName: "PO Status",
    width: 180,
  },
  {
    field: "PODate",
    headerName: "PO Date",
    width: 180,
  },
  {
    field: "tblPOFPOMasterID",
    headerName: "POF PO Master ID",
    width: 180,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 180,

    type: "dateTime",
    valueGetter: (params) => {
      // Convert the string date to a Date object
      return params.value ? new Date(params.value) : null;
    },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 180,
    type: "dateTime",
    valueGetter: (params) => {
      // Convert the string date to a Date object
      return params.value ? new Date(params.value) : null;
    },
  },



]



export const purchaseOrderDetailsColumn = [
  {
    field: "HEAD_SYS_ID",
    headerName: "Head System ID",
    width: 180,
  },
  {
    field: "ITEM_CODE",
    headerName: "Item Code",
    width: 180,
  },
  {
    field: "ITEM_NAME",
    headerName: "Item Name",
    renderCell: GTINCell,
    width: 180,
  },
  {
    field: "ITEM_SYS_ID",
    headerName: "Item System ID",
    width: 180,
  },
  {
    field: "PO_QTY",
    headerName: "PO Quantity",
    width: 180,
  },
  {
    field: "RECEIVED_QTY",
    headerName: "Received Quantity",
    width: 180,
  },
  {
    field: "UOM",
    headerName: "UOM",
    width: 180,
  },
  
  

]



export const salesOrderColumn = [
  {
    field: "Head_SYS_ID",
    headerName: "Head System ID",
    width: 180,
  },
  {
    field: "SO_CUST_NAME",
    headerName: "SO Customar Name",
    renderCell: GTINCell,
    width: 280,
  },
  {
    field: "SO_NUMBER",
    headerName: "So Number",
    width: 180,
  },
  {
    field: "DEL_LOCN",
    headerName: "Del Location",
    width: 180,
  },
  {
    field: "SO_LOCN_CODE",
    headerName: "SO Location Code",
    width: 180,
  },
  {
    field: "STATUS",
    headerName: "Status",
    width: 180,
    renderCell: (params) => {
      const style = {
        backgroundColor: params.value === "Approved" ? "green" : "red",
        color: params.value === "Approved" ? "white" : "black",
        borderRadius: "30px",
        padding: "2px 10px",
        border: params.value === "Approved" ? "1px solid white" : "none",
      };
      return <div style={style}>{params.value}</div>;
    },
  },
];


export const usersColumn = [
  {
    field: "UserLoginID",
    headerName: "User Login ID",
    width: 280,
  },
  {
    field: "UserLoginStatus",
    headerName: "User Login Status",
    renderCell: (params) => {
      const style = {
        backgroundColor: params.value === 1 ? "green" : "red",
        color: params.value === 1 ? "white" : "white",
        borderRadius: "30px",
        padding: "2px 10px",
        border: params.value === 1 ? "1px solid white" : "none",
      };
      return <div style={style}>{params.value === 1 ? "Active" : "Inactive"}</div>;
    },
    width: 180,
  },
  {
    field: "UserPassword",
    headerName: "User Password",
    width: 180,
  },
];
