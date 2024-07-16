/**
 * @swagger
 * /api/customerNames/v1/all:
 *   get:
 *     summary: Retrieve all customer names
 *     description: Returns a list of all customer names from the database.
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: A list of customers.
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
 *                   example: Records retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       CUST_CODE:
 *                         type: string
 *                         example: 'C001'
 *                       CUST_NAME:
 *                         type: string
 *                         example: 'John Doe'
 *       404:
 *         description: No customers found.
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
 *                   example: "Couldn't find any customers"
 *       500:
 *         description: Server error
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
 *                   example: "Server error occurred"
 */

/**
 * @swagger
 * /api/customerNames/v1/search:
 *   get:
 *     summary: Search customer names by partial CUST_CODE or CUST_NAME
 *     description: Retrieve customer names using a partial match on CUST_CODE or CUST_NAME.
 *     tags: [Customers]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: The query string to search for customer codes or names
 *         schema:
 *           type: string
 *           example: "John"
 *     responses:
 *       200:
 *         description: A list of matching customers.
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
 *                   example: "Successfully found customers"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       CUST_CODE:
 *                         type: string
 *                         example: 'C001'
 *                       CUST_NAME:
 *                         type: string
 *                         example: 'John Doe'
 *       404:
 *         description: No matching customers found.
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
 *                   example: "No customers found!"
 *       500:
 *         description: Server error
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
 *                   example: "Server error occurred"
 */
