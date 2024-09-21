const express = require("express");
const router = express.Router();
const controller = require("../controllers/languageController");


router.get('/translations', controller.getAll)
router.get("/translations_table",controller.fortable)
router.post("/translations_post", controller.createlanguages)
router.put("/translations_put/:id", controller.updatelanguages)
module.exports = router;