import "./ProductsDashboardTable.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { MuiCustomTable } from "../../utils/MuiCustomTable";
import userRequest from "../../utils/userRequest";

const DashboardTable = ({
    columnsName,
    data,
    title,
    uniqueId,
    loading,
    secondaryColor,
}) => {
    const navigate = useNavigate();
    const [record, setRecord] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    // Temporary Comment
    // const { statedata, updateData } = useContext(ReceiptsContext);
    const [qrcodeValue, setQRCodeValue] = useState('');
    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [companyLogo, setLogo] = useState(null);
    const [message, setMessage] = useState(null);
    const [severity, setSeverity] = useState(null);
    const [error, setError] = useState(null);
    const resetSnakeBarMessages = () => {
        setError(null);
        setMessage(null);

    };

    // Retrieve the value with the key "myKey" from localStorage getvalue
    const myValue = localStorage.getItem("userId");
    useEffect(() => {
        if (data) {
            setRecord(
                data.map((item, index) => ({ ...item, id: index + 1 }))
            );
        }
    }, [data]);



    // console.log("see the data");
    // console.log(data);



    const CustomCell = (params) => {
        const style = {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'auto',
            minWidth: 0, // add this property
            maxWidth: '100%', // add this property
        };
        return (
            <div style={{ ...style, overflowX: 'auto' }}>
                {params.value}
            </div>
        );
    };
    const columnsWithCustomCell = columnsName.map((column) => {
        if (column.width) {
            return {
                ...column,
                renderCell: CustomCell,
            };
        }
        return column;
    });
    const idColumn = [
        {
            field: "id",
            headerName: "ID",
            width: 30,
        },
    ];


    const handleRowClick = async (rowData, idx) => {
        if (uniqueId === "receiptsManagement") {
            
            // updateData(rowData);
            rowData.POQTY = rowData?.QTY;
            
            // updateData(rowData);

            try {

                const itemData = await userRequest.post("/getOneMapBarcodeDataByItemCode", {},
                    {
                        headers: {
                            itemcode: rowData?.ITEMID,
                        }
                    },

                );
                console.log(itemData);
                let itemName = itemData?.data[0]?.ItemDesc;
                let itemDesc = itemData?.data[0]?.Classification;
                rowData.ITEMNAME = itemName;
                rowData.CLASSIFICATION = itemDesc;
                // updateData(rowData);
            }
            catch (err) {
                console.log(err);
            }
            finally {

                navigate("/receiptsecond")
            }

        }
        else {
            return
        }

    };

    return (
        <>
            <div className="dashBoardDatatable">
                <div className="datatableTitle">
                    {title}

                </div>

                <MuiCustomTable
                    secondaryColor={secondaryColor ? secondaryColor : null}
                    loading={loading}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    }

                    getRowHeight={({ }) => {
                        let x;
                        x = 50;
                        return x;
                    }
                    }
                    className="datagrid"
                    rows={record}
                    columns={

                        idColumn.concat(columnsWithCustomCell)
                    }
                    pageSize={30}

                    rowsPerPageOptions={[30]}

                    checkboxSelection={false}
                    onRowClick={(params, rowIdx) => {
                        // call your handle function and pass the row data as a parameter
                        handleRowClick(params.row, rowIdx);
                    }}

                />

                {/* Displaying myValue inside the table Value in center*/}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "-40px", marginLeft: "10px", }}>
                    <style>
                        {`
            @media (max-width: 480px) {
              h1 {
                display: none;
              }
            }
            `}
                    </style>
                </div>

            </div>
        </>

    );
};

export default DashboardTable;







