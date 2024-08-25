const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SalesReturnInvoiceTemp {
  static async getSalesReturnInvoiceById(id) {
    try {
      console.log("Creating Invoice with Data:", data);
      const newInvoice = await prisma.tblSalesReturnInvoicetmp.create({ data });
      return newInvoice;
    } catch (error) {
      console.error("Error fetching sales return invoice by ID:", error);
      throw new Error("Error fetching sales return invoice by ID");
    }
  }

  static async createSalesReturnInvoice(data) {
    try {
      const newInvoice = await prisma.tblSalesReturnInvoicetmp.create({
        data,
      });
      return newInvoice;
    } catch (error) {
      console.error("Error creating sales return invoice:", error);
      throw new Error("Error creating sales return invoice");
    }
  }

  static async updateSalesReturnInvoice(id, data) {
    try {
      const updatedInvoice = await prisma.tblSalesReturnInvoicetmp.update({
        where: { id },
        data,
      });
      return updatedInvoice;
    } catch (error) {
      console.error("Error updating sales return invoice:", error);
      throw new Error("Error updating sales return invoice");
    }
  }

  static async deleteSalesReturnInvoice(id) {
    try {
      const deletedInvoice = await prisma.tblSalesReturnInvoicetmp.delete({
        where: { id },
      });
      return deletedInvoice;
    } catch (error) {
      console.error("Error deleting sales return invoice:", error);
      throw new Error("Error deleting sales return invoice");
    }
  }

  static async getAllSalesReturnInvoices() {
    try {
      const invoices = await prisma.tblSalesReturnInvoicetmp.findMany({});
      return invoices;
    } catch (error) {
      console.error("Error fetching all sales return invoices:", error);
      throw new Error("Error fetching all sales return invoices");
    }
  }

  static async getSalesReturnInvoicesByField(field, value) {
    try {
      const invoices = await prisma.tblSalesReturnInvoicetmp.findMany({
        where: {
          [field]: value,
        },
      });
      return invoices;
    } catch (error) {
      console.error(`Error fetching sales return invoices by ${field}:`, error);
      throw new Error(`Error fetching sales return invoices by ${field}`);
    }
  }
}

module.exports = SalesReturnInvoiceTemp;
