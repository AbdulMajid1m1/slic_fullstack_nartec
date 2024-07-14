const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CustomError = require("../exceptions/customError");

class CustomerName {
  static async fetchAll() {
    try {
      const customers = await prisma.tblCustomerNames.findMany();
      return customers;
    } catch (error) {
      error.message = "Failed to retrieve customers";
      error.statusCode = 404;
      throw error;
    }
  }

  // Add more methods as needed, e.g., create, update, delete
}

module.exports = CustomerName;
