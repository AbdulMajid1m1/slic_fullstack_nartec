const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getRecordsByHeadSysId(headSysId) {
  try {
    const records = await prisma.tblPOFPODetails.findMany({
      where: {
        HEAD_SYS_ID: parseFloat(headSysId),
      },
    });
    return records;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
}

module.exports = { getRecordsByHeadSysId };
