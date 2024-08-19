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

/**
 * @swagger
 * /api/transactions/v1/sync:
 *   post:
 *     summary: Synchronize transaction codes with external API
 *     description: Fetches transaction codes from an external API and updates the local database with new codes.
 *     tags: [TrxCodesType]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync completed successfully
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
 *                   example: "Sync completed. 5 new codes added."
 *                 data:
 *                   type: object
 *                   properties:
 *                     addedCodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "LTRFO"
 *       400:
 *         description: Invalid input or missing authorization header
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
 *                   example: "Authorization header is missing or invalid"
 *       500:
 *         description: Server error occurred during sync
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
 *                   example: "Server error occurred during sync"
 */
