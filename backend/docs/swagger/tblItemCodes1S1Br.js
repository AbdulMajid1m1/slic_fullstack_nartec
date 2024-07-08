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
 * /api/itemCodes/v1/itemCodes/all:
 *   get:
 *     summary: Get all item codes
 *     description: Retrieve all item codes without pagination or search functionality
 *     tags: [ItemCodes]
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
 *                       sERIALnUMBER:
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
 *                   example: No item codes found
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
 *                   example: Internal server error
 */

/**
 * @swagger
 * /api/itemCodes/v1/itemCode:
 *   post:
 *     summary: Creates a new item code
 *     tags:
 *       - ItemCode
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
 * /api/itemCodes/v1/itemCode:
 *   post:
 *     summary: Create a new item code
 *     description: Create a new item code with the provided details
 *     tags: [ItemCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GTIN:
 *                 type: string
 *                 example: "0123456789012"
 *               ItemCode:
 *                 type: string
 *                 example: "ABC123"
 *               EnglishName:
 *                 type: string
 *                 example: "Sample Item"
 *               ArabicName:
 *                 type: string
 *                 example: "عينة البند"
 *               LotNo:
 *                 type: string
 *                 example: "LOT12345"
 *               ExpiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T00:00:00.000Z"
 *               sERIALnUMBER:
 *                 type: string
 *                 example: "SN123456789"
 *               ItemQty:
 *                 type: integer
 *                 example: 100
 *               WHLocation:
 *                 type: string
 *                 example: "Warehouse A"
 *               BinLocation:
 *                 type: string
 *                 example: "Bin B"
 *               QRCodeInternational:
 *                 type: string
 *                 example: "https://example.com/qrcode"
 *               ModelName:
 *                 type: string
 *                 example: "Model X"
 *               ProductionDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00.000Z"
 *               ProductType:
 *                 type: string
 *                 example: "Type A"
 *               BrandName:
 *                 type: string
 *                 example: "Brand Y"
 *               PackagingType:
 *                 type: string
 *                 example: "Box"
 *               ProductUnit:
 *                 type: string
 *                 example: "Piece"
 *               ProductSize:
 *                 type: string
 *                 example: "Small"
 *             required:
 *               - GTIN
 *               - ExpiryDate
 *               - ProductionDate
 *     responses:
 *       201:
 *         description: Item code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item code created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     GTIN:
 *                       type: string
 *                       example: "0123456789012"
 *                     ItemCode:
 *                       type: string
 *                       example: "ABC123"
 *                     EnglishName:
 *                       type: string
 *                       example: "Sample Item"
 *                     ArabicName:
 *                       type: string
 *                       example: "عينة البند"
 *                     LotNo:
 *                       type: string
 *                       example: "LOT12345"
 *                     ExpiryDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T00:00:00.000Z"
 *                     sERIALnUMBER:
 *                       type: string
 *                       example: "SN123456789"
 *                     ItemQty:
 *                       type: integer
 *                       example: 100
 *                     WHLocation:
 *                       type: string
 *                       example: "Warehouse A"
 *                     BinLocation:
 *                       type: string
 *                       example: "Bin B"
 *                     QRCodeInternational:
 *                       type: string
 *                       example: "https://example.com/qrcode"
 *                     ModelName:
 *                       type: string
 *                       example: "Model X"
 *                     ProductionDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     ProductType:
 *                       type: string
 *                       example: "Type A"
 *                     BrandName:
 *                       type: string
 *                       example: "Brand Y"
 *                     PackagingType:
 *                       type: string
 *                       example: "Box"
 *                     ProductUnit:
 *                       type: string
 *                       example: "Piece"
 *                     ProductSize:
 *                       type: string
 *                       example: "Small"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Bad request
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /api/itemCodes/v1/itemCode/{GTIN}:
 *   put:
 *     summary: Update an item code
 *     description: Update an item code by its GTIN. Only the fields provided in the request body will be updated.
 *     tags: [ItemCodes]
 *     parameters:
 *       - name: GTIN
 *         in: path
 *         required: true
 *         description: The GTIN of the item code to update
 *         schema:
 *           type: string
 *           example: "0123456789012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ItemCode:
 *                 type: string
 *                 example: "ABC123"
 *               EnglishName:
 *                 type: string
 *                 example: "Sample Item"
 *               ArabicName:
 *                 type: string
 *                 example: "عينة البند"
 *               LotNo:
 *                 type: string
 *                 example: "LOT12345"
 *               ExpiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T00:00:00.000Z"
 *               sERIALnUMBER:
 *                 type: string
 *                 example: "SN123456789"
 *               ItemQty:
 *                 type: integer
 *                 example: 100
 *               WHLocation:
 *                 type: string
 *                 example: "Warehouse A"
 *               BinLocation:
 *                 type: string
 *                 example: "Bin B"
 *               QRCodeInternational:
 *                 type: string
 *                 example: "https://example.com/qrcode"
 *               ModelName:
 *                 type: string
 *                 example: "Model X"
 *               ProductionDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00.000Z"
 *               ProductType:
 *                 type: string
 *                 example: "Type A"
 *               BrandName:
 *                 type: string
 *                 example: "Brand Y"
 *               PackagingType:
 *                 type: string
 *                 example: "Box"
 *               ProductUnit:
 *                 type: string
 *                 example: "Piece"
 *               ProductSize:
 *                 type: string
 *                 example: "Small"
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
 *                   example: Item code updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     GTIN:
 *                       type: string
 *                       example: "0123456789012"
 *                     ItemCode:
 *                       type: string
 *                       example: "ABC123"
 *                     EnglishName:
 *                       type: string
 *                       example: "Sample Item"
 *                     ArabicName:
 *                       type: string
 *                       example: "عينة البند"
 *                     LotNo:
 *                       type: string
 *                       example: "LOT12345"
 *                     ExpiryDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T00:00:00.000Z"
 *                     sERIALnUMBER:
 *                       type: string
 *                       example: "SN123456789"
 *                     ItemQty:
 *                       type: integer
 *                       example: 100
 *                     WHLocation:
 *                       type: string
 *                       example: "Warehouse A"
 *                     BinLocation:
 *                       type: string
 *                       example: "Bin B"
 *                     QRCodeInternational:
 *                       type: string
 *                       example: "https://example.com/qrcode"
 *                     ModelName:
 *                       type: string
 *                       example: "Model X"
 *                     ProductionDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     ProductType:
 *                       type: string
 *                       example: "Type A"
 *                     BrandName:
 *                       type: string
 *                       example: "Brand Y"
 *                     PackagingType:
 *                       type: string
 *                       example: "Box"
 *                     ProductUnit:
 *                       type: string
 *                       example: "Piece"
 *                     ProductSize:
 *                       type: string
 *                       example: "Small"
 *       400:
 *         description: Bad request
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
 *                   example: Bad request
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
 *                   example: Item code not found
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
 *                   example: Internal server error
 */
