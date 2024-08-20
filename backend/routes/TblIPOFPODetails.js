const express = require("express");
const router = express.Router();

const controller = require("../controllers/TblIPOFPODetails");
const isAuth = require("../middleware/is-auth");

router.post("/v1/fetchByMultipleIds", controller.fetchByMultipleIds);

// Route to create a new line item
router.post("/v1/create", controller.createLineItem);

// Route to get all line items
router.get("/v1/getAll", controller.getAllLineItems);

router.get("/v1/:headSysId", controller.getLineItemsByHeadSysId);

// Route to update a line item by HEAD_SYS_ID and ITEM_CODE
router.put("/v1/update/:headSysId/:itemCode", controller.updateLineItem);

// Route to delete a line item by HEAD_SYS_ID and ITEM_CODE
router.delete("/v1/delete/:headSysId/:itemCode", controller.deleteLineItem);

module.exports = router;
