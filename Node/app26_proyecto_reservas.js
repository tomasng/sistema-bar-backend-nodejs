require('dotenv').config();
const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express()
app.use(express.json());


// 1. Base de Datos SQLite para el Sistema de Reservas

const db = new DatabaseSync(path.join(__dirname, 'reservas_proyecto2.db'));

// 2. Creación de Tablas Relacionales (Mesas y Reservas con Estados)

db.exec(`
    CREATE TABLE IF NOT EXISTS mesas(
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre  TEXT UNIQUE NOT NULL,
        capacidad INTEGER NOT NULL,
        precio_sena INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS  reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,   
        cliente TEXT NOT NULL,
        telefono TEXT NOT NULL,
        mesa_id INTEGER NOT NULL,
        turno TEXT NOT NULL,
        estado TEXT DEFAULT 'PENDIENTE',
        sena_pagada INTEGER DEFAULT 0,
        creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mesa_id) REFERENCES mesas(id)

    );


    
`);


// 3. Semilla inicial de Mesas del Bar

function inicializarMesas() {
    const insertarMesa = db.prepare(
        'INSERT OR IGNORE INTO mesas(nombre, capacidad, precio_sena) VALUES (?,?,?)'
    );
    insertarMesa.run('Mesa 1 - Barra Central', 2, 5000);
    insertarMesa.run('Mesa 2 - Patio Cervecero', 4, 10000);
    insertarMesa.run('Mesa 3 - Box VIP DJ', 6, 20000);
    insertarMesa.run('Mesa 4 - Living Terraza', 8, 30000);

    console.log('✅ Mesas del Bar inicializadas en reservas_proyecto2.db');
};


// 4. Ruta Principal (Frontend de Reservas)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'reservas_fullstack.html'));
});

// 5. GET /api/mesas - Ver catálogo de mesas y listado de reservas
app.get('/pai/mesas', (req, res) => {
    const mesas = db.prepare('SELECT * FROM mesas').all();

    const reservas = db.prepare(`
        SELECT  reservas.id, reservas.cliente, reservas.telefono,
                mesas.nombre AS mesa, reservas.mesa_id, reservas.tur no,
                reservas.estado, reservas.sena_pagada, reservas.creada_en
        FROM reservas
        INNER JOIN mesas ON reservas.mesa_id = mesas.id
        ORDER BY reservas.id DEC
    
    `).all()
    res.json({ mesas, reservas });
});


// 6. POST /api/reservar - Solicitar una reserva (Validación Anti-Doble Reserva

app.post('api/reservar', (req, res) => {
    const { cliente, telefono, mesa_id, turno } = req.body;

    if (!cliente || !telefono || !mesa_id || !turno) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (cliente, telefono, mesa_id, turno).' });
    }

    // Verificar que la mesa exista
    const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(mesa_id);

    // REGLA DE ORO: Verificar que la mesa NO esté ocupada en ese mismo turno
    const ocupada = db.prepare(`
        SELECT * FROM reservas 
        WHERE mesa_id = ? AND turno = ? AND estado != 'CANSELADA'
        `).get(mesa_id, turno);
})