/**
 * @swagger
 * /api/foreignPO/v1/foreignPO:
 *   post:
 *     summary: Create a new purchase order record
 *     description: Adds a new purchase order to the system.
 *     tags: [Purchase Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PONumber:
 *                 type: string
 *                 example: "123"
 *               PODate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T12:00:00Z"
 *               SupplierName:
 *                 type: string
 *                 example: "ABC Supplies"
 *               POStatus:
 *                 type: string
 *                 example: "Active"
 *               Head_SYS_ID:
 *                 type: string
 *                 example: "SYS12345"
 *     responses:
 *       201:
 *         description: Purchase order created successfully.
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
 *                   example: "Purchase order created successfully"
 *                 data:
 *                   $ref: '#/definitions/PurchaseOrder'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/all:
 *   get:
 *     summary: Retrieve all purchase orders
 *     description: Returns a list of all purchase orders in the system.
 *     tags: [Purchase Orders]
 *     responses:
 *       200:
 *         description: A list of purchase orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/PurchaseOrder'
 *       404:
 *         description: No purchase orders found
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
 *                   example: "No purchase orders found"
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   get:
 *     summary: Retrieve a purchase order by ID
 *     description: Returns a single purchase order by its ID.
 *     tags: [Purchase Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PurchaseOrder'
 *       404:
 *         description: Purchase order not found
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
 *                   example: "Purchase order not found"
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   put:
 *     summary: Update a purchase order
 *     description: Updates an existing purchase order by ID.
 *     tags: [Purchase Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PONumber:
 *                 type: string
 *                 example: "123"
 *               PODate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T12:00:00Z"
 *               SupplierName:
 *                 type: string
 *                 example: "XYZ Corp"
 *               POStatus:
 *                 type: string
 *                 example: "Completed"
 *               Head_SYS_ID:
 *                 type: string
 *                 example: "SYS67890"
 *     responses:
 *       200:
 *         description: Purchase order updated successfully.
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
 *                   example: "Purchase order updated successfully"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   delete:
 *     summary: Delete a purchase order
 *     description: Deletes an existing purchase order by ID.
 *     tags: [Purchase Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully.
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
 *                   example: "Purchase order deleted successfully"
 *       404:
 *         description: Purchase order not found
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
 *                   example: "Purchase order not found"
 */
