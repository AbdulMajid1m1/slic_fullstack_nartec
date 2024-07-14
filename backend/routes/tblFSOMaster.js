const express = require("express");

const router = express.Router();

const salesOrdersController = require("../controllers/tblFSOMaster");

router.get("/v1/all", salesOrdersController.getAll);

router.post("/v1/create", salesOrdersController.createOrder);

router.get("/v1/:soNumber", salesOrdersController.getOrder);

router.put("/v1/update/:soNumber", salesOrdersController.updateOrder);

router.delete("/v1/delete/:soNumber", salesOrdersController.deleteOrder);

module.exports = router;
