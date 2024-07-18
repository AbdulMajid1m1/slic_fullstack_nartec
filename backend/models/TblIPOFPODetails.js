const { PrismaClient } = require("@prisma/client");
const CustomError = require("../exceptions/customError");

const prisma = new PrismaClient();

class POFPODetails {
  static async getRecordsByHeadSysId(headSysId) {
    try {
      const records = await prisma.tblPOFPODetails.findMany({
        where: {
          HEAD_SYS_ID: parseFloat(headSysId),
        },
      });
      return records;
    } catch (error) {
      throw CustomError("Error occured while fetching line items");
    }
  }

  static async fetchByMultipleIds(headSysIds) {
    try {
      const idsArray = headSysIds.map((id) => parseFloat(id));
      const records = await prisma.tblPOFPODetails.findMany({
        where: {
          HEAD_SYS_ID: {
            in: idsArray,
          },
        },
      });
      return records;
    } catch (error) {
      console.log(error);
      throw new CustomError("Error occured while fetching line items");
    }
  }
}

module.exports = POFPODetails;
