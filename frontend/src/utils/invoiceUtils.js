// src/utils/invoiceUtils.js

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import newRequest from './userRequest';
import { toast } from 'react-toastify';
import sliclogo from '../Images/sliclogo.png';

export const useInvoiceUtils = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [netWithVat, setNetWithVat] = useState('');
  const [totalVat, setTotalVat] = useState('');
  const [invoiceLoader, setInvoiceLoader] = useState(false);

  // Function to generate invoice number based on date and time
  const generateInvoiceNumber = () => {
    const now = new Date();
    const timestamp = Date.now();
    return `INV-${timestamp}`; // Or simply `timestamp` if you prefer it as a pure numeric value
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTodayDate(now.toISOString());
      setCurrentTime(
        now.toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'medium',
        })
      );
    };

    setInvoiceNumber(generateInvoiceNumber());
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate totals for Net with VAT, Total VAT, and Total Amount with VAT
  const calculateTotals = (data) => {
    let totalNet = 0;
    let totalVat = 0;

    data.forEach((item) => {
      totalNet += item.ItemPrice * item.Qty;
      totalVat += item.VAT * item.Qty;
    });

    setNetWithVat(totalNet);
    setTotalVat(totalVat);
    return totalNet + totalVat;
  };

  // Invoice generation API
  const handleInvoiceGenerator = async (data, totalAmountWithVat) => {
    if (data.length === 0) {
      toast.error('Please ensure barcode and data is available before proceeding.');
      return;
    }
    setInvoiceLoader(true);
    try {
      const res = await newRequest.post('/zatca/generateZatcaQRCode', {
        invoiceDate: todayDate,
        totalWithVat: totalAmountWithVat,
        vatTotal: Number(totalVat),
      });

      const qrCodeDataFromApi = res?.data?.qrCodeData;
      await handlePrintSalesInvoice(qrCodeDataFromApi, data);

      setNetWithVat('');
      setTotalVat('');
      toast.success('Invoice generated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.errors[0] || 'An error occurred while generating the invoice');
    } finally {
      setInvoiceLoader(false);
    }
  };

  // Function to print the sales invoice
  const handlePrintSalesInvoice = async (qrCodeData, data) => {
    const newInvoiceNumber = generateInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);
    const printWindow = window.open('', 'Print Window', 'height=800,width=800');

    // Generate QR code data URL
    const qrCodeDataURL = await QRCode.toDataURL(`${invoiceNumber}`);
    const html = `
      <html>
        <head>
          <title>Sales Invoice</title>
          <style>
            @page { size: 3in 10in; margin: 0; }
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
            <div>VAT#: 300456416500003</div>
            <div>CR#: 2050011041</div>
            <div>Unit No 1, Dammam 34334 - 3844, Saudi Arabia</div>
            <div>Tel. Number: 013 8121066</div>
          </div>

          <div class="sales-invoice-title">Sales Invoice</div>
          
          <div class="customer-info">
            <div><span class="field-label">Customer: </span>${customerName}</div>
            <div><span class="field-label">VAT#: </span>${netWithVat}</div>
            <div class="customer-invoiceNumber">
              <div>
                <div><span class="field-label">Receipt: </span>${invoiceNumber}</div>
                <div><span class="field-label">Date: </span>${currentTime}</div>
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
              ${data
                .map(
                  (item) => `
                <tr>
                  <td>${item.SKU}</td>
                  <td>${item.Qty}</td>
                  <td>${item.ItemPrice}</td>
                  <td>${item.ItemPrice * item.Qty}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="total-section">
            <div class="left-side">
              <div>
                <strong>Gross:</strong>
                <div class="arabic-label">(ريال) المجموع</div>
                ${netWithVat}
              </div>
              <div>
                <strong>VAT (15%):</strong>
                <div class="arabic-label">ضريبة القيمة المضافة</div>
                ${totalVat}
              </div>
              <div>
                <strong>Total Amount With VAT:</strong>
                <div class="arabic-label">المجموع</div>
                ${totalAmountWithVat}
              </div>
              <div>
                <strong>Paid:</strong>
                <div class="arabic-label">المدفوع</div>
                ${totalAmountWithVat}
              </div>
              <div>
                <strong>Change Due:</strong>
                <div class="arabic-label">المتبقي</div>
                0.00
              </div>
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
      QRCode.toCanvas(qrCodeCanvas, qrCodeData, { width: 380 }, function (error) {
        if (error) console.error(error);
        else {
          // Trigger the print dialog after the QR code is rendered
          printWindow.print();
          printWindow.close();
        }
      });
    };
  };

  return {
    currentTime,
    todayDate,
    invoiceNumber,
    netWithVat,
    totalVat,
    invoiceLoader,
    generateInvoiceNumber,
    handleInvoiceGenerator,
    calculateTotals,
    handlePrintSalesInvoice,
  };
};
