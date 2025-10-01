import React from "react";
import { QRCodeSVG } from "qrcode.react";
import logo from "../../../Images/sliclogo.png";

const GTINBarcodePrint = ({ selectedRows, onPrintComplete }) => {
  const handlePrint = () => {
    if (selectedRows.length === 0) {
      return;
    }

    const printWindow = window.open("", "Print Window", "height=400,width=800");
    const html =
      "<html><head><title>GTIN Number</title>" +
      "<style>" +
      "@page { size: 2in 1in; margin: 0; }" +
      "body { font-family: Arial, sans-serif; margin: 0; }" +
      "#header { display: flex; justify-content: start;}" +
      "#imglogo {height: 15px; width: 50px; visibility: hidden;}" +   
      "#Qrcodeserails { width: 100%; height: 88px; display: flex; align-items: center; justify-content: center; }" +
      "#itemcode { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 180px; }" +
      "#inside-BRCode { flex-shrink: 0; display: flex; justify-content: center; align-items: center; }" +
      "#description { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 0; }" +
      "#gtin { font-size: 9px; font-weight: 600; margin: 0; color: #333; line-height: 1.2; }" +
      "#expiry { font-size: 9px; font-weight: 600; margin: 0; color: #333; line-height: 1.2; }" +
      "#batch { font-size: 9px; font-weight: 600; margin: 0; color: #333; line-height: 1.2; word-break: break-all; }" +
      "</style>" +
      "</head><body>" +
      '<div id="printBarcode12"></div>' +
      "</body></html>";

    printWindow.document.write(html);
    const barcodeContainer = printWindow.document.getElementById("printBarcode12");
    const barcode = document.getElementById("gtin-products-container").cloneNode(true);
    barcodeContainer.appendChild(barcode);

    const logoImg = new Image();
    logoImg.src = logo;

    logoImg.onload = function () {
      printWindow.print();
      printWindow.close();
      
      if (onPrintComplete) {
        setTimeout(() => {
          onPrintComplete();
        }, 500);
      }
    };
  };

  return (
    <>
      {/* Hidden container for print */}
      <div id="gtin-products-container">
        {selectedRows.map((barcode, index) => {
          return (
            <div id="Qrcodeserails" className="hidden" key={index}>
              <div id="itemcode">
                {/* Left side - QR Code */}
                <div id="inside-BRCode">
                  <QRCodeSVG
                    value={`${barcode?.ItemCode} - ${barcode?.ProductSize} - ${barcode?.GTIN}`}
                    width="60"
                    height="45"
                    level="M"
                    includeMargin={false}
                  />
                </div>

                {/* Right side - Data */}
                <div id="description">
                  <div id="gtin">Style# : {barcode?.ItemCode}</div>
                  <div id="expiry">Size# : {barcode?.ProductSize}</div>
                  <div id="batch">GTIN# : {barcode?.GTIN}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expose print function via ref if needed */}
      <button onClick={handlePrint} style={{ display: 'none' }} id="gtin-print-trigger" />
    </>
  );
};

export default GTINBarcodePrint;