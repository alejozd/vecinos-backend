// src/routes/especialidades.routes.js
const express = require("express");
const router = express.Router();
const especialidadesController = require("../controllers/especialidades.controller");

router.get("/", especialidadesController.getEspecialidades);

module.exports = router;
