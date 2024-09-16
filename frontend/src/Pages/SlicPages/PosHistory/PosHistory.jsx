import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { posHistoryInvoiceColumns } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import newRequest from "../../../utils/userRequest";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";

const PosHistory = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [cutOfDate, setCutOfDate] = useState(""); // Cut of Date
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // slic login api token get
    const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));
    setToken(token);

    const storedLocationData = sessionStorage.getItem("selectedLocation");
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      if (JSON.stringify(locationData) !== JSON.stringify(selectedLocation)) {
        setSelectedLocation(locationData);
      }
      // console.log(locationData)
    }
  }, []);

  const handleRowClickInParent = async (item) => {
    // console.log(item)
    // if (item.length === 0) {
    //   setFilteredData(secondGridData);
    //   return;
    // }
  };

  const fetchCustomerCodes = async () => {
    if (!cutOfDate) {
      // toast.error("Please select a cutoff date");
      return;
    }
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/invoice/v1/getCustomersWithPendingReceipts?SalesLocationCode=${selectedLocation?.stockLocation}&cutoffDate=${cutOfDate}`
      );
      const customerCodes = response?.data?.customerCodes || [];
      setInvoiceList(customerCodes);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast.error(err?.response?.data?.message || "Something went Wrong");
    }
  };

  // Fetch POS Invoice Master based on selected customer code
  const fetchPOSInvoiceMaster = async (customerCode) => {
    setIsLoading(true);
    try {
      const response = await newRequest.get(
        `/invoice/v1/getPOSInvoiceMaster?filter[CustomerCode]=${customerCode}&filter[SalesLocationCode]=${selectedLocation?.stockLocation}&cutoffDate=${cutOfDate}`
      );
      const posData = response?.data || [];
      setData(posData);

      calculateAmounts(posData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast.error(
        err?.response?.data?.error || "Failed to fetch POS invoice data"
      );
    }
  };

  const handleSelectAllInvoice = (event, value) => {
    setSelectedInvoice(value);
    if (value) {
      // Trigger POS Invoice Master API call based on selected customer code
      fetchPOSInvoiceMaster(value);
    }
  };

  useEffect(() => {
    fetchCustomerCodes();
  }, [selectedLocation?.stockLocation, cutOfDate]);

  // Calculate amounts based on IN and SR transactions
  const calculateAmounts = (transactions) => {
    let totalINAmount = 0;
    let totalSRAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.TransactionCode.endsWith("IN")) {
        totalINAmount += transaction.PendingAmount;
      } else if (transaction.TransactionCode.endsWith("SR")) {
        totalSRAmount += transaction.PendingAmount;
      }
    });

    // Add 15% VAT to the amounts
    const totalINWithVAT = totalINAmount * 1.15;
    const totalSRWithVAT = totalSRAmount * 1.15;
    const remainingAmount = totalINWithVAT - totalSRWithVAT;

    setTotalInvoiceAmount(totalINWithVAT);
    setExchangeAmount(totalSRWithVAT);
    setRemainingAmount(remainingAmount);
  };

  const handleGenerateReceipt = async () => {
    // Extract the necessary fields from the data
    const mappedData = data.map((row) => ({
      id: row.id,
      AdjAmount: row.AdjAmount,
      DocNo: row.DocNo,
      TransactionCode: row.TransactionCode,
      PendingAmount: row.PendingAmount,
    }));
    // console.log(mappedData)

    // console.log(
    //   "Total Amount with vat",
    //   totalInvoiceAmount,
    //   "Exchange Amount",
    //   exchangeAmount,
    //   "Remaining Amount",
    //   remainingAmount
    // );
    
    const requestData = {
      _keyword_: "BANKRCPTBLKCSH",
      _secret_key_: "2bf52be7-9f68-4d52-9523-53f7f267153b",
      data: [
        {
          Company: "SLIC",
          UserId: "SYSADMIN",
          Department: "011",
          TransactionCode: "BRV",
          Division: "100",
          BankApproverCode: "CIUB0000266",
          CashCardFlag: "CASH",
          ReceiptAmt: totalInvoiceAmount,
          CustomerId: "CL102726",
          MatchingTransactions: mappedData.map((transaction) => ({
            DocNo: transaction.DocNo,
            TransactionCode: transaction.TransactionCode,
            PendingAmount: remainingAmount,
            AdjAmount: exchangeAmount,
          })),
        },
      ],
      COMPANY: "SLIC",
      USERID: "SYSADMIN",
      APICODE: "BANKRCPTVOUCHERBULK",
      LANG: "ENG",
    };

    try {
      setLoading(true);
      const receiptResponse = await ErpTeamRequest.post(
        "/slicuat05api/v1/postData",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Receipt generated successfully!");

      const receiptIds = mappedData.map((item) => item.id);
      const updateRequestData = {
        ids: receiptIds,
      };
      // console.log(updateRequestData)

      try {
        const res = await newRequest.post(
          "/invoice/v1/updateReceiptStatus",
          updateRequestData
        );
        toast.success(
          res?.data?.message || "Receipt status updated successfully!"
        );
      } catch (errIdsApi) {
        toast.error(
          errIdsApi?.response?.data?.error || "Failed to update receipt status."
        );
      }

      setLoading(false);
    } catch (err) {
      // Handle errors from the first API
      setLoading(false);
      toast.error(
        err?.response?.data?.message || "Failed to generate receipt."
      );
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
                  <label className="font-sans font-semibold text-sm text-secondary">
                    Cut Of Date
                  </label>
                  <input
                    value={cutOfDate}
                    onChange={(e) => setCutOfDate(e.target.value)}
                    type="date"
                    className="border border-gray-300 p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="font-sans font-semibold text-sm text-secondary">
                    Customer Codes
                  </label>
                  <Autocomplete
                    id="customerCodeId"
                    options={invoiceList}
                    getOptionLabel={(option) => option || ""}
                    onChange={handleSelectAllInvoice}
                    value={selectedInvoice}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="bg-gray-50 border border-gray-300 text-black text-xs rounded-sm"
                        placeholder="Select any Customer Code"
                        required
                      />
                    )}
                  />
                </div>

                <div className="flex justify-center items-center sm:w-[40%] w-full mt-4">
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#021F69", color: "#ffffff" }}
                    disabled={loading}
                    className="w-full"
                    onClick={handleGenerateReceipt}
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : null
                    }
                  >
                    Generate Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-auto w-full shadow-xl pb-6">
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
        <div className="flex justify-end mt-3">
          <div className="bg-white p-4 rounded shadow-md sm:w-[60%] w-full">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-bold">
                  Total Invoice Amount WithVAT(15%):
                </label>
                <input
                  type="text"
                  value={totalInvoiceAmount}
                  readOnly
                  className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-bold">
                  Exchange Amount
                </label>
                <input
                  type="text"
                  value={exchangeAmount}
                  readOnly
                  className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-bold">
                  Remaining Amount
                </label>
                <input
                  type="text"
                  value={remainingAmount}
                  readOnly
                  className="mt-1 p-2 border bg-gray-100 text-end w-[60%]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div style={{ marginLeft: "-11px", marginRight: "-11px" }}>
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
        </div> */}
      </div>
    </SideNav>
  );
};

export default PosHistory;
