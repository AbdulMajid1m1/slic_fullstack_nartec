const { PrismaClient } = require("@prisma/client");
const { body } = require("express-validator");
const prisma = new PrismaClient();

class ItemCodeModel {
  static async create(data) {
    return await prisma.tblItemCodes1S1Br.create({
      data,
    });
  }

  static async findAllWithPagination(page = 1, limit = 10, search = null) {
    const skip = (page - 1) * limit;

    // Build the query object
    const query = search
      ? {
          where: {
            OR: [
              { GTIN: { contains: search } },
              { ItemCode: { contains: search } },
              { EnglishName: { contains: search } },
              { ArabicName: { contains: search } },
              { LotNo: { contains: search } },
              { sERIALnUMBER: { contains: search } },
              { WHLocation: { contains: search } },
              { BinLocation: { contains: search } },
              {
                QRCodeInternational: { contains: search },
              },
              { ModelName: { contains: search } },
              { ProductType: { contains: search } },
              { BrandName: { contains: search } },
              { PackagingType: { contains: search } },
              { ProductUnit: { contains: search } },
              { ProductSize: { contains: search } },
            ],
          },
        }
      : {};

    const [itemCodes, totalItems] = await Promise.all([
      prisma.tblItemCodes1S1Br.findMany({
        skip,
        take: limit,
        ...query,
      }),
      prisma.tblItemCodes1S1Br.count({
        where: query.where,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      itemCodes,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  static async findAll() {
    const itemCodes = await prisma.tblItemCodes1S1Br.findMany({
      orderBy: {
        Created_at: "desc", // or 'desc' for descending order
      },
    });
    return itemCodes;
  }

  static async findById(gtin) {
    return await prisma.tblItemCodes1S1Br.findFirst({
      where: { GTIN: gtin.toString() },
    });
  }

  static async findByItemCode(itemCode) {
    return await prisma.tblItemCodes1S1Br.findFirst({
      where: { ItemCode: itemCode.toString() },
    });
  }

  static async findByGTIN(gtin) {
    return await prisma.tblItemCodes1S1Br.findMany({
      where: {
        GTIN: {
          contains: gtin.toString(),
        },
      },
    });
  }

  static async update(id, data) {
    const itemCode = await prisma.tblItemCodes1S1Br.update({
      where: { id: id.toString() },
      data,
    });

    return itemCode;
  }

  static async delete(gtin) {
    return await prisma.tblItemCodes1S1Br.delete({
      where: { GTIN: gtin.toString() },
    });
  }

  static async deleteById(id) {
    return await prisma.tblItemCodes1S1Br.delete({
      where: { id: id },
    });
  }

  static async searchByGtin(gtin) {
    return await prisma.tblItemCodes1S1Br.findMany({
      where: {
        GTIN: {
          contains: gtin.toString(),
        },
      },
    });
  }
}

module.exports = ItemCodeModel;
