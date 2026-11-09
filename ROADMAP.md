# 🗺️ Roadmap de Aprendizaje hacia Desarrollador Backend Junior

Este documento registra tu progreso real paso a paso. Se actualizará **automáticamente** cada vez que completemos y validemos un nuevo tema con su tilde `[x]` y fecha correspondiente.

---

## 📌 FASE 1: Fundamentos Sólidos de JavaScript
- [x] **Variables y Tipos de Datos Primitivos** (`let`, `const`, strings, numbers, booleans) — *(Completado: Octubre 2026)*
- [x] **Estructuras de Control y Flujo** (`if/else`, switch, operadores lógicos `&&`, `||`, ternarios) — *(Completado: Octubre 2026)*
- [x] **Colecciones de Datos** (Arrays y Objetos literales, acceso y modificación de propiedades) — *(Completado: Octubre 2026)*
- [x] **Funciones y Modularización** (Funciones clásicas, arrow functions, parámetros, `return`) — *(Completado: Octubre 2026)*
- [x] **Métodos Avanzados de Arrays** (`.map()`, `.filter()`, `.reduce()`, `.find()`, `.forEach()`) — *(Completado: Octubre 2026)*
- [x] **Programación Asíncrona** (Callbacks, Promesas, `async / await`, manejo de errores con `try / catch`) — *(Completado: Octubre 2026)*

---

## 📌 FASE 2: Backend con Node.js y Express (Arquitectura REST)
- [x] **Node.js Core y Módulos del Sistema** (`fs/promises`, `path`, lectura y escritura de archivos `.json`) — *(Completado: Octubre 2026)*
- [x] **Servidor HTTP con Express** (Instalación de paquetes, arranque de servidor con `app.listen`) — *(Completado: Octubre 2026)*
- [x] **Diseño de APIs REST: Métodos HTTP y Status Codes** (`GET`, `POST`, códigos 200, 400, 404, 500) — *(Completado: Octubre 2026)*
- [x] **CRUD Completo con Persistencia** (Actualizaciones con `PUT`, eliminaciones con `DELETE`) — *(Completado: 07/10/2026)*
- [x] **Middlewares Personalizados y Seguridad** (Logger global con `app.use`, `next()`, Patovica de autenticación por headers/query) — *(Completado: 07/10/2026)*
- [x] **Modularización Profesional con `express.Router()`** (División en `rutasBar.js`, `rutasAdmin.js` y `app17.js`) — *(Completado: 22/10/2026)*
- [x] **Manejo Centralizado de Errores y Variables de Entorno** (Middleware de 4 parámetros `(err, req, res, next)` y archivo `.env` con `dotenv`) — *(Completado: 23/10/2026)*
- [x] **Validación de Datos en Backend** (Uso de bibliotecas de validación como Joi o Zod para blindar las entradas) — *(Completado: 27/10/2026)*

---

## 📌 FASE 3: Bases de Datos Profesionales (Persistencia Real)
- [x] **Introducción a Bases de Datos Relacionales (SQL)**: Modelado de tablas, claves primarias y foráneas (SQLite / PostgreSQL) — *(Completado: 27/10/2026)*
- [x] **Consultas SQL Esenciales y Relaciones**: `INSERT` de ventas, `UPDATE` de stock y consultas combinadas con `JOIN` — *(Completado: 29/10/2026)*
- [x] **Configuración de Respaldo Local e Historial (`AGENTS.md` + `historico_conversaciones.txt`)** — *(Completado: 02/11/2026)*
- [x] **ORM Moderno (Prisma ORM)**: Conectar Node.js con base de datos mediante modelos tipados y migraciones (`schema.prisma`, `PrismaClient`, `.upsert()`, `.findMany()`) — *(Completado: 02/11/2026)*
- [x] **Relaciones entre Entidades**: 1 a muchos (`realizarVenta` con `findUnique`, `venta.create` con `tragoId`, `{ decrement: 1 }`, `include: { trago: true }` y `.aggregate()`) — *(Completado: 04/11/2026)*

---

## 📌 FASE 4: Autenticación, Seguridad y Autorización
- [x] **Hashing de Contraseñas**: Seguridad con `bcrypt` (nunca guardar passwords en texto plano: `bcrypt.hash` y `bcrypt.compare` en `app23_bcrypt.js`) — *(Completado: 06/11/2026)*
- [x] **Autenticación con JWT (JSON Web Tokens)**: Registro (`/register`), Login (`/login`), emisión con `jwt.sign` y middleware `verificarToken` con `jwt.verify` (`app24_jwt.js`) — *(Completado: 09/11/2026)*
- [x] **Control de Acceso por Roles (RBAC)**: Middleware `soloAdmin` para diferenciar permisos (Rol: Cliente vs. Rol: Administrador en `/caja-fuerte`) — *(Completado: 09/11/2026)*

---

## 📌 FASE 5: Control de Versiones con Git y Portafolio
- [x] **Git y GitHub**: Control de versiones, ramas, commits descriptivos y subida de repositorio a la nube (`tomasng/sistema-bar-backend-nodejs`) — *(Completado: 09/11/2026)*
- [ ] **Documentación de APIs**: Escribir `README.md` profesionales con ejemplos de endpoints para reclutadores — *(Próximo paso)*
- [ ] **Despliegue a la Nube (Deploy)**: Subir servidores Node.js a plataformas gratuitas (Render / Railway / Vercel) accesibles desde cualquier navegador.

---

## 📌 FASE 6: Proyectos Finales y Salida Laboral
- [ ] **Proyecto 1: Sistema de Gestión de Comercio / API de Bar Completa** (CRUD + Base de Datos + Autenticación + Frontend básico).
- [ ] **Proyecto 2: API de E-commerce o Reservas** (Manejo de estados, pagos o turnos).
- [ ] **Armado de CV, LinkedIn y Postulaciones**: Estrategia de búsqueda para puestos Trainee / Jr y captación de clientes freelance.
