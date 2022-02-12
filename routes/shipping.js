const express = require("express");
const router = express.Router();
const { getItems } = require("../controllers/shipping/getItems");
const { getShipRound } = require("../controllers/shipping/getShipRound");

router.route("/ship_round").get(getShipRound);
router.route("/:accountId").get(getItems);

module.exports = router;
