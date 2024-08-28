const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class POSInvoiceMaster {
  static async getInvoiceMasterById(id) {
    try {
      const master = await prisma.tblPOSInvoiceMaster.findUnique({
        where: { id },
      });
      return master;
    } catch (error) {
      console.error("Error fetching invoice master by ID:", error);
      throw new Error("Error fetching invoice master by ID");
    }
  }

  static async createInvoiceMaster(data) {
    try {
      const newMaster = await prisma.tblPOSInvoiceMaster.create({
        data,
      });
      return newMaster;
    } catch (error) {
      console.error("Error creating invoice master:", error);
      throw new Error("Error creating invoice master");
    }
  }

  static async updateInvoiceMaster(id, data) {
    try {
      const updatedMaster = await prisma.tblPOSInvoiceMaster.update({
        where: { id },
        data,
      });
      return updatedMaster;
    } catch (error) {
      console.error("Error updating invoice master:", error);
      throw new Error("Error updating invoice master");
    }
  }

  static async deleteInvoiceMaster(id) {
    try {
      const deletedMaster = await prisma.tblPOSInvoiceMaster.delete({
        where: { id },
      });
      return deletedMaster;
    } catch (error) {
      console.error("Error deleting invoice master:", error);
      throw new Error("Error deleting invoice master");
    }
  }

  static async getAllInvoiceMasters() {
    try {
      const masters = await prisma.tblPOSInvoiceMaster.findMany({});
      return masters;
    } catch (error) {
      console.error("Error fetching all invoice masters:", error);
      throw new Error("Error fetching all invoice masters");
    }
  }

  static async getInvoiceMasterByField(field, value) {
    try {
      const masters = await prisma.tblPOSInvoiceMaster.findMany({
        where: {
          [field]: value,
        },
      });
      return masters;
    } catch (error) {
      console.error(`Error fetching invoice master by ${field}:`, error);
      throw new Error(`Error fetching invoice master by ${field}`);
    }
  }

  static async getSingleInvoiceMasterByField(field, value) {
    try {
      const masters = await prisma.tblPOSInvoiceMaster.findFirst({
        where: {
          [field]: value,
        },
      });
      return masters;
    } catch (error) {
      console.error(`Error fetching invoice master by ${field}:`, error);
      throw new Error(`Error fetching invoice master by ${field}`);
    }
  }
}

module.exports = POSInvoiceMaster;
