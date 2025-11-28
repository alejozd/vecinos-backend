// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ msg: "Faltan campos" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email, password_hash: hash });
    return res.json({ id: user.id, nombre: user.nombre, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Credenciales inválidas" });

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
