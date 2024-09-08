/**
 * @swagger
 * /api/transactions/v1/all:
 *   get:
 *     summary: Retrieve transaction codes with optional filters
 *     description: Returns a list of transaction codes from the database, filtered by optional query parameters. If no parameters are provided, returns all transaction codes.
 *     tags: [TrxCodesType]
 *     parameters:
 *       - name: TXN_CODE
 *         in: query
 *         description: Filter by transaction code.
 *         required: false
 *         schema:
 *           type: string
 *           example: "TXN12345"
 *       - name: TXN_NAME
 *         in: query
 *         description: Filter by transaction name.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Sample Transaction"
 *       - name: TXN_TYPE
 *         in: query
 *         description: Filter by transaction type.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Type A"
 *       - name: TXNLOCATIONCODE
 *         in: query
 *         description: Filter by transaction location code.
 *         required: false
 *         schema:
 *           type: string
 *           example: "LOC1"
 *       - name: CUSTOMERCODE
 *         in: query
 *         description: Filter by customer code.
 *         required: false
 *         schema:
 *           type: string
 *           example: "CUST1"
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
 *                       TXNLOCATIONCODE:
 *                         type: string
 *                         example: "LOC1"
 *                       CUSTOMERCODE:
 *                         type: string
 *                         example: "CUST1"
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

/**
 * @swagger
 * /api/transactions/v1/byLocationCode:
 *   get:
 *     summary: Retrieve transaction codes by location code
 *     description: Returns a list of transaction codes filtered by the specified location code.
 *     tags: [TrxCodesType]
 *     parameters:
 *       - in: query
 *         name: locationCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The location code to filter transaction codes by.
 *         example: "LOC001"
 *     responses:
 *       200:
 *         description: A list of transaction codes filtered by location code.
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
 *                   example: "Transaction codes for location code LOC001 retrieved successfully"
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
 *                       TXNLOCATIONCODE:
 *                         type: string
 *                         example: "LOC001"
 *       400:
 *         description: Location code is required
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
 *                   example: "Location code is required!"
 *       404:
 *         description: No transaction codes found for the specified location code
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
 *                   example: "No transaction codes found for location code: LOC001"
 *       500:
 *         description: Server error occurred
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
