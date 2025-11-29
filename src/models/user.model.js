// src/models/user.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    telefono: DataTypes.STRING,
    password_hash: { type: DataTypes.STRING, allowNull: false },
    descripcion: DataTypes.TEXT,
    lat: DataTypes.DECIMAL(10, 7),
    lng: DataTypes.DECIMAL(10, 7),
    direccion: DataTypes.STRING,
    foto_url: DataTypes.STRING,
    verificado: { type: DataTypes.BOOLEAN, defaultValue: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
