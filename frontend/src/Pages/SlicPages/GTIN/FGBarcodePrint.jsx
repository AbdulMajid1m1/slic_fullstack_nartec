import React from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import imageLiveUrl from "../../../utils/urlConverter/imageLiveUrl";

const FGBarcodePrint = ({ selectedRows, onPrintComplete }) => {
  const handlePrint = () => {
    console.log('Selected Rows for Printing:', selectedRows);
    if (selectedRows.length === 0) {
      return;
    }

    const printWindow = window.open('', 'Print Window', 'height=400,width=800');
  
    const html = '<html><head><title>FG Products</title>' +
      '<style>' +
      '@page { size: 3.7in 2.3in; margin: 0; }' +
      'body { font-size: 13px; margin: 0; padding: 0;}' +
      '.label-container { width: 3.7in; height: 2.2in; position: relative; padding: 8px; background: white; box-sizing: border-box; page-break-after: always;}' +
      '.label-container:last-child { page-break-after: auto;}' +
      
      '/* Left side - Logo and brand */' +
      '/* Item Code - Large number top left */' +
      '.item-code-large { position: absolute; top: 12px; left: 15px; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif;}' +
      
      '/* QR Code - Right of Item Code */' +
      '.qr-code { position: absolute; top: 12px; left: 125px;}' +
      '.qr-code svg { width: 35px !important; height: 35px !important; display: block;}' +
      
      '/* ISO Text */' +
      '.iso-text { position: absolute; top: 55px; left: 15px; font-size: 11px; font-family: Arial, sans-serif;}' +
      
      '/* Shoe Image */' +
      '.shoe-image { position: absolute; top: 75px; left: 15px; width: 200px; height: 125px; object-fit: contain;}' +
            
      '/* Right side - Size, Color, Materials, Width - Values only */' +
      '.size-value { position: absolute; top: 12px; right: 20px; font-size: 36px; font-weight: bold; font-family: Arial, sans-serif;}' +
      '.color-value { position: absolute; top: 58px; right: 20px; font-size: 26px; font-weight: bold; font-family: Arial, sans-serif;}' +
      '.upper-value { position: absolute; top: 90px; right: 20px; font-size: 10px; font-family: Arial, sans-serif; text-align: right;}' +
      '.sole-value { position: absolute; top: 100px; right: 20px; font-size: 10px; font-family: Arial, sans-serif; text-align: right;}' +
      '.width-value { position: absolute; top: 110px; right: 30px; font-size: 26px; font-weight: bold; font-family: Arial, sans-serif;}' +
      
      '/* Barcode - Bottom Right */' +
      '.barcode-container { position: absolute; bottom: 6px; right: 5px;}' +
      
      '/* Date - Bottom Right */' +
      '.date-value { position: absolute; bottom: 0px; right: 20px; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif;}' +
      '</style>' +
      '</head><body>' +
      '<div id="printBarcode"></div>' +
      '</body></html>';

    printWindow.document.write(html);
    const barcodeContainer = printWindow.document.getElementById('printBarcode');
    const barcode = document.getElementById('fg-barcode-container').cloneNode(true);
    barcodeContainer.appendChild(barcode);

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      
      if (onPrintComplete) {
        setTimeout(() => {
          onPrintComplete();
        }, 500);
      }
    }, 500);
  };

  return (
    <>
      {/* Hidden container for print */}
      <div id="fg-barcode-container">
        {selectedRows.map((barcode, index) => (
          <div className="label-container hidden" key={index}>
            {/* QR Code */}
            <div className="qr-code">
              <QRCodeSVG
                value={barcode?.GTIN || '6287898001805'}
                size={45}
                level="M"
              />
            </div>

            {/* Item Code - Large number */}
            <div className="item-code-large">
              {barcode?.ItemCode || ''}
            </div>

            {/* ISO Text */}
            <div className="iso-text">
              {barcode?.label || ''}
            </div>

            {/* Shoe Image */}
            <img className="shoe-image" src={imageLiveUrl(barcode?.image)} alt="" />

            {/* Right side - Values only */}
            <div className="size-value">
              {barcode?.ProductSize || ''}
            </div>

            <div className="color-value">
              {barcode?.color || ''}
            </div>

            <div className="upper-value">
              {barcode?.upper || ''}
            </div>

            <div className="sole-value">
              {barcode?.sole || ''}
            </div>

            <div className="width-value">
              {barcode?.width || ''}
            </div>

            {/* Barcode */}
            <div className="barcode-container">
              <Barcode
                value={barcode?.GTIN || '6287898001805'}
                format="EAN13"
                width={1.2}
                height={32}
                background="transparent"
                fontSize={12}
              />
            </div>

            {/* Date */}
            <div className="date-value">
              {barcode?.Created_at 
                ? new Date(barcode.Created_at).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    year: 'numeric' 
                  }).replace(/(\d{2})\/(\d{4})/, '$1/$2')
                : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Expose print function via ref if needed */}
      <button onClick={handlePrint} style={{ display: 'none' }} id="fg-print-trigger" />
    </>
  );
};

export default FGBarcodePrint;