const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users.controller");
const auth = require("../middlewares/auth.middleware");

// RUTA PROTEGIDA: Usuarios cercanos
router.get("/nearby", auth, usersCtrl.findNearby);

// RUTA PROTEGIDA: Actualizar ubicación
router.put("/location", auth, usersCtrl.updateLocation);

// RUTA PROTEGIDA: Perfil del usuario autenticado
router.get("/me", auth, usersCtrl.getProfile);

// CRUD de usuarios
router.get("/", auth, usersCtrl.getAll);
router.get("/:id", auth, usersCtrl.getById);
router.post("/", auth, usersCtrl.create);
router.put("/:id", auth, usersCtrl.update);
router.delete("/:id", auth, usersCtrl.remove);

module.exports = router;
