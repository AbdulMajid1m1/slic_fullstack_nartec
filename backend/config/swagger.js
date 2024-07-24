const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "SLIC",
    version: "1.0.0",
    description: "APIs Documentation",
    contact: {
      name: "Wasim Zaman",
      email: "wasim@sairatec-solutions.com",
    },
  },
  servers: [
    {
      url: "http://gs1ksa.org:8080",
      description: "Production server",
    },
    {
      url: "http://localhost:8080",
      description: "Development server",
    },

    // add more hosts...
  ],
};

var options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    path.join(__dirname, "../docs/swagger/tblItemCodes1S1Br.js"),
    path.join(__dirname, "../docs/swagger/TblUsers.js"),
    path.join(__dirname, "../docs/swagger/TblPOFPOPMaster.js"),
    path.join(__dirname, "../docs/swagger/TblIPOFPODetails.js"),
    path.join(__dirname, "../docs/swagger/TblCustomerNames.js"),
    path.join(__dirname, "../docs/swagger/tblFSOMaster.js"),
    path.join(__dirname, "../docs/swagger/TrxCodesType.js"),
    path.join(__dirname, "../docs/swagger/locationCompany.js"),
    path.join(__dirname, "../docs/swagger/slicuat05api.js"),
    // add more paths...
  ],
};

var swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
