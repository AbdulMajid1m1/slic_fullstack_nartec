import React, { useRef, useEffect } from "react";
import bwipjs from "bwip-js";

export const BarcodeGenerator = ({ text }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "code128", // Barcode type
          text: text, // Text to encode
        //   scaleX: 0.7, // Barcode width,
          scale: 2, // Scale factor
          height: 9, // Bar height, in millimeters
          width: 10,
          includetext: true, // Show human-readable text
          textxalign: "center", // Always good to set this
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [text]);

  return <canvas id="barcodeCanvas" ref={canvasRef} />;
};

export const DataMatrixGenerator = ({ text }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: "datamatrix", // Barcode type
          text: text, // Text to encode
          scale: 3, // Scale factor
          height: 9, // Bar height, in millimeters
          includetext: true, // Show human-readable text
          textxalign: "center", // Always good to set this
          width: 10,
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
