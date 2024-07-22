/**
 * @swagger
 * /api/itemCodes/v1/itemCodes:
 *   get:
 *     summary: Get all item codes with pagination and optional search
 *     description: Retrieve all item codes with pagination support. Optionally, search for item codes.
 *     tags: [ItemCodes]
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of item codes per page
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         required: false
 *         description: Search query for item codes
 *         schema:
 *           type: string
 *           example: "Sample Item"
 *     responses:
 *       200:
 *         description: Item codes retrieved successfully
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
 *                   example: Item codes retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemCodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           GTIN:
 *                             type: string
 *                             example: "12345678901234"
 *                           ItemCode:
 *                             type: string
 *                             example: "IC-001"
 *                           EnglishName:
 *                             type: string
 *                             example: "Sample Item"
 *                           ArabicName:
 *                             type: string
 *                             example: "عينة"
 *                           LotNo:
 *                             type: string
 *                             example: "LOT1234"
 *                           ExpiryDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-31T00:00:00.000Z"
 *                           sERIALnUMBER:
 *                             type: string
 *                             example: "SN123456"
 *                           ItemQty:
 *                             type: integer
 *                             example: 100
 *                           WHLocation:
 *                             type: string
 *                             example: "Warehouse A"
 *                           BinLocation:
 *                             type: string
 *                             example: "Bin B2"
 *                           QRCodeInternational:
 *                             type: string
 *                             example: "QRCode12345"
 *                           ModelName:
 *                             type: string
 *                             example: "Model X"
 *                           ProductionDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           ProductType:
 *                             type: string
 *                             example: "Type A"
 *                           BrandName:
 *                             type: string
 *                             example: "Brand Y"
 *                           PackagingType:
 *                             type: string
 *                             example: "Box"
 *                           ProductUnit:
 *                             type: string
 *                             example: "Unit A"
 *                           ProductSize:
 *                             type: string
 *                             example: "Size M"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
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
 *                   example: Internal server error.
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/itemCodes/v1/itemCodes/all:
 *   get:
 *     summary: Get all item codes
 *     description: Retrieve all item codes without pagination or search functionality.
 *     tags: [ItemCodes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Item codes retrieved successfully
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
 *                   example: "Item codes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       GTIN:
 *                         type: string
 *                         example: "12345678901234"
 *                       ItemCode:
 *                         type: string
 *                         example: "IC-001"
 *                       EnglishName:
 *                         type: string
 *                         example: "Sample Item"
 *                       ArabicName:
 *                         type: string
 *                         example: "عينة"
 *                       LotNo:
 *                         type: string
 *                         example: "LOT1234"
 *                       ExpiryDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-31T00:00:00.000Z"
 *                       SERIALNUMBER:
 *                         type: string
 *                         example: "SN123456"
 *                       ItemQty:
 *                         type: integer
 *                         example: 100
 *                       WHLocation:
 *                         type: string
 *                         example: "Warehouse A"
 *                       BinLocation:
 *                         type: string
 *                         example: "Bin B2"
 *                       QRCodeInternational:
 *                         type: string
 *                         example: "QRCode12345"
 *                       ModelName:
 *                         type: string
 *                         example: "Model X"
 *                       ProductionDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                       ProductType:
 *                         type: string
 *                         example: "Type A"
 *                       BrandName:
 *                         type: string
 *                         example: "Brand Y"
 *                       PackagingType:
 *                         type: string
 *                         example: "Box"
 *                       ProductUnit:
 *                         type: string
 *                         example: "Unit A"
 *                       ProductSize:
 *                         type: string
 *                         example: "Size M"
 *       404:
 *         description: No item codes found
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
 *                   example: "No item codes found"
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
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/itemCodes/v1/itemCode:
 *   post:
 *     summary: Creates a new item code
 *     tags:
 *       - ItemCodes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemCode:
 *                 type: string
 *                 example: "abc"
 *                 description: "The item code"
 *               quantity:
 *                 type: integer
 *                 example: 1
 *                 description: "The quantity of the item"
 *               description:
 *                 type: string
 *                 example: "abc"
 *                 description: "The description of the item"
 *               startSize:
 *                 type: string
 *                 example: "1"
 *                 description: "The start size of the item"
 *               endSize:
 *                 type: integer
 *                 example: 10
 *                 description: "The end size of the item"
 *     responses:
 *       201:
 *         description: Item code created successfully
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
 *                   example: "Item code created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     GTIN:
 *                       type: string
 *                       example: "6287898000001"
 *                     ItemCode:
 *                       type: string
 *                       example: "abc"
 *                     ItemQty:
 *                       type: integer
 *                       example: 1
 *                     EnglishName:
 *                       type: string
 *                       example: "abc"
 *                     ArabicName:
 *                       type: string
 *                       example: "abc"
 *                     QRCodeInternational:
 *                       type: string
 *                       example: "6287898000001"
 *                     ProductSize:
 *                       type: string
 *                       example: "1"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       422:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/itemCodes/v2/itemCode:
 *   post:
 *     summary: Creates new item codes for a range of sizes
 *     tags:
 *       - ItemCodes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemCode:
 *                 type: string
 *                 example: "abc123"
 *                 description: "The unique item code"
 *               quantity:
 *                 type: integer
 *                 example: 6
 *                 description: "The quantity of each item code"
 *               description:
 *                 type: string
 *                 example: "Standard Widget"
 *                 description: "Description of the item"
 *               startSize:
 *                 type: integer
 *                 example: 30
 *                 description: "The start size for the item codes"
 *               endSize:
 *                 type: integer
 *                 example: 35
 *                 description: "The end size for the item codes"
 *     responses:
 *       201:
 *         description: Item codes created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GTIN:
 *                     type: string
 *                     example: "6287898000001"
 *                   ItemCode:
 *                     type: string
 *                     example: "abc123"
 *                   ItemQty:
 *                     type: integer
 *                     example: 1
 *                   EnglishName:
 *                     type: string
 *                     example: "Standard Widget"
 *                   ArabicName:
 *                     type: string
 *                     example: "Standard Widget"
 *                   QRCodeInternational:
 *                     type: string
 *                     example: "6287898000001"
 *                   ProductSize:
 *                     type: integer
 *                     example: 30
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       422:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 */

