// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { User } = require("../models");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, descripcion, password } =
      req.body;

    // Validaciones obligatorias
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        msg: "Faltan campos obligatorios: nombre, apellido, email o contraseña.",
      });
    }

    // Validaciones extras
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Formato de email inválido." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "La contraseña debe tener al menos 8 caracteres." });
    }
    if (telefono && !validator.isMobilePhone(telefono, "any")) {
      return res.status(400).json({ msg: "Formato de teléfono inválido." });
    }

    // Verificar si email ya existe
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "Email ya registrado." });

    // Hash de password
    const hash = await bcrypt.hash(password, 12); // Aumenté a 12 para más seguridad

    // Crear usuario con campos nuevos
    const user = await User.create({
      nombre,
      apellido,
      email,
      telefono: telefono || null, // Opcional
      descripcion: descripcion || null, // Opcional
      password_hash: hash,
    });

    return res.json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      descripcion: user.descripcion,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno al registrar usuario." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Credenciales inválidas" });

    if (!user.activo) {
      return res.status(403).json({ msg: "Usuario inactivo" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ msg: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};
