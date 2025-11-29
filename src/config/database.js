// src/config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
  }
);

const db = {
  sequelize,

  query: async (sql, params = []) => {
    const [rows] = await sequelize.query(sql, { replacements: params });
    return rows; // <-- devolvemos solo rows
  },
};

module.exports = db;
