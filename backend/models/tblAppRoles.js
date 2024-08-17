const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Role {
  static async getRoleByName(roleName) {
    try {
      const role = await prisma.tblAppRoles.findFirst({
        where: {
          RoleName: roleName,
        },
      });
      return role;
    } catch (error) {
      console.error("Error finding role by name:", error);
      throw new Error("Error finding role by name");
    }
  }

  static async createRole(roleName) {
    try {
      const newRole = await prisma.tblAppRoles.create({
        data: {
          RoleName: roleName,
        },
      });
      return newRole;
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error("Error creating role");
    }
  }

  static async assignRoleToUser(userLoginID, roleName) {
    try {
      const role = await this.getRoleByName(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }
      const userRole = await prisma.tblUserRoles.create({
        data: {
          UserLoginID: userLoginID,
          RoleID: role.RoleID,
        },
      });
      return userRole;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw new Error("Error assigning role to user");
    }
  }

  static async getRolesByUserLoginId(userLoginID) {
    try {
      const roles = await prisma.tblUserRoles.findMany({
        where: { UserLoginID: userLoginID },
        include: {
          role: true,
        },
      });
      return roles.map((userRole) => userRole.role);
    } catch (error) {
      console.error("Error fetching roles for user:", error);
      throw new Error("Error fetching roles for user");
    }
  }

  static async getRoles() {
    try {
      const roles = await prisma.TblAppRoles.findMany({});
      return roles;
    } catch (error) {
      console.error("Error fetching roles for user:", error);
      throw new Error("Error fetching roles for user");
    }
  }

  static async getRoleById(roleID) {
    try {
      const role = await prisma.tblAppRoles.findUnique({
        where: { RoleID: roleID },
      });
      return role;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw new Error("Error fetching role by ID");
    }
  }

  static async deleteRole(roleID) {
    try {
      const deletedRole = await prisma.tblAppRoles.delete({
        where: { RoleID: roleID },
      });
      return deletedRole;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw new Error("Error deleting role");
    }
  }

  static async updateRole(roleID, roleName) {
    try {
      const updatedRole = await prisma.tblAppRoles.update({
        where: { RoleID: roleID },
        data: { RoleName: roleName },
      });
      return updatedRole;
    } catch (error) {
      console.error("Error updating role:", error);
      throw new Error("Error updating role");
    }
  }

  static async removeRoleFromUser(userLoginID, roleName) {
    try {
      const role = await this.getRoleByName(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }
      const removedRole = await prisma.tblUserRoles.deleteMany({
        where: {
          UserLoginID: userLoginID,
          RoleID: role.RoleID,
        },
      });
      return removedRole;
    } catch (error) {
      console.error("Error removing role from user:", error);
      throw new Error("Error removing role from user");
    }
  }
}

module.exports = Role;
