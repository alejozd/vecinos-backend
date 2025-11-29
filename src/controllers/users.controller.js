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

exports.getAll = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT id, nombre, email, lat, lng FROM usuarios WHERE activo = 1`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error getAll:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db.query(
      `SELECT id, nombre, email, lat, lng FROM usuarios WHERE id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error getById:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ msg: "Campos requeridos" });
    }

    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
      [nombre, email, password]
    );

    return res.json({ msg: "Usuario creado", id: result.insertId });
  } catch (error) {
    console.error("Error create:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    await db.query(`UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?`, [
      nombre,
      email,
      id,
    ]);

    return res.json({ msg: "Usuario actualizado" });
  } catch (error) {
    console.error("Error update:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validar que el usuario exista
    const rows = await db.query(
      `SELECT id, activo FROM usuarios WHERE id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // 2. Si ya está inactivo, avisar
    if (rows[0].activo === 0) {
      return res.status(400).json({ msg: "El usuario ya está inactivo" });
    }

    // 3. Desactivar
    await db.query(`UPDATE usuarios SET activo = 0 WHERE id = ?`, [id]);

    return res.json({ msg: "Usuario inactivado correctamente" });
  } catch (error) {
    console.error("Error remove:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};

// ============================================
//  Actualizar perfil del usuario autenticado
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ msg: "No autorizado" });

    const { nombre, apellido, telefono, direccion, descripcion, foto_url } =
      req.body;

    // Validar datos obligatorios si quieres
    if (!nombre) {
      return res.status(400).json({ msg: "El nombre es requerido" });
    }

    await db.query(
      `UPDATE usuarios 
       SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, descripcion = ?, foto_url = ?
       WHERE id = ?`,
      [nombre, apellido, telefono, direccion, descripcion, foto_url, userId]
    );

    return res.json({ msg: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error updateProfile:", error);
    return res.status(500).json({ msg: "Error interno" });
  }
};
