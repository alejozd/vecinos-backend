// src/scripts/sync-db.js
const { sequelize, User, Especialidad } = require("../models");
require("dotenv").config();

async function sync() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a DB");
    // sync({ force: true }) -> lo usarás solo si quieres reiniciar tablas
    await sequelize.sync();
    console.log("Modelos sincronizados");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
