const express = require("express");

const itemCodesController = require("../controllers/tblItemCodes1S1Br");
const itemCodesValidators = require("../validators/tblItemCodes1S1Br");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/v1/itemCodes", itemCodesController.getItemCodes);

router.get(
  "/v1/itemCodes/itemCodes/all",
  isAuth,
  itemCodesController.getAllItemCodes
);

router.post(
  "/v1/itemCode",
  isAuth,
  itemCodesValidators.postItemCode,
  itemCodesController.postItemCode
);

router.post(
  "/v2/itemCode",
  isAuth,
  itemCodesValidators.postItemCode,
  itemCodesController.postItemCodeV2
);

router.put("/v1/itemCode/:GTIN", isAuth, itemCodesController.putItemCode);

router.delete("/v1/itemCode/:GTIN", isAuth, itemCodesController.deleteItemCode);

router.get("/v1/searchByGTIN", itemCodesController.searchByPartialGTIN);

router.get("/v2/searchByGTIN", itemCodesController.searchByGTIN);

module.exports = router;
