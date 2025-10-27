const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ControlSerialModel {
  /**
   * Create multiple control serials in bulk
   * @param {Array} serials - Array of serial objects with GTIN and serialNumber
   * @returns {Promise<Array>} - Created serial records
   */
  static async createBulk(serials) {
    return await prisma.controlSerial.createMany({
      data: serials,
      //   skipDuplicates: true,
    });
  }

  /**
   * Get a control serial by ID
   * @param {string} id - Serial ID
   * @returns {Promise<Object>} - Serial record with product details
   */
  static async findById(id) {
    return await prisma.controlSerial.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  /**
   * Get all control serials with pagination
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @param {string} search - Search by serialNumber or GTIN
   * @returns {Promise<Object>} - Paginated serials and pagination info
   */
  static async findAllWithPagination(page = 1, limit = 10, search = null) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { serialNumber: { contains: search } },
            { ItemCode: { contains: search } },
          ],
        }
      : {};

    const [controlSerials, total] = await Promise.all([
      prisma.controlSerial.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.controlSerial.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      controlSerials,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get all control serials
   * @returns {Promise<Array>} - All serial records
   */
  static async findAll() {
    return await prisma.controlSerial.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Search control serials by ItemCode
   * @param {string} itemCode - ItemCode to search
   * @returns {Promise<Array>} - Matching serials
   */
  static async findByItemCode(itemCode) {
    return await prisma.controlSerial.findMany({
      where: {
        ItemCode: itemCode,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Search control serials by serialNumber
   * @param {string} serialNumber - Serial number to search
   * @returns {Promise<Object>} - Matching serial
   */
  static async findBySerialNumber(serialNumber) {
    return await prisma.controlSerial.findUnique({
      where: {
        serialNumber,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Update a control serial
   * @param {string} id - Serial ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Updated serial
   */
  static async update(id, data) {
    return await prisma.controlSerial.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  /**
   * Delete a control serial
   * @param {string} id - Serial ID
   * @returns {Promise<Object>} - Deleted serial
   */
  static async deleteById(id) {
    return await prisma.controlSerial.delete({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  /**
   * Check if serial number already exists
   * @param {string} serialNumber - Serial number to check
   * @returns {Promise<boolean>} - True if exists
   */
  static async serialNumberExists(serialNumber) {
    const record = await prisma.controlSerial.findFirst({
      where: { serialNumber },
    });
    return !!record;
  }

  /**
   * Get the next series number for an ItemCode
   * @param {string} itemCode - ItemCode to get next series for
   * @returns {Promise<number>} - Next series number (6 digits with leading zeros)
   */
  static async getNextSeriesNumber(itemCode) {
    // Get all serials for this ItemCode
    const allSerials = await prisma.controlSerial.findMany({
      where: {
        ItemCode: itemCode,
      },
      select: {
        serialNumber: true,
      },
    });

    if (!allSerials || allSerials.length === 0) {
      return "000001";
    }

    // Extract all series numbers and find the maximum
    let maxSeriesNum = 0;
    for (const serial of allSerials) {
      if (serial.serialNumber && serial.serialNumber.length >= 6) {
        const seriesNum = parseInt(serial.serialNumber.slice(-6));
        if (seriesNum > maxSeriesNum) {
          maxSeriesNum = seriesNum;
        }
      }
    }

    const nextNum = maxSeriesNum + 1;

    if (nextNum > 999999) {
      throw new Error("Series number exceeds maximum value (999999)");
    }

    return nextNum.toString().padStart(6, "0");
  }
}

module.exports = ControlSerialModel;
