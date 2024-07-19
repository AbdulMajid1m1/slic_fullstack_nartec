const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CustomError = require("../exceptions/customError");

class TrxCodesType {
  static async fetchAll() {
    try {
      const trxCodes = await prisma.trxCodesType.findMany();
      return trxCodes;
    } catch (error) {
      throw new CustomError("Error fetching transaction codes");
    }
  }

  // Add more methods as needed, e.g., create, update, delete
}

module.exports = TrxCodesType;
