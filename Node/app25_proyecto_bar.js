// =============================================================
//   PROYECTO FINAL 1 (APP 25): SISTEMA FULL-STACK DEL BAR
//   (Express + SQLite Relacional + Bcrypt + JWT + RBAC)
// =============================================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');

const app = express();
app.use(express.json());

const PUERTO = process.env.PORT || process.env.PUERTO || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "selloSecretoDelBarPerrisimo2026";


// =============================================================
// 1. BASE DE DATOS SQLITE (3 TABLAS: USUARIOS, TRAGOS Y VENTAS)
// =============================================================

const rutaDB = path.join(__dirname, 'bar_proyecto1.db');
const db = new DatabaseSync(rutaDB);

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol TEXT DEFAULT 'cliente'
        );

    CREATE TABLE IF NOT EXISTS tragos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        precio INTEGER NOT NULL,
        stock INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT NOT NULL,
        trago_id INTEGER NOT NULL,
        precio_cobrado INTEGER NOT NULL,
        vuelto INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trago_id) REFERENCES tragos(id)
    );
    
    
`);

// Función para poblar datos iniciales si la BD está vacía

async function inicializarDatos() {
    const insertarTrago = db.prepare(
        'INSERT OR IGNORE INTO tragos (nombre, precio, stock) VALUES (?, ?, ?)'
    );

    insertarTrago.run('Fernet', 2000, 10);
    insertarTrago.run('Gin Tonic', 2500, 8);
    insertarTrago.run('Cerveza', 1500, 15);
    insertarTrago.run('Whisky', 3500, 5);

    // Creamos el usuario Admin por defecto: Tomás (clave: admin123)
    const adminHash = await bcrypt.hash('admin123', 10);
    const insertarUsuario = db.prepare(
        'INSERT OR IGNORE INTO usuarios (nombre, password_hash, rol) VALUES (?, ?, ?)'
    );

    insertarUsuario.run('Tomás', adminHash, 'admin');

    console.log("🗄️ Base de datos 'bar_proyecto1.db' inicializada con éxito.");
}


