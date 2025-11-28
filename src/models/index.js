// src/models/index.js
const sequelize = require("../config/database");
const User = require("./user.model");
const Especialidad = require("./especialidad.model");

const UsuarioEspecialidad = sequelize.define(
  "UsuarioEspecialidad",
  {
    id: {
      type: require("sequelize").DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    experiencia: require("sequelize").DataTypes.INTEGER,
    descripcion: require("sequelize").DataTypes.TEXT,
  },
  {
    tableName: "usuario_especialidad",
    timestamps: false,
  }
);

User.belongsToMany(Especialidad, {
  through: UsuarioEspecialidad,
  foreignKey: "usuario_id",
});
Especialidad.belongsToMany(User, {
  through: UsuarioEspecialidad,
  foreignKey: "especialidad_id",
});

module.exports = {
  sequelize,
  User,
  Especialidad,
  UsuarioEspecialidad,
};
