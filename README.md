# 🍸 Sistema de Gestión Backend - API REST del Bar

Repositorio de desarrollo **Backend con Node.js y Express**, abarcando desde fundamentos asíncronos y arquitectura REST hasta bases de datos relacionales (**SQLite & Prisma ORM**), validación de esquemas con **Zod** y seguridad con **Bcrypt + JWT (RBAC)**.

---

## 🛠️ Stack Tecnológico

- **Entorno de Ejecución:** Node.js
- **Framework Web:** Express.js (Arquitectura modular con `express.Router()`)
- **Base de Datos & ORM:** SQLite (`node:sqlite`) y **Prisma ORM** (Modelos tipados, migraciones y relaciones 1:N)
- **Seguridad y Autenticación:**
  - Hashing de contraseñas con **Bcrypt** (`saltRounds = 10`)
  - Tokens de sesión con **JSON Web Tokens (`jsonwebtoken`)**
  - Control de Acceso por Roles (**RBAC**: `cliente` vs `admin`)
- **Validación de Datos & Entorno:** **Zod** y variables de entorno con **Dotenv** (`.env`)

---

## 📡 Principales Endpoints de la API

### 🔐 Autenticación y Roles (`app24_jwt.js`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Público | Registra un usuario encriptando su clave con `bcrypt.hash()`. |
| `POST` | `/login` | Público | Valida credenciales con `bcrypt.compare()` y entrega un **Token JWT**. |
| `GET` | `/barra` | Token JWT (`cliente` / `admin`) | Ruta protegida por el middleware `verificarToken`. |
| `GET` | `/caja-fuerte` | Token JWT + Rol `admin` | Ruta protegida por doble middleware (`verificarToken` + `soloAdmin`). |

### 🍹 Gestión de Carta y Ventas (`rutasBar.js` / `rutasAdmin.js`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/carta` | Público | Lista todos los tragos disponibles con su precio y stock. |
| `POST` | `/api/comprar` | Público (Validado con Zod) | Procesa un pedido, descuenta stock y calcula el vuelto. |
| `GET` | `/api/admin/caja` | Privado (Admin) | Reporte de ventas combinadas (`JOIN` / Prisma `include`) y recaudación total. |

---

## 🚀 Cómo ejecutar este proyecto localmente

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tomasng/sistema-bar-backend-nodejs.git
   cd sistema-bar-backend-nodejs/Node
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Configurar un archivo `.env` dentro de la carpeta `Node/`:
   ```env
   PUERTO=3001
   ADMIN_KEY=tu_clave_admin
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=tu_secreto_jwt
   ```

4. Generar el cliente de Prisma y ejecutar cualquiera de los módulos:
   ```bash
   npx prisma generate
   node app22_prisma.js
   node app24_jwt.js
   ```

---

## 🗺️ Seguimiento de Aprendizaje
- Ver el progreso completo por fases en [ROADMAP.md](./ROADMAP.md).
- Ver la guía teórica y práctica acumulada en [Node/resumen_aprendizaje.txt](./Node/resumen_aprendizaje.txt).

