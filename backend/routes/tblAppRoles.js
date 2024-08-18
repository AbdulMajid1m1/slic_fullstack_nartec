const express = require("express");

const roleController = require("../controllers/tblAppRoles");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// Route to create a new role
router.post("/v1/create-role", roleController.createRole);

// Route to assign a role to a user
router.post("/v1/assign-role", roleController.assignRole);

// Route to assign multiple roles to a user
router.post("/v1/assign-roles", roleController.assignRoles);

// Route to get roles for a user
router.post("/v1/get-roles", isAuth, roleController.getUserRoles);

router.get("/v1/get-roles/:userLoginID", roleController.getUserRolesForAdmin);

// Route to get all roles
router.get("/v1/get-all-roles", roleController.getAllRoles);

// Route to update a role
router.put("/v1/update-role/:roleID", roleController.updateRole);

// Route to delete a role
router.delete("/v1/delete-role/:roleID", roleController.deleteRole);

// Route to remove a role from a user
router.post("/v1/remove-role", roleController.removeRoleFromUser);

// Route to remove multiple roles from a user
router.post("/v1/remove-roles", roleController.removeRoles);

module.exports = router;
