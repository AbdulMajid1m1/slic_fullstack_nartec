const { validationResult } = require("express-validator");

const Role = require("../models/tblAppRoles");
const User = require("../models/TblUsers");
const response = require("../utils/response");
const CustomError = require("../exceptions/customError");

exports.createRole = async (req, res, next) => {
  const { roleName } = req.body;
  try {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    if (!roleName) {
      const error = new CustomError("Role name is required");
      error.statusCode = 422;
      throw error;
    }

    // Check if the role already exists
    const existingRole = await Role.getRoleByName(roleName);
    if (existingRole) {
      const error = new CustomError("Role already exists");
      error.statusCode = 409;
      throw error;
    }

    // Create a new role
    const newRole = await Role.createRole(roleName);
    if (!newRole) {
      const error = new CustomError("Role creation failed");
      error.statusCode = 500;
      throw error;
    }

    // Return the created role
    res
      .status(201)
      .json(response(201, true, "Role created successfully", newRole));
  } catch (error) {
    console.error("Error creating role:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.assignRole = async (req, res, next) => {
  const { userLoginID, roleName } = req.body;
  try {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const user = await User.getUserByLoginId(userLoginID);
    if (!user) {
      const error = new CustomError("User not found for specified login ID");
      error.statusCode = 404;
      throw error;
    }

    const role = await Role.assignRoleToUser(userLoginID, roleName);
    if (!role) {
      const error = new CustomError("Role assignment failed");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Role assigned successfully", role));
  } catch (error) {
    console.error("Error assigning role:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.getRolesByUser = async (req, res, next) => {
  const { userLoginID } = req.body;
  try {
    if (req.email != userLoginID) {
      const error = new CustomError(
        "Unauthorized access, you can use your own email only"
      );
      error.statusCode = 401;
      throw error;
    }
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const user = await User.getUserByLoginId(userLoginID);
    if (!user) {
      const error = new CustomError("User not found for specified login ID");
      error.statusCode = 404;
      throw error;
    }

    const roles = await Role.getRolesByUserLoginId(userLoginID);
    if (!roles || roles.length === 0) {
      const error = new CustomError("No roles found for this user");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(response(200, true, "Roles found", roles));
  } catch (error) {
    console.error("Error fetching roles:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.deleteRole = async (req, res, next) => {
  const { roleID } = req.params;
  try {
    const role = await Role.getRoleById(roleID);
    if (!role) {
      const error = new CustomError("Role not found");
      error.statusCode = 404;
      throw error;
    }

    const deletedRole = await Role.deleteRole(roleID);
    if (!deletedRole) {
      const error = new CustomError(
        "An error has occurred while deleting role"
      );
      error.statusCode = 500; // Change to 500 for server error
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Role deleted successfully", deletedRole));
  } catch (error) {
    console.error("Error deleting role:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  const { roleID } = req.params;
  const { roleName } = req.body;
  try {
    // Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new Error(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const role = await Role.getRoleById(roleID);
    if (!role) {
      const error = new CustomError("Role not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedRole = await Role.updateRole(roleID, roleName);
    if (!updatedRole) {
      const error = new CustomError(
        "An error has occurred while updating role"
      );
      error.statusCode = 500; // Change to 500 for server error
      throw error;
    }

    res
      .status(200)
      .json(response(200, true, "Role updated successfully", updatedRole));
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
