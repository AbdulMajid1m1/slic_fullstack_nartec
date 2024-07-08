import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";

export default function DownloadButton({ id, name }) {
    const { t, i18n } = useTranslation();
  const downloadBarcode = () => {
    const canvas = document.querySelector("#" + id);

    html2canvas(canvas).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width * 2, canvas.height * 2],
      });

      const marginLeft = (pdf.internal.pageSize.getWidth() - canvas.width) / 2;
      const marginTop = (pdf.internal.pageSize.getHeight() - canvas.height) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        marginLeft,
        marginTop,
        canvas.width,
        canvas.height
      );
      pdf.save(name + ".pdf");
    });
  };

  return (
    <Button
      variant="contained"
      style={{
        backgroundColor: "#021F69",
        color: "white",
      }}
      startIcon={<DownloadIcon />}
      onClick={downloadBarcode}
    >
      {t("Download")}
    </Button>
  );
}
