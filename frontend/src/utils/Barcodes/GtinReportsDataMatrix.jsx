import React, { useRef, useEffect } from "react";
import bwipjs from "bwip-js";

export const GtinDataMatrixGenerator = ({ text }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "datamatrix", // Barcode type
          text: text, // Text to encode
          scale: 3, // Scale factor
          height: 14, // Bar height, in millimeters
          includetext: true, // Show human-readable text
          textxalign: "center", // Always good to set this
          width: 15,
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [text]);

  return <canvas id="dataMatrixCanvas" ref={canvasRef} />;
};

// Usage
// <BarcodeGenerator text={allData?.barcode} />
