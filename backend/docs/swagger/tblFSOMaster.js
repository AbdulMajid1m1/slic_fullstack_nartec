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
 *                 $ref: '#/components/schemas/SalesOrder'
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
 *             $ref: '#/components/schemas/SalesOrder'
 *     responses:
 *       201:
 *         description: Sales order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesOrder'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
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
