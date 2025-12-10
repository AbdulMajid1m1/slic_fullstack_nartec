const express = require("express");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

const CustomError = require("./exceptions/customError");
const swaggerSpec = require("./config/swagger");
const response = require("./utils/response");
const itemCodesRoutes = require("./routes/tblItemCodes1S1Br");
const userRoutes = require("./routes/TblUsers");
const foreignPORoutes = require("./routes/tblPOFPOMaster");
const locationsCompaniesRoutes = require("./routes/locationCompany");
const lineItemsRoutes = require("./routes/TblIPOFPODetails");
const customerNamesRoutes = require("./routes/TblCustomerNames");
const salesOrdersRoutes = require("./routes/tblFSOMaster");
const transactionsRoutes = require("./routes/TrxCodesType");
const slicuat05apiRoutes = require("./routes/slicuat05api");
const zatcaRoutes = require("./routes/zatcaRoutes");
const rolesRoutes = require("./routes/tblAppRoles");
const invoiceRoutes = require("./routes/invoice");
const exchangeInvoiceRoutes = require("./routes/TblSalesExchangeInvoicetmp");
const whatsappRoutes = require("./routes/whatsappRoutes.js");
const languageRoutes = require("./routes/languageRoute.js");
const controlSerialRoutes = require("./routes/controlSerial");
const supplierRoutes = require("./routes/supplierRoute");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
// Increase payload limits for large file imports (100k+ records)
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from the "uploads" and "public" directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public"))); // Serve public files at root level

// Add your routes...
app.use("/api/itemCodes", itemCodesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foreignPO", foreignPORoutes);
app.use("/api/locationsCompanies", locationsCompaniesRoutes);
app.use("/api/lineItems", lineItemsRoutes);
app.use("/api/customerNames", customerNamesRoutes);
app.use("/api/salesOrders", salesOrdersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/slicuat05api", slicuat05apiRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/zatca", zatcaRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/exchangeInvoice", exchangeInvoiceRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/language", languageRoutes);
app.use("/api/controlSerials", controlSerialRoutes);
app.use("/api/suppliers", supplierRoutes);

app.get("/test", (req, res) => {
  function calculateCheckDigit(gtinWithoutCheckDigit) {
    const digits = gtinWithoutCheckDigit.split("").map(Number);
    let sum = 0;

    // EAN-13 check digit calculation (modulo-10 algorithm)
    for (let i = 0; i < digits.length; i++) {
      sum += i % 2 === 0 ? digits[i] * 1 : digits[i] * 3;
    }

    const remainder = sum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;

    return checkDigit.toString();
  }

  let barcod3 = calculateCheckDigit("628789803474");
  console.log(barcod3);
  res.send(barcod3);
});

app.use((error, req, res, next) => {
  console.log(error);
  let status = 500;
  let message = "Internal Server Error";
  let data = null;
  let success = false;

  if (error instanceof CustomError) {
    status = error.statusCode || 500;
    message = error.message || message;
    data = error.data || null;
  }

  res
    .status(status)
    .json(response(status, success, message, data, error?.stack));
});

// app.get("*", (req, res) => {
//   res.sendFile(__dirname + "/public/index.html");
// });

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.use((req, res, next) => {
  const error = new CustomError(`No route found for ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.listen(port, function () {
  console.log("Server is running on port " + port);
});
