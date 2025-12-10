// src/controllers/users.controller.js
const db = require("../config/database");

// ============================================
//  Buscar usuarios cercanos
// ============================================
// ============================================
//  Buscar usuarios cercanos (con especialidades)
// ============================================
exports.findNearby = async (req, res) => {
  try {
    const { lat, lng, max = 10, especialidad } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ msg: "Lat y Lng requeridos" });
    }

    // Convertir max de km a metros
    const maxDistanceMeters = (parseFloat(max) || 10) * 1000;

    // Base de la consulta
    let sql = `
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.lat,
        u.lng,
        u.foto_url,
        u.descripcion,
        (
          6371000 * acos(
            cos(radians(?)) * cos(radians(u.lat)) *
            cos(radians(u.lng) - radians(?)) +
            sin(radians(?)) * sin(radians(u.lat))
          )
        ) AS distance_m
      FROM usuarios u      
    `;

    // Parámetros base
    const params = [lat, lng, lat];

    // Añadir JOINs si hay filtro de especialidad
    if (especialidad && especialidad.trim() !== "") {
      sql += `
        INNER JOIN usuario_especialidad ue ON ue.usuario_id = u.id
        INNER JOIN especialidades e ON e.id = ue.especialidad_id
      `;
      // El filtro va en el WHERE
    }

    // WHERE principal
    sql += `
      WHERE u.activo = 1
        AND u.lat IS NOT NULL 
        AND u.lng IS NOT NULL
    `;

    // Añadir filtro de especialidad al WHERE (aquí sí es correcto)
    if (especialidad && especialidad.trim() !== "") {
      sql += ` AND LOWER(e.nombre) LIKE ?`;
      params.push(`%${especialidad.trim().toLowerCase()}%`);
    }

    // HAVING + ORDER + LIMIT
    sql += `
      HAVING distance_m <= ?
      ORDER BY distance_m ASC
      LIMIT 100
    `;
    params.push(maxDistanceMeters);

    // Ejecutar consulta principal
    const rows = await db.query(sql, params);

    // Si no hay resultados
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Obtener especialidades de todos los usuarios encontrados
    const userIds = rows.map((row) => row.id);
    const placeholders = userIds.map(() => "?").join(",");

    const especialidadesQuery = `
      SELECT 
        ue.usuario_id,
        e.nombre AS especialidad,
        ue.experiencia,
        ue.descripcion AS descripcion_especialidad
      FROM usuario_especialidad ue
      JOIN especialidades e ON ue.especialidad_id = e.id
      WHERE ue.usuario_id IN (${placeholders})
    `;

    const especialidadesRows = await db.query(especialidadesQuery, userIds);

    // Agrupar especialidades por usuario
    const especialidadesMap = {};
    especialidadesRows.forEach((row) => {
      if (!especialidadesMap[row.usuario_id]) {
        especialidadesMap[row.usuario_id] = [];
      }
      especialidadesMap[row.usuario_id].push({
        especialidad: row.especialidad,
        experiencia: row.experiencia,
        descripcion: row.descripcion_especialidad,
      });
    });

    // Combinar datos del usuario + sus especialidades
    const result = rows.map((user) => ({
      ...user,
      distance_m: parseFloat(user.distance_m.toFixed(2)),
      especialidades: especialidadesMap[user.id] || [],
    }));

    return res.json(result);
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
    const userId = req.user.id;

    // 1. Datos básicos del usuario → siempre un solo objeto en userResult[0]
    const userResult = await db.query(
      `SELECT 
         id, nombre, apellido, email, telefono, 
         descripcion, foto_url, lat, lng, direccion 
       FROM usuarios 
       WHERE id = ?`,
      [userId]
    );

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const user = userResult[0]; // ← ¡ES DIRECTO! No userResult[0][0]

    // 2. Especialidades → siempre un array (puede estar vacío)
    const especialidadesResult = await db.query(
      `SELECT 
         e.nombre AS especialidad,
         ue.experiencia,
         ue.descripcion
       FROM usuario_especialidad ue
       JOIN especialidades e ON ue.especialidad_id = e.id
       WHERE ue.usuario_id = ?`,
      [userId]
    );

    // especialidadesResult → [fila1, fila2] o []
    const especialidades = especialidadesResult || [];

    // 3. Devolver todo junto
    return res.json({
      ...user,
      especialidades,
    });
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
  const t = await db.sequelize.transaction();

  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ msg: "No autorizado" });

    const {
      nombre,
      apellido,
      telefono,
      descripcion,
      foto_url,
      especialidades = [],
    } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ msg: "Nombre y apellido son requeridos" });
    }

    // 1. Actualizar datos básicos
    await db.query(
      `UPDATE usuarios 
       SET nombre = ?, apellido = ?, telefono = ?, descripcion = ?, foto_url = ?
       WHERE id = ?`,
      [
        nombre,
        apellido || null,
        telefono || null,
        descripcion || null,
        foto_url || null,
        userId,
      ],
      { transaction: t }
    );

    // 2. Manejar especialidades
    if (Array.isArray(especialidades) && especialidades.length > 0) {
      // Borrar anteriores
      await db.query(
        `DELETE FROM usuario_especialidad WHERE usuario_id = ?`,
        [userId],
        { transaction: t }
      );

      for (const esp of especialidades) {
        const {
          especialidad: nombreEsp,
          experiencia,
          descripcion: descEsp,
        } = esp;
        if (!nombreEsp || experiencia === undefined) continue;

        // Buscar especialidad existente (tu db.query devuelve [objeto])
        const especialidadResult = await db.query(
          `SELECT id FROM especialidades WHERE LOWER(nombre) = LOWER(?) LIMIT 1`,
          [nombreEsp]
        );

        let especialidadId;

        // especialidadResult → [ { id: 5 } ] o []
        if (
          especialidadResult &&
          especialidadResult.length > 0 &&
          especialidadResult[0]
        ) {
          especialidadId = especialidadResult[0].id;
        } else {
          // Crear nueva
          const insertResult = await db.query(
            `INSERT INTO especialidades (nombre) VALUES (?)`,
            [nombreEsp],
            { transaction: t }
          );
          especialidadId = insertResult[0].insertId;
        }

        // Insertar asociación
        await db.query(
          `INSERT INTO usuario_especialidad (usuario_id, especialidad_id, experiencia, descripcion) 
           VALUES (?, ?, ?, ?)`,
          [userId, especialidadId, experiencia, descEsp || null],
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res.json({ msg: "Perfil actualizado correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error updateProfile:", error);
    return res.status(500).json({
      msg: "Error interno al actualizar perfil",
      error: error.message,
    });
  }
};
