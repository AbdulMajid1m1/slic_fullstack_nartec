import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { posBulkCashreceiptInvoiceColumns } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import newRequest from "../../../utils/userRequest";
import { Autocomplete, Button, CircularProgress, debounce, TextField } from "@mui/material";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import sliclogo from "../../../Images/sliclogo.png";
import AddBankDepositNoPopUp from "./AddBankDepositNoPopUp";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";
import axios from "axios";
import { newERPBaseUrl } from "../../../utils/config";

const PosBulkMatchReceipts = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingTransactionLoader, setMatchingTransactionLaoder] = useState(false);
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
    const slicUser = sessionStorage.getItem('slicUserData');
    const adminData = JSON.parse(slicUser);
    if (JSON.stringify(adminData) !== JSON.stringify(slicUserData)) {
      setSlicUserData(adminData?.data?.user);
      // console.log(adminData?.data?.user)
    }
  }, []);

  // console.log(slicUserData?.SalesmanCode);


  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [selectedMatchReceipts, setSelectedMatchReceipts] = useState(null);
  const [isAutocompleteFilled, setIsAutocompleteFilled] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [matchReceiptsList, setMatchReceiptsList] = useState([]);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [matchingButtonEnabled, setMatchingButtonEnabled] = useState(false); // For "Matching Transaction" button
  const [matchingButtonText, setMatchingButtonText] = useState("Matching Transaction");
  const abortControllerRef = React.useRef(null);

  const handleGPCAutoCompleteChange = (event, value) => {
    console.log(value);
    setSelectedMatchReceipts(value);
    
    // Update "Add Bank Deposit Number" button
    setButtonEnabled(value !== null);

    // Check if isMatched is true, and update the "Matching Transaction" button
    if (value && value.isMatched) {
      setMatchingButtonEnabled(false);
      setMatchingButtonText("Already Matched");
    } else if (value) {
      setMatchingButtonEnabled(true);
      setMatchingButtonText("Matching Transaction");
    } else {
      setMatchingButtonEnabled(false);
      setMatchingButtonText("Matching Transaction");
    }

    if (value) {
      fetchData(value);
    }
  };

  // Use debounce to wrap the handleAutoCompleteInputChange function
  const debouncedHandleAutoCompleteInputChange = debounce(
    async (event, newInputValue, reason) => {
      // console.log(reason);
      setIsSubmitClicked(false);
      if (reason === "reset" || reason === "clear") {
        setMatchReceiptsList([]); // Clear the data list if there is no input
        return; // Do not perform search if the input is cleared or an option is selected
      }
      if (reason === "option") {
        return; // Do not perform search if the option is selected
      }

      if (!newInputValue || newInputValue.trim() === "") {
        // perform operation when input is cleared
        setMatchReceiptsList([]);
        setButtonEnabled(false);
        return;
      }

      // console.log(newInputValue);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Abort previous request
      }
      abortControllerRef.current = new AbortController(); // Create a new controller for the new request

      try {
        setAutocompleteLoading(true);
        setOpen(true);

        const res = await newRequest.get(
          `/invoice/v1/searchPOSInvoiceBatch?keyword=${newInputValue}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );
        console.log(res);

        const crs = res?.data?.map((item) => {
          return {
            ...item, // Spread all existing properties of the item
            bulkCashDocNo: item.bulkCashDocNo,
            bankDepositNo: item.bankDepositNo,
            bulkCashRefNo: item.bulkCashRefNo,
          };
        });

        setMatchReceiptsList(crs);
      
        setOpen(true);
        setAutocompleteLoading(false);

        // fetchData();
      } catch (error) {
        console.error(error);
        setMatchReceiptsList([]); // Clear the data list if an error occurs
        setOpen(false);
        setAutocompleteLoading(false);
      }
    },
    400
  );



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

    setTotalInvoiceAmount(totalINWithVAT.toFixed(2));
    setExchangeAmount(totalSRWithVAT.toFixed(2));
    setRemainingAmount(remainingAmount.toFixed(2));
  };

  const fetchData = async (value) => {
    setIsLoading(true);
    // console.log(value);
    try {
      const response = await newRequest.get(
        `/invoice/v1/getPOSInvoiceMaster?filter[batchId]=${value?.id}`
      );
      setData(response?.data || []);
      calculateAmounts(response?.data);
    //   console.log(response.data);
      setIsLoading(false);

    } catch (err) {
      console.log(err);
      setIsLoading(false);
      toast.error(err?.response?.data?.message || "An error occurred");
    }
  };


  const [isAddBankDepositPopupVisible, setAddBankDepositPopupVisible] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setAddBankDepositPopupVisible(true);
    // console.log(row)
    sessionStorage.setItem("updateListOfEmployeeData", JSON.stringify(selectedMatchReceipts));
  };

  // after the success of popup
  const resetComboBox = () => {
    setSelectedMatchReceipts(null);
    setButtonEnabled(false);
  };

  const handleRowClickInParent = async () => {
    
  }; 



    // const [zatcaQrcode, setZatcaQrcode] = useState(null);
    const handleInvoiceGenerator = async (selectedRow) => {
        const {
          createdAt,
          AdjAmount,
          InvoiceNo,
          TransactionCode,
        } = selectedRow;
      
        try {
    
          const dynamicTransactionCode = TransactionCode ? TransactionCode.slice(-2) : '';
          console.log(dynamicTransactionCode);
    
          const invoiceResponse = await newRequest.get(
            // `/invoice/v1/headers-and-line-items?InvoiceNo=${InvoiceNo}`
            `/invoice/v1/headers-and-line-items?InvoiceNo=${InvoiceNo}&TransactionCode=${dynamicTransactionCode}`
          );
      
          const invoiceData = invoiceResponse?.data?.data;
          
          // console.log("Fetched invoice data:", invoiceData);
    
          const { invoiceDetails } = invoiceData;
        
          let totalGrossAmount = 0;
          let totalVAT = 0;
    
          // Loop through invoiceDetails and calculate gross, VAT, and total amounts
          invoiceDetails.forEach((item) => {
            const itemGross = item.ItemPrice * item.ItemQry; // Calculate gross amount for each item
            const itemVAT = itemGross * 0.15; // Calculate VAT for each item (15%)
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
            throw new Error('QR code data not generated properly.');
          }
    
          toast.success("Invoice generated and ready to print!");
        } catch (err) {
          toast.error(err?.response?.data?.errors[0]?.msg || "An error occurred while generating the invoice");
        }
      };
      
      
      // invoice generate
      const handlePrintSalesInvoice = async (selectedRow, invoiceData, qrCodeDataFromApi) => {
        
        const {
          InvoiceNo,
          DocNo,
        } = selectedRow;
    
        const { invoiceHeader, invoiceDetails } = invoiceData;
     
        // Generate QR code data URL
        const qrCodeDataURL = await QRCode.toDataURL(`${InvoiceNo}`);
        
        const formattedDate = new Date(invoiceHeader?.TransactionDate).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });    
    
        let salesInvoiceTitle = '';
        const lastTwoTransactionCode = invoiceHeader?.TransactionCode.slice(-2);
    
        if (lastTwoTransactionCode === 'IN') {
            salesInvoiceTitle = 'SALES INVOICE';
        } else if (lastTwoTransactionCode === 'SR') {
            salesInvoiceTitle = 'CREDIT NOTE';
        }
    
        // Calculate total VAT
        let totalGrossAmount = 0;
        let totalVAT = 0;
        let totalAmountWithVAT = 0;
    
        // Loop through invoiceDetails and calculate gross, VAT, and total amounts
        invoiceDetails.forEach((item) => {
          const itemGross = item.ItemPrice * item.ItemQry; // Calculate gross amount for each item
          const itemVAT = itemGross * 0.15; // Calculate VAT for each item (15%)
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
                <div><span class="field-label">Customer: </span>${invoiceHeader?.CustomerName}</div>
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
               ${invoiceDetails.map(
                  (item) => `
                    <tr>
                      <td style="border-bottom: none;">${item.ItemSKU}</td>
                      <td style="border-bottom: none;">${item.ItemQry}</td>
                      <td style="border-bottom: none;">${item.ItemPrice}</td>
                      <td style="border-bottom: none;">${(item.ItemPrice * 1.15).toFixed(2)}</td>
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
                  .join("")
                }
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


      const handleMatchingTransactions = async () => {
        setMatchingTransactionLaoder(true);   
        const payload = {
          url: newERPBaseUrl,
          data: [
            {
              BrvDocNo: selectedMatchReceipts?.bulkCashDocNo,
            //   BrvDocNo: "2024003208",
              MatchingTransactions: data.map((row) => ({
                DocNo: row?.DocNo,        
                TransactionCode: row?.TransactionCode,      
                CustCode: row?.CustomerCode,         
                // PendingAmount: `${row?.PendingAmount}`,  // Convert to string
                // AdjAmount: `${row?.AdjAmount}`          // Convert to string
                PendingAmount: `${(row?.PendingAmount * 1.15).toFixed(2)}`,
                AdjAmount: `${(row?.AdjAmount * 1.15).toFixed(2)}`
              }))
            }
          ],
          COMPANY: "SLIC",
          USERID: slicUserData?.UserLoginID,
          APICODE: "BULKBRVMATCHAPI",
          LANG: "ENG"
        };
    
        try {
          const response = await ErpTeamRequest.post(
            "/slicuat05api/v1/postData",
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
    
          // Check for 200 status and if the message property exists
          if (response?.status === 200 && response?.data?.message) {
            toast.success(response.data.message);  // First API message
    
            const secondResponse = await newRequest.put(
              `/invoice/v1/updatePOSInvoiceBatch/${selectedMatchReceipts?.id}`,
              {
                isMatched: true,
              }
            );
            // Display message from the second API response
            if (secondResponse?.data?.message) {
              toast.success(secondResponse.data.message || "POS Invoice Batch updated successfully!");
              fetchData();
              resetComboBox();
            } 
          } else {
            throw new Error("Message property missing from API response");
          }

        } catch (error) {
          toast.error(
            error?.response?.data?.error || error.message || "Error in matching transactions."
          );
          console.error("Matching transaction error:", error);
        }
    
        setMatchingTransactionLaoder(false);
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
                <div className="px-3 sm:w-[30%] w-full">
                  <Autocomplete
                    id="companyName"
                    required
                    options={matchReceiptsList}
                    // bulkCashDocNo: item.bulkCashDocNo,
                    // bankDepositNo: item.bankDepositNo,
                    // bulkCashRefNo: item.bulkCashRefNo,
                    getOptionLabel={(option) =>
                        option && option.bulkCashDocNo
                        ? `${option?.bulkCashDocNo} - ${option?.bulkCashRefNo}`
                        : ""
                    }
                    onChange={handleGPCAutoCompleteChange}
                    value={selectedMatchReceipts}
                    onInputChange={(event, newInputValue, params) =>
                        debouncedHandleAutoCompleteInputChange(
                        event,
                        newInputValue,
                        params
                        )
                    }
                    loading={autocompleteLoading}
                    sx={{ marginTop: "10px" }}
                    open={open}
                    onOpen={() => {
                        // setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    renderOption={(props, option) => (
                        <li key={option.bulkCashDocNo} {...props}>
                        {option
                            ? `${option.bulkCashDocNo} - ${option.bulkCashRefNo}`
                            : "No options"}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                        // required
                        error={isSubmitClicked && !selectedMatchReceipts?.bulkCashDocNo}
                        helperText={
                            isSubmitClicked && !selectedMatchReceipts?.bulkCashDocNo
                            ? "Products is required"
                            : ""
                        }
                        {...params}
                        label={`${t("Search Match Receipts")}`}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                            <React.Fragment>
                                {autocompleteLoading ? (
                                <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                            ),
                        }}
                        sx={{
                            "& label.Mui-focused": {
                            color: "#00006A",
                            },
                            "& .MuiInput-underline:after": {
                            borderBottomColor: "#00006A",
                            },
                            "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                                borderColor: "#000000",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#000000",
                            },
                            },
                        }}
                        />
                     )}
                    />
                </div>
                <div className="flex justify-end items-center w-full gap-3">
                  <button
                    className={`px-3 py-2 rounded-md font-sans mt-2 transition duration-300 ease-in-out ${
                      buttonEnabled
                        ? "bg-secondary hover:bg-primary text-white hover:text-black"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                    disabled={!buttonEnabled}
                    onClick={handleShowUpdatePopup}
                  >
                    Add Bank Deposit Number
                  </button>

                  <div className="mt-2">
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: matchingButtonEnabled ? "#1d2f90" : "#9ca3af",
                        color: matchingButtonText === "Already Matched" ? "#000000" : "#ffffff",
                      }}
                      type="button"
                      onClick={handleMatchingTransactions}
                      disabled={!matchingButtonEnabled}
                      className="ml-2"
                      endIcon={
                        matchingTransactionLoader ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        null
                      )
                     }
                    >
                      {matchingButtonText}
                    </Button>
                  </div>
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
              title={t("POS Bulk Match Receipts")}
              columnsName={posBulkCashreceiptInvoiceColumns(t)}
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
        <div className={`flex  ${i18n.language === "ar" ? " justify-start" : "justify-end"}`}>
          <div className="bg-white p-4 rounded shadow-md sm:w-[60%] w-full">
            <div className="flex flex-col gap-4">
              <div className={`flex justify-between items-center ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row"}`}>
                <label className={`block text-gray-700 font-bold ${i18n.language === 'ar' ? "direction-rtl" : 'text-start direction-ltr'}`}>
                  {t("Total Invoice Amount WithVAT(15%)")}:
                </label>
                <input
                  type="text"
                  value={totalInvoiceAmount}
                  readOnly
                 className={`mt-1 p-2 border bg-gray-100 w-[60%] ${i18n.language === "ar" ? "text-start" : "text-end"}`}
                  
                />
              </div>

              <div className={`flex justify-between items-center ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row"}`}>
                <label className={`block text-gray-700 font-bold ${i18n.language === 'ar' ? "direction-rtl" : 'text-start direction-ltr'}`}>
                  {t("Exchange Amount")}
                </label>
                <input
                  type="text"
                  value={exchangeAmount}
                  readOnly
                 className={`mt-1 p-2 border bg-gray-100 w-[60%]  ${i18n.language === "ar" ? "text-start" : "text-end"}`}
                />
              </div>

              <div className={`flex justify-between items-center ${i18n.language === "ar" ? "flex-row-reverse" : "flex-row"}`}>
                <label className={`block text-gray-700 font-bold ${i18n.language === 'ar' ? "direction-rtl" : 'text-start direction-ltr'}`}>
                  {t("Remaining Amount")}
                </label>
                <input
                  type="text"
                  value={remainingAmount}
                  readOnly
                 className={`mt-1 p-2 border bg-gray-100  w-[60%] ${i18n.language === "ar" ? "text-start" : "text-end"}`}
                />
              </div>
            </div>
          </div>
        </div>


        {isAddBankDepositPopupVisible && (
          <AddBankDepositNoPopUp
            isVisible={isAddBankDepositPopupVisible}
            setVisibility={setAddBankDepositPopupVisible}
            refreshGTINData={fetchData}
            resetComboBox={resetComboBox}
          />
        )}
        
      </div>
    </SideNav>
  );
};

export default PosBulkMatchReceipts;