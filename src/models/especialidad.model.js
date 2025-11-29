// src/models/especialidad.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Especialidad = sequelize.define(
  "Especialidad",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
    descripcion: DataTypes.TEXT,
  },
  {
    tableName: "especialidades",
    timestamps: false,
  }
);

module.exports = Especialidad;
