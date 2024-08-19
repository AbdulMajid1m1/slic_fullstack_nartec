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

  static async findByCode(code) {
    try {
      const trxCode = await prisma.trxCodesType.findUnique({
        where: { code: code },
      });
      return trxCode;
    } catch (error) {
      throw new CustomError(`Error finding transaction code: ${code}`);
    }
  }

  static async bulkCreate(codesList) {
    try {
      const createdCodes = await prisma.trxCodesType.createMany({
        data: codesList,
        skipDuplicates: true,
      });
      return createdCodes;
    } catch (error) {
      throw new CustomError("Error creating transaction codes in bulk");
    }
  }

  static async upsert(code, data) {
    try {
      const upsertedCode = await prisma.trxCodesType.upsert({
        where: { code: code },
        update: data,
        create: { ...data, code: code },
      });
      return upsertedCode;
    } catch (error) {
      throw new CustomError(`Error upserting transaction code: ${code}`);
    }
  }

  static async deleteByCode(code) {
    try {
      await prisma.trxCodesType.delete({
        where: { code: code },
      });
    } catch (error) {
      throw new CustomError(`Error deleting transaction code: ${code}`);
    }
  }
}

module.exports = TrxCodesType;
