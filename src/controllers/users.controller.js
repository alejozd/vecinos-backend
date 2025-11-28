// src/controllers/users.controller.js
const { sequelize } = require("../models");

exports.findNearby = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || 1000; // metros

    if (isNaN(lat) || isNaN(lng))
      return res.status(400).json({ msg: "Faltan coords" });

    const sql = `
      SELECT id, nombre, email, lat, lng,
        ST_Distance_Sphere(POINT(lng, lat), POINT(:lng, :lat)) AS distance_m
      FROM usuarios
      WHERE activo = 1
      HAVING distance_m <= :radius
      ORDER BY distance_m ASC
      LIMIT 100;
    `;

    const [results] = await sequelize.query(sql, {
      replacements: { lat, lng, lng: lng, radius },
    });

    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};
