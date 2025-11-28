// src/scripts/seed.js
const bcrypt = require("bcryptjs");
const { sequelize, User, Especialidad } = require("../models");
require("dotenv").config();

async function seed() {
  try {
    await sequelize.authenticate();

    // especialidades
    const especs = [
      "Fontanero",
      "Carpintero",
      "Ingeniero",
      "Dentista",
      "Electricista",
    ];
    for (const n of especs) {
      await Especialidad.findOrCreate({ where: { nombre: n } });
    }

    // usuarios de prueba
    const pass = await bcrypt.hash("123456", 10);

    const usuarios = [
      {
        nombre: "Juan",
        email: "juan@example.com",
        password_hash: pass,
        lat: 4.71099,
        lng: -74.07209,
      },
      {
        nombre: "Maria",
        email: "maria@example.com",
        password_hash: pass,
        lat: 4.7115,
        lng: -74.0715,
      },
      // agrega más según necesites
    ];

    for (const u of usuarios) {
      await User.create(u);
    }

    console.log("Seed completado");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
