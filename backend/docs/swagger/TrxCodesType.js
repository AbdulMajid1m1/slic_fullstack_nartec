/**
 * @swagger
 * /api/transactions/v1/all:
 *   get:
 *     summary: Retrieve all transaction codes
 *     description: Returns a list of all transaction codes from the database.
 *     tags: [TrxCodesType]
 *     responses:
 *       200:
 *         description: A list of transaction codes.
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
 *                   example: "Transaction codes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       TXN_CODE:
 *                         type: string
 *                         example: "TXN12345"
 *                       TXN_NAME:
 *                         type: string
 *                         example: "Sample Transaction"
 *                       TXN_TYPE:
 *                         type: string
 *                         example: "Type A"
 *       404:
 *         description: No transaction codes found.
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
 *                   example: "No transaction codes found!"
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
