/**
 * @swagger
 * /api/salesOrders/v1/all:
 *   get:
 *     summary: Retrieve all sales orders
 *     description: Fetches a list of all sales orders from the database.
 *     tags:
 *       - SalesOrders
 *     responses:
 *       200:
 *         description: A list of sales orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       404:
 *         description: No sales orders found.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/salesOrders/v1/create:
 *   post:
 *     summary: Create a new sales order
 *     description: Adds a new sales order to the database.
 *     tags:
 *       - SalesOrders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SO_NUMBER:
 *                 type: string
 *                 description: "Unique sales order number."
 *                 example: "SO123"
 *               SO_CUST_NAME:
 *                 type: string
 *                 description: "Name of the customer for the sales order."
 *                 example: "John Doe"
 *               SO_LOCN_CODE:
 *                 type: string
 *                 description: "Location code for the sales order."
 *                 example: "LOC001"
 *               DEL_LOCN:
 *                 type: string
 *                 description: "Delivery location for the sales order."
 *                 example: "Warehouse A"
 *               STATUS:
 *                 type: string
 *                 description: "Current status of the sales order."
 *                 example: "Pending"
 *               HEAD_SYS_ID:
 *                 type: number
 *                 format: float
 *                 description: "System identifier for the department head."
 *                 example: 12345.67
 *     responses:
 *       201:
 *         description: Sales order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 SO_NUMBER:
 *                   type: string
 *                   description: "Unique sales order number."
 *                   example: "SO123"
 *                 SO_CUST_NAME:
 *                   type: string
 *                   description: "Name of the customer for the sales order."
 *                   example: "John Doe"
 *                 SO_LOCN_CODE:
 *                   type: string
 *                   description: "Location code for the sales order."
 *                   example: "LOC001"
 *                 DEL_LOCN:
 *                   type: string
 *                   description: "Delivery location for the sales order."
 *                   example: "Warehouse A"
 *                 STATUS:
 *                   type: string
 *                   description: "Current status of the sales order."
 *                   example: "Pending"
 *                 HEAD_SYS_ID:
 *                   type: number
 *                   format: float
 *                   description: "System identifier for the department head."
 *                   example: 12345.67
 *       400:
 *         description: Invalid input
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
 *                   example: "Invalid input data."
 *       500:
 *         description: Internal server error
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
 * /api/salesOrders/v1/{soNumber}:
 *   get:
 *     summary: Retrieve a sales order by SO_NUMBER
 *     description: Fetches a specific sales order by SO_NUMBER from the database.
 *     tags:
 *       - SalesOrders
 *     parameters:
 *       - in: path
 *         name: soNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The SO_NUMBER of the sales order to retrieve.
 *     responses:
 *       200:
 *         description: Sales order retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesOrder'
 *       404:
 *         description: Sales order not found.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/salesOrders/v1/update/{soNumber}:
 *   put:
 *     summary: Update a sales order by SO_NUMBER
 *     description: Updates an existing sales order identified by SO_NUMBER in the database.
 *     tags:
 *       - SalesOrders
 *     parameters:
 *       - in: path
 *         name: soNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The SO_NUMBER of the sales order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesOrder'
 *     responses:
 *       200:
 *         description: Sales order updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesOrder'
 *       404:
 *         description: Sales order not found.
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/salesOrders/v1/delete/{soNumber}:
 *   delete:
 *     summary: Delete a sales order by SO_NUMBER
 *     description: Removes a sales order identified by SO_NUMBER from the database.
 *     tags:
 *       - SalesOrders
 *     parameters:
 *       - in: path
 *         name: soNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The SO_NUMBER of the sales order to delete.
 *     responses:
 *       200:
 *         description: Sales order deleted successfully.
 *       404:
 *         description: Sales order not found.
 *       500:
 *         description: Internal server error
 */
