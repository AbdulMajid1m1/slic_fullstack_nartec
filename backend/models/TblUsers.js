const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const CustomError = require("../exceptions/customError");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

async function getUserByLoginId(loginId) {
  try {
    const user = await prisma.tblUsers.findFirst({
      where: { UserLoginID: loginId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by login ID:", error);
    throw new CustomError("Error fetching user by login ID");
  }
}

async function createUser(userLoginID, userPassword) {
  try {
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const newUser = await prisma.tblUsers.create({
      data: {
        UserLoginID: userLoginID,
        UserPassword: hashedPassword,
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Error creating user");
  }
}

async function loginUser(userLoginID, userPassword) {
  try {
    const user = await prisma.tblUsers.findFirst({
      where: { UserLoginID: userLoginID },
    });

    if (!user) {
      const error = new CustomError("Invalid login credentials");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.UserPassword
    );
    if (!isPasswordValid) {
      const error = new CustomError("Invalid login credentials");
      error.statusCode = 404;
      throw error;
    }

    // Update user login status to 1 (assuming UserLogonStatus is a field in tblUsers)
    await prisma.tblUsers.update({
      where: { TblSysNoID: user.TblSysNoID },
      data: {
        UserLoginStatus: 1,
      },
    });

    const token = jwt.sign({ userId: user.TblSysNoID }, JWT_SECRET);

    return {
      token,
      user: {
        id: user.TblSysNoID,
        loginID: user.UserLoginID,
        logonStatus: user.UserLogonStatus,
      },
    };
  } catch (error) {
    throw error;
  }
}

// async function getUserById(userId) {
//   try {
//     const user = await prisma.tblUsers.findUnique({
//       where: { TblSysNoID: userId },
//     });
//     return user;
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     throw new CustomError("Error fetching user");
//   }
// }

// async function updateUser(userId, data) {
//   try {
//     if (data.UserPassword) {
//       data.UserPassword = await bcrypt.hash(data.UserPassword, 10);
//     }
//     const updatedUser = await prisma.tblUsers.update({
//       where: { TblSysNoID: userId },
//       data: data,
//     });
//     return updatedUser;
//   } catch (error) {
//     console.error("Error updating user:", error);
//     throw new CustomError("Error updating user");
//   }
// }

// async function deleteUser(userId) {
//   try {
//     const deletedUser = await prisma.tblUsers.delete({
//       where: { TblSysNoID: userId },
//     });
//     return deletedUser;
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     throw new CustomError("Error deleting user");
//   }
// }

module.exports = {
  createUser,
  getUserByLoginId,
  loginUser,
  //   getUserById,
  //   updateUser,
  //   deleteUser,
};
