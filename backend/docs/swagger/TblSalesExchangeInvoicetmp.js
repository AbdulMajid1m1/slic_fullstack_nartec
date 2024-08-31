/**
 * @swagger
 * /api/exchangeInvoice/v1/createExchangeInvoice:
 *   post:
 *     summary: Create new invoice details
 *     description: Adds new sales exchange invoice details to the system.
 *     tags: [Exchange Invoice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EnglishName:
 *                 type: string
 *                 description: "Description of the item in English."
 *                 example: "Premium Quality Widget"
 *               GTIN:
 *                 type: string
 *                 description: "Global Trade Item Number (GTIN) for the item."
 *                 example: "01234567891234"
 *               ModelName:
 *                 type: string
 *                 description: "Item model or code."
 *                 example: "Model X200"
 *               ProductSize:
 *                 type: string
 *                 description: "Size of the item."
 *                 example: "Large"
 *     responses:
 *       201:
 *         description: "Sales Exchange Invoice details created successfully."
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
 *                   example: "Sales Exchange Invoice details created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     Description:
 *                       type: string
 *                       example: "Premium Quality Widget"
 *                     GTIN:
 *                       type: string
 *                       example: "01234567891234"
 *                     ItemCode:
 *                       type: string
 *                       example: "Model X200"
 *                     ItemSize:
 *                       type: string
 *                       example: "Large"
 *       400:
 *         description: "Invalid input data."
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
 */
