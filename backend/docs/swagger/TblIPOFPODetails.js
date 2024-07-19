/**
 * @swagger
 * /api/lineItems/v1/{headSysId}:
 *   get:
 *     summary: Retrieve line items by HEAD_SYS_ID
 *     description: Returns a list of line items associated with a specific HEAD_SYS_ID from the TblIPOFPODetails table.
 *     tags:
 *       - Line Items
 *     parameters:
 *       - in: path
 *         name: headSysId
 *         required: true
 *         type: float
 *         description: The HEAD_SYS_ID of the line items to retrieve, specified as a float.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of line items retrieved successfully.
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               HEAD_SYS_ID:
 *                 type: float
 *                 example: 123.45
 *               ITEM_CODE:
 *                 type: string
 *                 example: "ITEM123"
 *               ITEM_NAME:
 *                 type: string
 *                 example: "Item Name"
 *               GRADE:
 *                 type: string
 *                 example: "A"
 *               UOM:
 *                 type: string
 *                 example: "kg"
 *               PO_QTY:
 *                 type: float
 *                 example: 100.0
 *               RECEIVED_QTY:
 *                 type: string
 *                 example: "50"
 *               ITEM_SYS_ID:
 *                 type: float
 *                 example: 456.78
 *       404:
 *         description: No line items found for the given HEAD_SYS_ID.
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
 *                   example: "No records found for the provided HEAD_SYS_ID"
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
 *                   example: "Error fetching records"
 */

/**
 * @swagger
 * /api/lineItems/v1/fetchByMultipleIds:
 *   post:
 *     summary: Retrieve records by multiple HEAD_SYS_IDs
 *     description: Fetches records using multiple HEAD_SYS_IDs.
 *     tags: [Line Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headSysIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "3"]
 *     responses:
 *       200:
 *         description: A list of records.
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
 *                   example: "Records retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       HEAD_SYS_ID:
 *                         type: number
 *                         example: 1
 *                       OTHER_FIELD_1:
 *                         type: string
 *                         example: "Value1"
 *                       OTHER_FIELD_2:
 *                         type: string
 *                         example: "Value2"
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
 *                   example: "Invalid input: headSysIds should be a non-empty array"
 *       404:
 *         description: No matching records found.
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
 *                   example: "No records found!"
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
