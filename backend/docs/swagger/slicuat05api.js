/**
 * @swagger
 * /api/slicuat05api/v1/postData:
 *   post:
 *     summary: Calls the postdata API with the given body and bearer token.
 *     tags:
 *       - SLIC API
 *     requestBody:
 *       description: Request body for the postdata API.
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
 *     responses:
 *       200:
 *         description: Successfully called the postdata API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Authorization token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization token is missing or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

/**
 * @swagger
 * /api/slicuat05api/v1/getApi:
 *   post:
 *     summary: Call external SLIC API
 *     tags: [SLIC API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The request body to be sent to the SLIC API
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           format: bearer
 *         required: true
 *         description: Bearer token for authorization
 *     responses:
 *       200:
 *         description: Successful response from SLIC API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successful response from SLIC API
 *                 data:
 *                   type: object
 *                   description: The data returned from the SLIC API
 *       401:
 *         description: Authorization token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization token is missing or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
