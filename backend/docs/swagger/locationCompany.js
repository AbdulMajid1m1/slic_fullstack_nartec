/**
 * @swagger
 * /api/locationsCompanies/v1/all:
 *   get:
 *     summary: Retrieve all locations and companies
 *     description: Returns a list of all locations and companies from the database.
 *     tags: [LocationsCompanies]
 *     responses:
 *       200:
 *         description: A list of locations and companies.
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
 *                   type: object
 *                   properties:
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           TblSysNoID:
 *                             type: integer
 *                             example: 1
 *                           LocationCode:
 *                             type: string
 *                             example: "PD101"
 *                           LocationName:
 *                             type: string
 *                             example: "Product Development Location ( Sample) (PRDV)"
 *                     companies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           TblSysNoID:
 *                             type: integer
 *                             example: 1
 *                           CompanyCode:
 *                             type: string
 *                             example: "C001"
 *                           CompanyName:
 *                             type: string
 *                             example: "Sample Company"
 *       404:
 *         description: No locations or companies found.
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
 *                   example: "Couldn't find any locations and companies"
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
 * /api/locationsCompanies/v1/locations:
 *   get:
 *     summary: Retrieve all locations
 *     description: Returns a list of all locations from the database.
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: A list of locations.
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
 *                   example: "Locations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       TblSysNoID:
 *                         type: integer
 *                         example: 1
 *                       LocationCode:
 *                         type: string
 *                         example: "PD101"
 *                       LocationName:
 *                         type: string
 *                         example: "Product Development Location ( Sample) (PRDV)"
 *       404:
 *         description: No locations found.
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
 *                   example: "Couldn't find any locations"
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
