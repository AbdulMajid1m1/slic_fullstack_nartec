/**
 * @swagger
 * /api/foreignPO/v1/foreignPO:
 *   post:
 *     summary: Create a new record
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TblPOFPOPMaster'
 *     responses:
 *       201:
 *         description: The record was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TblPOFPOPMaster'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/all:
 *   get:
 *     summary: Returns the list of all records
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TblPOFPOPMaster'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO:
 *   get:
 *     summary: Returns paginated records
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of records per page
 *     responses:
 *       200:
 *         description: The paginated records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TblPOFPOPMaster'
 *                 totalRecords:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   get:
 *     summary: Get a record by ID
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The record ID
 *     responses:
 *       200:
 *         description: The record description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TblPOFPOPMaster'
 *       404:
 *         description: The record was not found
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   put:
 *     summary: Update a record by ID
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TblPOFPOPMaster'
 *     responses:
 *       200:
 *         description: The record was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TblPOFPOPMaster'
 *       404:
 *         description: The record was not found
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /api/foreignPO/v1/foreignPO/{id}:
 *   delete:
 *     summary: Remove a record by ID
 *     tags: [TblPOFPOPMaster]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The record ID
 *     responses:
 *       200:
 *         description: The record was deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TblPOFPOPMaster'
 *       404:
 *         description: The record was not found
 *       500:
 *         description: Some server error
 */
