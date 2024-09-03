const POSInvoiceMaster = require("./POSInvoiceMaster");
const POSInvoiceDetails = require("./POSInvoiceDetails");

class InvoiceController {
  static async createInvoice(req, res) {
    const { master, details } = req.body;

    if (!master || !details || !Array.isArray(details)) {
      return res.status(400).json({
        message:
          "Invalid data format. 'master' should be an object and 'details' should be an array.",
      });
    }

    const prisma = new PrismaClient();
    const transaction = await prisma.$transaction();

    try {
      // Create the master invoice
      const newMaster = await POSInvoiceMaster.createInvoiceMaster(master);

      // Create each detail item associated with the master invoice
      const detailPromises = details.map(async (detail) => {
        const detailData = { ...detail, Head_SYS_ID: newMaster.Head_SYS_ID };
        return await POSInvoiceDetails.createInvoiceDetails(detailData);
      });

      const newDetails = await Promise.all(detailPromises);

      await transaction.commit();

      return res.status(201).json({
        message: "Invoice created successfully",
        invoiceMaster: newMaster,
        invoiceDetails: newDetails,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating invoice:", error);
      return res.status(500).json({
        message: "Error creating invoice",
        error: error.message,
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}

module.exports = InvoiceController;