/**
 * @swagger
 * /api/itemCodes/v1/itemCode/{GTIN}:
 *   put:
 *     summary: Update an item code
 *     description: Update the details of an existing item code by GTIN.
 *     tags: [ItemCodes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: GTIN
 *         required: true
 *         schema:
 *           type: string
 *         description: The GTIN of the item code to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemCode:
 *                 type: string
 *                 description: The new item code
 *               quantity:
 *                 type: integer
 *                 description: The new quantity
 *               description:
 *                 type: string
 *                 description: The new description
 *               startSize:
 *                 type: string
 *                 description: The new start size
 *               endSize:
 *                 type: string
 *                 description: The new end size
 *     responses:
 *       200:
 *         description: Item code updated successfully
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
 *                   example: "Item code updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     GTIN:
 *                       type: string
 *                     ItemCode:
 *                       type: string
 *                     ItemQty:
 *                       type: integer
 *                     EnglishName:
 *                       type: string
 *                     ArabicName:
 *                       type: string
 *                     ProductSize:
 *                       type: string
 *       404:
 *         description: Item code not found
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
 *                   example: "Item code not found"
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
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/itemCodes/v1/itemCode/{GTIN}:
 *   delete:
 *     summary: Delete an item code
 *     description: Delete an existing item code by GTIN.
 *     tags: [ItemCodes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: GTIN
 *         required: true
 *         schema:
 *           type: string
 *         description: The GTIN of the item code to be deleted
 *     responses:
 *       200:
 *         description: Item code deleted successfully
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
 *                   example: "Item code deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     GTIN:
 *                       type: string
 *                     ItemCode:
 *                       type: string
 *                     ItemQty:
 *                       type: integer
 *                     EnglishName:
 *                       type: string
 *                     ArabicName:
 *                       type: string
 *                     ProductSize:
 *                       type: string
 *       404:
 *         description: Item code not found
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
 *                   example: "Item code not found"
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
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/itemCodes/v1/searchByGTIN:
 *   get:
 *     summary: Retrieve item codes by GTIN using partial search
 *     description: Retrieve list of item codes using the provided GTIN.
 *     tags: [ItemCodes]
 *     parameters:
 *       - name: GTIN
 *         in: query
 *         required: true
 *         description: The GTIN to search for item codes
 *         schema:
 *           type: string
 *           example: "12345678901234"
 *     responses:
 *       200:
 *         description: Item code retrieved successfully
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
 *                   example: "Item code retrieved successfully"
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
 *         description: No item codes found with the given GTIN
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
 *                   example: "No item codes found with the given GTIN"
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
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/itemCodes/v2/searchByGTIN:
 *   get:
 *     summary: Retrieve item code by GTIN
 *     description: Retrieve item code using the provided GTIN.
 *     tags: [ItemCodes]
 *     parameters:
 *       - name: GTIN
 *         in: query
 *         required: true
 *         description: The GTIN to search for item codes
 *         schema:
 *           type: string
 *           example: "12345678901234"
 *     responses:
 *       200:
 *         description: Item code retrieved successfully
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
 *                   example: "Item code retrieved successfully"
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
 *         description: No item codes found with the given GTIN
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
 *                   example: "No item codes found with the given GTIN"
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
 *                   example: "Internal server error"
 */
