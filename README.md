# Vecinos Backend (MVP)

Este es el backend del proyecto **Vecinos**, una aplicación que permite conectar personas según sus habilidades u oficios dentro de una misma zona geográfica (similar a Tinder, pero para servicios).

El objetivo es permitir que los usuarios encuentren carpinteros, fontaneros, ingenieros, diseñadores, etc., cerca de su ubicación, y puedan contactarlos para solicitar servicios.

---

## 🚀 Tecnologías

- **Node.js**
- **Express.js**
- **MySQL**
- **JWT (autenticación)**
- **BCrypt (hash de contraseñas)**

---

## 📁 Estructura del proyecto

```
vecinos-backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── middleware/
│
├── config/
│   └── db.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Base de datos

Base: **vecinosdb**

Tablas iniciales:

- `usuarios`
- `especialidades`
- `usuario_especialidad`
- `servicios` (para solicitudes entre usuarios)

---

## 🔧 Instalación y ejecución

### 1. Instalar dependencias
```
npm install
```

### 2. Configurar variables de entorno  
Crear archivo `.env` con:

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_password
DB_NAME=vecinosdb

JWT_SECRET=tu_clave_secreta
PORT=3000
```

### 3. Ejecutar en desarrollo
```
npm run dev
```

### 4. Ejecutar en producción
```
npm start
```

---

## 🔄 Sincronizar con servidor Linux (deploy manual)

Desde tu servidor:

```
git pull
npm install
pm2 restart vecinos-backend
```

---

## 📌 Estado del proyecto
MVP en desarrollo.

---

## 👤 Autor
**Alejandro Zambrano**  
Backend Developer · Delphi · Node.js · React · Spring Boot