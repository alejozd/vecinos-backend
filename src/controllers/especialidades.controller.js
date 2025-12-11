// src/controllers/especialidades.controller.js
const db = require("../config/database");

exports.getEspecialidades = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT nombre FROM especialidades ORDER BY nombre ASC"
    );
    let filas = [];

    // Ajuste para manejar diferentes formatos de retorno
    if (Array.isArray(result[0])) {
      filas = result[0];
    } else if (result.length > 0) {
      filas = result;
    }

    const especialidades = filas.map((row) => row.nombre);
    res.json(especialidades);
  } catch (error) {
    console.error("Error cargando especialidades:", error);
    res.status(500).json({ msg: "Error al cargar especialidades" });
  }
};
