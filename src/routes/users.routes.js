const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/nearby", usersCtrl.findNearby); // opcional: proteger si quieres
module.exports = router;
