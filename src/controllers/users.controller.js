// src/controllers/users.controller.js
const db = require("../config/database");

// ============================================
//  Buscar usuarios cercanos
// ============================================
exports.findNearby = async (req, res) => {
  try {
    const { lat, lng, max = 1 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ msg: "Lat y Lng requeridos" });
    }

    // MySQL: usamos placeholders "?"
    const rows = await db.query(
      `
      SELECT 
        id,
        nombre,
        email,
        lat,
        lng,
        (
          6371000 * acos(
            cos(radians(?)) * cos(radians(lat)) *
            cos(radians(lng) - radians(?)) +
            sin(radians(?)) * sin(radians(lat))
          )
        ) AS distance_m
      FROM usuarios
      HAVING distance_m <= (? * 1000)
      ORDER BY distance_m ASC
      LIMIT 100
      `,
      [lat, lng, lat, max]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error findNearby:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

// ============================================
//  Actualizar ubicación del usuario
// ============================================
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { lat, lng } = req.body;

    if (!userId) return res.status(401).json({ msg: "No autorizado" });
    if (!lat || !lng) {
      return res.status(400).json({ msg: "Lat y Lng requeridos" });
    }

    await db.query(`UPDATE usuarios SET lat = ?, lng = ? WHERE id = ?`, [
      lat,
      lng,
      userId,
    ]);

    return res.json({ msg: "Ubicación actualizada" });
  } catch (error) {
    console.error("Error updateLocation:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

// ============================================
//  Obtener perfil del usuario autenticado
// ============================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ msg: "No autorizado" });

    const rows = await db.query(
      `SELECT id, nombre, email, lat, lng FROM usuarios WHERE id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error getProfile:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};
