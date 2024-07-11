const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CustomError = require("../exceptions/customError");

class TblPOFPOPMasterModel {
  // Create a new record
  static async create(data) {
    try {
      const newRecord = await prisma.tblPOFPOPMaster.create({
        data,
      });
      return newRecord;
    } catch (error) {
      throw new CustomError("Error creating record");
    }
  }

  // Read all records
  static async findAll() {
    try {
      const records = await prisma.tblPOFPOPMaster.findMany({
        orderBy: {
          createdAt: "asc", // Or 'desc' for descending order
        },
      });
      return records;
    } catch (error) {
      throw new CustomError("Error fetching records");
    }
  }

  // Paginated
  static async findPaginated(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const records = await prisma.tblPOFPOPMaster.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "asc", // Or 'desc' for descending order
        },
      });

      const totalRecords = await prisma.tblPOFPOPMaster.count();

      return {
        records,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      };
    } catch (error) {
      throw new CustomError("Error fetching paginated records");
    }
  }

  // Read a single record by ID
  static async findById(id) {
    try {
      const record = await prisma.tblPOFPOPMaster.findUnique({
        where: { tblPOFPOPMasterID: id },
      });
      return record;
    } catch (error) {
      throw new CustomError("Error fetching record");
    }
  }

  // Update a record by ID
  static async update(id, data) {
    try {
      const updatedRecord = await prisma.tblPOFPOPMaster.update({
        where: { tblPOFPOPMasterID: id },
        data,
      });
      return updatedRecord;
    } catch (error) {
      throw new CustomError("Error updating record");
    }
  }

  // Delete a record by ID
  static async delete(id) {
    try {
      const deletedRecord = await prisma.tblPOFPOPMaster.delete({
        where: { tblPOFPOPMasterID: id },
      });
      return deletedRecord;
    } catch (error) {
      throw new CustomError("Error deleting record");
    }
  }
}

module.exports = TblPOFPOPMasterModel;
