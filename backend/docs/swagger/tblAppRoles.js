/**
 * @swagger
 * /api/roles/v1/get-all-roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieves all roles available in the system.
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Roles found."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       RoleID:
 *                         type: integer
 *                         example: 1
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *       404:
 *         description: No roles found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No roles found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/create-role:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role in the system.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the new role.
 *                 example: "Editor"
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     RoleID:
 *                       type: integer
 *                       example: 1
 *                     RoleName:
 *                       type: string
 *                       example: "Editor"
 *       409:
 *         description: Role already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role already exists."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleName"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/assign-role:
 *   post:
 *     summary: Assign a role to a user
 *     description: Assigns a specified role to a user based on their login ID.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginID
 *               - roleName
 *             properties:
 *               userLoginID:
 *                 type: string
 *                 description: The login ID of the user to whom the role will be assigned.
 *                 example: "user@example.com"
 *               roleName:
 *                 type: string
 *                 description: The name of the role to assign to the user.
 *                 example: "Admin"
 *     responses:
 *       200:
 *         description: Role assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role assigned successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     RoleID:
 *                       type: integer
 *                       example: 1
 *                     RoleName:
 *                       type: string
 *                       example: "Admin"
 *                     UserLoginID:
 *                       type: string
 *                       example: "user@example.com"
 *       404:
 *         description: User or role not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found for specified login ID."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleName"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/get-roles:
 *   post:
 *     summary: Get roles assigned to a user
 *     description: Retrieves all roles assigned to a user based on their login ID. The user can only retrieve their own roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: [] # Indicates that this endpoint requires a bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginID
 *             properties:
 *               userLoginID:
 *                 type: string
 *                 description: The login ID (email) of the user whose roles are being retrieved. It must match the email associated with the authorization token.
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Roles found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Roles found."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       RoleID:
 *                         type: integer
 *                         example: 1
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *                       UserLoginID:
 *                         type: string
 *                         example: "user@example.com"
 *       401:
 *         description: Unauthorized access. The user tried to access roles for an email that doesn't match the authorization token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access, you can use your own email only."
 *       404:
 *         description: No roles found for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No roles found for this user."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid login ID."
 *                       param:
 *                         type: string
 *                         example: "userLoginID"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/update-role/{roleID}:
 *   put:
 *     summary: Update a role
 *     description: Updates the role information.
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the role to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The new role name.
 *                 example: "Manager"
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     RoleID:
 *                       type: integer
 *                       example: 1
 *                     RoleName:
 *                       type: string
 *                       example: "Manager"
 *                     UserLoginID:
 *                       type: string
 *                       example: "user@example.com"
 *       404:
 *         description: Role not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role not found."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleName"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/delete-role/{roleID}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role by its ID.
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the role to be deleted.
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role deleted successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     RoleID:
 *                       type: integer
 *                       example: 1
 *                     RoleName:
 *                       type: string
 *                       example: "Admin"
 *                     UserLoginID:
 *                       type: string
 *                       example: "user@example.com"
 *       404:
 *         description: Role not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/remove-role:
 *   post:
 *     summary: Remove a role from a user
 *     description: Removes a specified role from a user based on their login ID.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginID
 *               - roleName
 *             properties:
 *               userLoginID:
 *                 type: string
 *                 description: The login ID of the user from whom the role will be removed.
 *                 example: "user@example.com"
 *               roleName:
 *                 type: string
 *                 description: The name of the role to remove from the user.
 *                 example: "Admin"
 *     responses:
 *       200:
 *         description: Role removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role removed successfully."
 *       404:
 *         description: User or role not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role assignment not found for this user."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleName"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/assign-roles:
 *   post:
 *     summary: Assign multiple roles to a user
 *     description: Assigns multiple specified roles to a user based on their login ID.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginID
 *               - roleNames
 *             properties:
 *               userLoginID:
 *                 type: string
 *                 description: The login ID of the user to whom the roles will be assigned.
 *                 example: "user@example.com"
 *               roleNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: The names of the roles to assign to the user.
 *                 example: ["Admin", "Editor"]
 *     responses:
 *       200:
 *         description: Roles assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Roles assigned successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignedRoles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           RoleID:
 *                             type: integer
 *                             example: 1
 *                           RoleName:
 *                             type: string
 *                             example: "Admin"
 *                           UserLoginID:
 *                             type: string
 *                             example: "user@example.com"
 *       404:
 *         description: User or one or more roles not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User or one or more roles not found."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleNames"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/remove-roles:
 *   post:
 *     summary: Remove multiple roles from a user
 *     description: Removes multiple specified roles from a user based on their login ID.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userLoginID
 *               - roleNames
 *             properties:
 *               userLoginID:
 *                 type: string
 *                 description: The login ID of the user from whom the roles will be removed.
 *                 example: "user@example.com"
 *               roleNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: The names of the roles to remove from the user.
 *                 example: ["Admin", "Editor"]
 *     responses:
 *       200:
 *         description: Roles removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Roles removed successfully."
 *       404:
 *         description: User or one or more roles not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User or role assignment not found."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid role name."
 *                       param:
 *                         type: string
 *                         example: "roleNames"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/roles/v1/get-user-roles-for-admin/{userLoginID}:
 *   get:
 *     summary: Get roles assigned to a user for admin
 *     description: Retrieves all roles assigned to a specified user based on their login ID. This endpoint is intended for use by administrators.
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: userLoginID
 *         required: true
 *         schema:
 *           type: string
 *         description: The login ID of the user whose roles are being retrieved.
 *         example: "user@example.com"
 *     responses:
 *       200:
 *         description: Roles found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Roles found."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       RoleID:
 *                         type: integer
 *                         example: 1
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *       404:
 *         description: User or roles not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found for specified login ID."
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid login ID."
 *                       param:
 *                         type: string
 *                         example: "userLoginID"
 *                       location:
 *                         type: string
 *                         example: "path"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
