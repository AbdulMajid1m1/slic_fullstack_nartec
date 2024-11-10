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
import QRCode from "qrcode";
import sliclogo from "../../../Images/sliclogo.png";
import { useTranslation } from "react-i18next";

const PosHistory = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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

  const [slicUserData, setSlicUserData] = useState(null);
  useEffect(() => {
    // slic our user data
    const slicUser = sessionStorage.getItem("slicUserData");
    const adminData = JSON.parse(slicUser);
    if (JSON.stringify(adminData) !== JSON.stringify(slicUserData)) {
      setSlicUserData(adminData?.data?.user);
      // console.log(adminData?.data?.user)
    }
  }, []);

  // console.log(slicUserData?.SalesmanCode);

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
      console.log("history", customerCodes);
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
      console.log("posData", posData);
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
    setSelectedInvoice(value || null);
    console.log(value);
    if (value) {
      // Trigger POS Invoice Master API call based on selected customer code
      fetchPOSInvoiceMaster(value);
    }
  };

  useEffect(() => {
    fetchCustomerCodes();
  }, [selectedLocation?.stockLocation, cutOfDate]);

  // Calculate amounts based on IN and SR transactions with dynamic VAT handling
  const calculateAmounts = (transactions) => {
    let totalINAmount = 0;
    let totalSRAmount = 0;

    transactions.forEach((transaction) => {
      // Determine VAT rate for each transaction, defaulting to 15% if VatNumber is not provided
      const vatRate = transaction.VatNumber
        ? parseFloat(transaction.VatNumber) / 100
        : 0.15;
      const vatMultiplier = 1 + vatRate; // Multiplier for calculating total with VAT

      // Check transaction code and update the respective totals
      if (transaction.TransactionCode.endsWith("IN")) {
        totalINAmount += transaction.PendingAmount * vatMultiplier;
      } else if (transaction.TransactionCode.endsWith("SR")) {
        totalSRAmount += transaction.PendingAmount * vatMultiplier;
      }
    });

    // Calculate remaining amount
    const remainingAmount = totalINAmount - totalSRAmount;

    // Update state with calculated values
    setTotalInvoiceAmount(totalINAmount.toFixed(2));
    setExchangeAmount(totalSRAmount.toFixed(2));
    setRemainingAmount(remainingAmount.toFixed(2));
  };

  // const handleGenerateReceipt = async () => {
  //   // Extract the necessary fields from the data
  //   const mappedData = data.map((row) => ({
  //     id: row.id,
  //     AdjAmount: row.AdjAmount * 1.15,
  //     DocNo: row.DocNo,
  //     TransactionCode: row.TransactionCode,
  //     PendingAmount: row.PendingAmount * 1.15,
  //   }));
  //   // console.log(mappedData)

  //   // console.log(
  //   //   "Total Amount with vat",
  //   //   totalInvoiceAmount,
  //   //   "Exchange Amount",
  //   //   exchangeAmount,
  //   //   "Remaining Amount",
  //   //   remainingAmount
  //   // );

  //   const requestData = {
  //     _keyword_: "BANKRCPTBLKCSH",
  //     _secret_key_: "2bf52be7-9f68-4d52-9523-53f7f267153b",
  //     data: [
  //       {
  //         Company: "SLIC",
  //         UserId: "SYSADMIN",
  //         Department: "011",
  //         TransactionCode: "BRV",
  //         Division: "100",
  //         // BankApproverCode: "CIUB0000266",
  //         CashCardFlag: "CASH",
  //         ReceiptAmt: totalInvoiceAmount,
  //         CustomerId: selectedInvoice,
  //         MatchingTransactions: mappedData.map((transaction) => ({
  //           DocNo: transaction.DocNo,
  //           TransactionCode: transaction.TransactionCode,
  //           PendingAmount: transaction.PendingAmount,
  //           AdjAmount: transaction.AdjAmount,
  //         })),
  //       },
  //     ],
  //     COMPANY: "SLIC",
  //     USERID: slicUserData?.UserLoginID,
  //     APICODE: "BANKRCPTVOUCHERBULK",
  //     LANG: "ENG",
  //   };

  //   try {
  //     setLoading(true);
  //     const receiptResponse = await ErpTeamRequest.post(
  //       "/slicuat05api/v1/postData",
  //       requestData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     toast.success("Receipt generated successfully!");

  //     const receiptIds = mappedData.map((item) => item.id);
  //     const updateRequestData = {
  //       ids: receiptIds,
  //     };
  //     // console.log(updateRequestData)

  //     try {
  //       const res = await newRequest.post(
  //         "/invoice/v1/updateReceiptStatus",
  //         updateRequestData
  //       );
  //       toast.success(
  //         res?.data?.message || "Receipt status updated successfully!"
  //       );

  //       fetchCustomerCodes();
  //       setSelectedInvoice([]);
  //       setTotalInvoiceAmount(0);
  //       setExchangeAmount(0);
  //       setRemainingAmount(0);
  //       setData([]);
  //     } catch (errIdsApi) {
  //       toast.error(
  //         errIdsApi?.response?.data?.error || "Failed to update receipt status."
  //       );
  //     }

  //     setLoading(false);
  //   } catch (err) {
  //     // Handle errors from the first API
  //     setLoading(false);
  //     toast.error(
  //       err?.response?.data?.message || "Failed to generate receipt."
  //     );
  //   }
  // };

  const handleRowClickInParent = async () => {};

  // const [zatcaQrcode, setZatcaQrcode] = useState(null);
  const handleInvoiceGenerator = async (selectedRow) => {
    const { createdAt, AdjAmount, InvoiceNo, TransactionCode } = selectedRow;

    try {
      const dynamicTransactionCode = TransactionCode
        ? TransactionCode.slice(-2)
        : "";
      console.log(dynamicTransactionCode);

      const invoiceResponse = await newRequest.get(
        // `/invoice/v1/headers-and-line-items?InvoiceNo=${InvoiceNo}`
        `/invoice/v1/headers-and-line-items?InvoiceNo=${InvoiceNo}&TransactionCode=${dynamicTransactionCode}`
      );

      const invoiceData = invoiceResponse?.data?.data;

      // console.log("Fetched invoice data:", invoiceData);

      const { invoiceDetails, invoiceHeader } = invoiceData;
      // Get VAT rate from VatNumber or use default (15%)
      const vatRate = invoiceHeader?.VatNumber
        ? parseFloat(invoiceHeader.VatNumber) / 100
        : 0.15;
      let totalGrossAmount = 0;
      let totalVAT = 0;

      // Loop through invoiceDetails and calculate gross, VAT, and total amounts
      invoiceDetails.forEach((item) => {
        const itemGross = item.ItemPrice * item.ItemQry; // Calculate gross amount for each item
        const itemVAT = itemGross * vatRate; // Calculate VAT for each item
        totalGrossAmount += itemGross;
        totalVAT += itemVAT;
      });

      const totalAmountWithVAT = totalGrossAmount + totalVAT;

      const payload = {
        invoiceDate: createdAt,
        totalWithVat: totalAmountWithVAT,
        vatTotal: totalVAT,
      };

      const res = await newRequest.post("/zatca/generateZatcaQRCode", payload);
      const qrCodeDataFromApi = res?.data?.qrCodeData;
      // setZatcaQrcode(qrCodeDataFromApi);

      // Now pass the invoice data to handle the printing logic
      // handlePrintSalesInvoice(selectedRow, invoiceData);
      if (qrCodeDataFromApi) {
        // Now pass the invoice data to handle the printing logic
        handlePrintSalesInvoice(selectedRow, invoiceData, qrCodeDataFromApi);
      } else {
        throw new Error("QR code data not generated properly.");
      }

      toast.success("Invoice generated and ready to print!");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.errors[0]?.msg ||
          "An error occurred while generating the invoice"
      );
    }
  };

  // invoice generate
  const handlePrintSalesInvoice = async (
    selectedRow,
    invoiceData,
    qrCodeDataFromApi
  ) => {
    const { InvoiceNo, DocNo } = selectedRow;

    const { invoiceHeader, invoiceDetails } = invoiceData;

    // Generate QR code data URL
    const qrCodeDataURL = await QRCode.toDataURL(`${InvoiceNo}`);

    const formattedDate = new Date(
      invoiceHeader?.TransactionDate
    ).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    let salesInvoiceTitle = "";
    const lastTwoTransactionCode = invoiceHeader?.TransactionCode.slice(-2);

    if (lastTwoTransactionCode === "IN") {
      salesInvoiceTitle = "SALES INVOICE";
    } else if (lastTwoTransactionCode === "SR") {
      salesInvoiceTitle = "CREDIT NOTE";
    }

    // Get VAT rate from VatNumber or use default (15%)
    const vatRate = invoiceHeader?.VatNumber
      ? parseFloat(invoiceHeader.VatNumber) / 100
      : 0.15;

      const vatMultiplier = 1 + vatRate; // Multiplier for calculating total with VAT
    // Calculate total VAT
    let totalGrossAmount = 0;
    let totalVAT = 0;
    let totalAmountWithVAT = 0;

    // Loop through invoiceDetails and calculate gross, VAT, and total amounts
    invoiceDetails.forEach((item) => {
      console.log(item);
      const itemGross = item.ItemPrice * item.ItemQry; // Calculate gross amount for each item
      const itemVAT = itemGross * vatRate; // Calculate VAT for each item
      totalGrossAmount += itemGross;
      totalVAT += itemVAT;
    });

    totalAmountWithVAT = totalGrossAmount + totalVAT; // Total amount including VAT

    // Generate totals for exchange invoice
    const totalsContent = `
      <div>
        <strong>Gross:</strong>
        <div class="arabic-label">(ريال) المجموع</div>
        ${totalGrossAmount.toFixed(2)}
      </div>
      <div>
        <strong>VAT (15%):</strong>
        <div class="arabic-label">ضريبة القيمة المضافة</div>
        ${totalVAT.toFixed(2)}
      </div>
      <div>
        <strong>Total Amount With VAT:</strong>
        <div class="arabic-label">المجموع</div>
        ${totalAmountWithVAT.toFixed(2)}
      </div>
      <div>
        <strong>Document No.:</strong>
        <div class="arabic-label">المتبقي</div>
        ${DocNo}
      </div>
    `;





    const html = `
      <html>
        <head>
          <title>Pos History</title>
          <style>
            @page { size: 3in 11in; margin: 0; }
            body { font-family: Arial, sans-serif; font-size: 15px; padding: 5px; }
            .invoice-header, .invoice-footer {
              text-align: center;
              font-size: 15px;
              margin-bottom: 5px;
            }
            .invoice-header {
              font-weight: bold;
            }
            .invoice-section {
              margin: 10px 0;
              font-size: 15px;
            }
            .sales-invoice-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              margin-top: 5px;
              margin-bottom: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th,
            .table td {
              text-align: center; /* Center align for more symmetry */
              padding: 5px;
              border-bottom: 1px solid black;
              font-size: 15px;
            }

            .table th div {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
            }

            .table th div span {
              font-family: 'Arial', sans-serif;
              text-align: center;
            }
            .total-section {
              font-size: 15px;
              padding: 10px 0;
              line-height: 1.5;
              text-align: left;
            }
            .left-side {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .left-side div {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .arabic-label {
              text-align: right;
              direction: rtl;
              margin-left: 10px;
              font-family: 'Arial', sans-serif;
              width: auto;
            }
            .qr-section {
              text-align: center;
              margin-top: 80px;
            }
            .receipt-footer {
              margin-top: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }
            .customer-info div {
              margin-bottom: 6px; /* Add space between each div */
            }
              .field-label {
                font-weight: bold;
              }
             .customer-invoiceNumber {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .customer-invocieQrcode {
              margin-top: -5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <img src="${sliclogo}" alt="SLIC Logo" width="120"/>
            <div>Saudi Leather Industries Factory Co.</div>
            <div>شركة مصنع الجلود السعودية</div>
            <div>VAT#: 300456416500003</div>
            <div>CR#: 2050011041</div>
            <div>CR#: ٢٠٥٠٠١١٠٤١</div>
            <div>Unit No 1, Dammam 34334 - 3844, Saudi Arabia</div>
            <div>Tel. Number: 013 8121066</div>
          </div>

          <div class="sales-invoice-title">${salesInvoiceTitle}</div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>${
              invoiceHeader?.CustomerName
            }</div>
            <div style="display: flex; justify-content: space-between;">
              <div><span class="field-label">VAT#: </span>
                ${invoiceHeader?.VatNumber}
              </div>
              <div class="arabic-label" style="text-align: right; direction: rtl;">
                <span class="field-label">الرقم الضريبي#:</span>
                  ${invoiceHeader?.VatNumber}
              </div>
            </div>
            <div class="customer-invoiceNumber">
              <div>
                <div><span class="field-label">Receipt: </span>
                 ${InvoiceNo}
                </div>
                <div><span class="field-label">Date: </span>${formattedDate}</div>
              </div>
              <div class="customer-invocieQrcode">
                <img src="${qrCodeDataURL}" alt="QR Code" height="75" width="100" />
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>بيان</span>
                    <span>Description</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>الكمية</span>
                    <span>Qty</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>السعر</span>
                    <span>Price</span>
                  </div>
                </th>
                <th>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <span>المجموع</span>
                    <span>Total</span>
                  </div>
                </th>
              </tr>
            </thead>

           <tbody>
           ${invoiceDetails
             .map(
               (item) => `
                <tr>
                  <td style="border-bottom: none;">${item.ItemSKU}</td>
                  <td style="border-bottom: none;">${item.ItemQry}</td>
                  <td style="border-bottom: none;">${item.ItemPrice}</td>
                  <td style="border-bottom: none;">${(
                    item.ItemPrice * vatMultiplier
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" style="text-align: left; padding-left: 20px;">
                    <div>
                      <span style="direction: ltr; text-align: left; display: block;">
                        ${item.Remarks}
                      </span>
                    </div>
                  </td>
                </tr>
              `
             )
             .join("")}
            </tbody>
          </table>
          <div class="total-section">
            <div class="left-side">
              ${totalsContent}
            </div>
          </div>

          <div class="qr-section">
            <canvas id="qrcode-canvas"></canvas>
          </div>

          <div class="receipt-footer">This invoice is generated as per ZATCA</div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "Print Window", "height=800,width=800");
    if (!printWindow) {
      console.error(
        "Failed to open the print window. It might be blocked by the browser."
      );
      return;
    }

    // Write the static HTML into the print window
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait until the print window has loaded fully
    printWindow.onload = () => {
      const qrCodeCanvas = printWindow.document.getElementById("qrcode-canvas");
      // let newQR='ARBOYXJ0ZWMgU29sdXRpb25zAg8zMDA0NTY0MTY1MDAwMDMDFDIwMjQtMDgtMTdUMTI6MDA6MDBaBAcxMDAwLjAwBQMxNTAGQGQzMzlkZDlkZGZkZTQ5MDI1NmM3OTVjOTFlM2RmZjBiNGQ2MTAyYjhhMGM4OTYxYzhhNGExNDE1YjZhZGMxNjYHjjMwNDUwMjIxMDBjZjk1MjkwMzc2ZTM5MjgzOGE4ZGYwMjc2YTdiMjEyYmUzMjMyNzAxNjFlNWFjYWY0MGNjOTgwMGJjNzJjNTY4MDIyMDQzYzEyZjEzMTdiZjMxN2Q2YWZkNTAwNTgxNDRlMjdmOTczNWUzZDZlMDYzYWI0MTk2YWU5YWQyZDlhMWVhN2MIgjA0OWM2MDM2NmQxNDg5NTdkMzAwMWQzZDQxNGI0NGIxYjA1MGY0NWZlODJjNDBkZTE4ZWI3NWM2M2Y1YzU2MjRmNDM3NzY0MWFjY2JlZmJiNDlhNGE4MmM1ZDAxY2YyMDRkNTdhMzEzODE1N2RmZDJmNmFlOTIzYjkzMjZiZmI5NWI='
      // Generate the QR code using the `qrcode` library
      QRCode.toCanvas(
        qrCodeCanvas,
        qrCodeDataFromApi,
        { width: 380 },
        function (error) {
          if (error) console.error(error);
          else {
            // Trigger the print dialog after the QR code is rendered
            printWindow.print();
            printWindow.close();
          }
        }
      );
      // setIsOpenOtpPopupVisible(false);
      // console.log(qrCodeData);
    };
  };

  return (
    <SideNav>
      <div className="p-3 h-full">
        <div className="flex justify-center items-center">
          <div className="h-auto w-full">
            <div className="h-auto w-full bg-white shadow-xl rounded-md">
              <div
                className={`sm:flex p-4 gap-2 w-full ${
                  i18n.language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="flex flex-col w-full">
                  <label
                    className={`font-sans font-semibold text-sm text-secondary ${
                      i18n.language === "ar" ? "text-end" : "text-start"
                    }`}
                  >
                    {t("Cut Of Date")}
                  </label>
                  <input
                    value={cutOfDate}
                    onChange={(e) => setCutOfDate(e.target.value)}
                    type="date"
                    className="border border-gray-300 p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label
                    className={`font-sans font-semibold text-sm text-secondary ${
                      i18n.language === "ar" ? "text-end" : "text-start"
                    }`}
                  >
                    {t("Customer Codes")}
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
                        placeholder={t("Select any Customer Code")}
                        required
                      />
                    )}
                  />
                </div>

                {/* <div className="flex justify-center items-center sm:w-[40%] w-full mt-4">
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: selectedInvoice ? "#021F69" : "#d3d3d3",
                      color: selectedInvoice ? "#ffffff" : "#a9a9a9",
                    }}
                    disabled={!selectedInvoice || loading}
                    className="w-full"
                    onClick={handleGenerateReceipt}
                    endIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : null
                    }
                  >
                    {t("Generate Receipt")}
                  </Button>
                </div> */}
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
              title={t("POS History")}
              columnsName={posHistoryInvoiceColumns(t)}
              loading={isLoading}
              secondaryColor="secondary"
              checkboxSelection="disabled"
              handleRowClickInParent={handleRowClickInParent}
              globalSearch={true}
              // actionColumnVisibility={false}
              dropDownOptions={[
                {
                  label: t("Print Receipts"),
                  icon: (
                    <EditIcon
                      fontSize="small"
                      color="action"
                      style={{ color: "rgb(37 99 235)" }}
                    />
                  ),
                  action: handleInvoiceGenerator,
                },
              ]}
              uniqueId="posHistoryId"
            />
          </div>
        </div>
        <div
          className={`flex  ${
            i18n.language === "ar" ? " justify-start" : "justify-end"
          }`}
        >
          <div className="bg-white p-4 rounded shadow-md sm:w-[60%] w-full">
            <div className="flex flex-col gap-4">
              <div
                className={`flex justify-between items-center ${
                  i18n.language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <label
                  className={`block text-gray-700 font-bold ${
                    i18n.language === "ar"
                      ? "direction-rtl"
                      : "text-start direction-ltr"
                  }`}
                >
                  {t("Total Invoice Amount WithVAT(%)")}:
                </label>
                <input
                  type="text"
                  value={totalInvoiceAmount}
                  readOnly
                  className={`mt-1 p-2 border bg-gray-100 w-[60%] ${
                    i18n.language === "ar" ? "text-start" : "text-end"
                  }`}
                />
              </div>

              <div
                className={`flex justify-between items-center ${
                  i18n.language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <label
                  className={`block text-gray-700 font-bold ${
                    i18n.language === "ar"
                      ? "direction-rtl"
                      : "text-start direction-ltr"
                  }`}
                >
                  {t("Exchange Amount")}
                </label>
                <input
                  type="text"
                  value={exchangeAmount}
                  readOnly
                  className={`mt-1 p-2 border bg-gray-100 w-[60%]  ${
                    i18n.language === "ar" ? "text-start" : "text-end"
                  }`}
                />
              </div>

              <div
                className={`flex justify-between items-center ${
                  i18n.language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <label
                  className={`block text-gray-700 font-bold ${
                    i18n.language === "ar"
                      ? "direction-rtl"
                      : "text-start direction-ltr"
                  }`}
                >
                  {t("Remaining Amount")}
                </label>
                <input
                  type="text"
                  value={remainingAmount}
                  readOnly
                  className={`mt-1 p-2 border bg-gray-100  w-[60%] ${
                    i18n.language === "ar" ? "text-start" : "text-end"
                  }`}
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
