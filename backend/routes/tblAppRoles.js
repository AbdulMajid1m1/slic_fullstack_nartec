const express = require("express");

const roleController = require("../controllers/tblAppRoles");

const router = express.Router();

// Route to create a new role'

router.post("/v1/create-role", roleController.createRole);

// Route to assign a role to a user
router.post("/v1/assign-role", roleController.assignRole);

// Route to get roles for a user
router.post("/v1/get-roles", roleController.getRolesByUser);

// Route to update a role
router.put("/v1/update-role/:roleID", roleController.updateRole);

// Route to delete a role
router.delete("/v1/delete-role/:roleID", roleController.deleteRole);

module.exports = router;
