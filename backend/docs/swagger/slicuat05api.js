/**
 * @swagger
 * /api/slicuat05api/v1/slicLogin:
 *   post:
 *     summary: Authenticate with the SLIC API using an API key.
 *     tags:
 *       - SLIC API
 *     requestBody:
 *       description: The API key required for authentication.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "your-api-key-here"
 *     responses:
 *       200:
 *         description: Successfully authenticated with the SLIC API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: number
 *                   example: 3600
 *       401:
 *         description: Unauthorized access, API key is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API key is missing or invalid."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unexpected error occurred."
 */

/**
 * @swagger
 * /api/slicuat05api/v1/getApi:
 *   post:
 *     summary: Retrieve data from the SLIC API.
 *     tags:
 *       - SLIC API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The request body to be sent to the SLIC API.
 *             properties:
 *               param1:
 *                 type: string
 *                 example: "value1"
 *               param2:
 *                 type: integer
 *                 example: 123
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           format: bearer
 *         required: true
 *         description: Bearer token for authorization.
 *     responses:
 *       200:
 *         description: Successful response from SLIC API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: The data returned from the SLIC API.
 *       401:
 *         description: Authorization token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authorization token is missing or invalid."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

/**
 * @swagger
 * /api/slicuat05api/v1/postData:
 *   post:
 *     summary: Sends data to the SLIC API for processing.
 *     tags:
 *       - SLIC API
 *     requestBody:
 *       description: The data to be posted to the SLIC API.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _keyword_:
 *                 type: string
 *                 example: "Invoice"
 *               _secret-key_:
 *                 type: string
 *                 example: "2bf52be7-9f68-4d52-9523-53f7f267153b"
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Company:
 *                       type: string
 *                       example: "SLIC"
 *                     TransactionCode:
 *                       type: string
 *                       example: "DCIN"
 *                     CustomerCode:
 *                       type: string
 *                       example: "CF100005"
 *                     SalesLocationCode:
 *                       type: string
 *                       example: "FG101"
 *                     DeliveryLocationCode:
 *                       type: string
 *                       example: "FG101"
 *                     UserId:
 *                       type: string
 *                       example: "SYSADMIN"
 *                     Item:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           Item-Code:
 *                             type: string
 *                             example: "4435"
 *                           Size:
 *                             type: string
 *                             example: "39"
 *                           Rate:
 *                             type: string
 *                             example: "85"
 *                           Qty:
 *                             type: string
 *                             example: "1"
 *                           UserId:
 *                             type: string
 *                             example: "SYSADMIN"
 *               COMPANY:
 *                 type: string
 *                 example: "SLIC"
 *               USERID:
 *                 type: string
 *                 example: "SYSADMIN"
 *               APICODE:
 *                 type: string
 *                 example: "INVOICE"
 *               LANG:
 *                 type: string
 *                 example: "ENG"
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           format: bearer
 *         required: true
 *         description: Bearer token for authorization.
 *     responses:
 *       200:
 *         description: Data successfully posted to the SLIC API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Authorization token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authorization token is missing or invalid."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
