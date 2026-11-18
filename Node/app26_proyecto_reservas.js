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
app.get('/api/mesas', (req, res) => {
    const mesas = db.prepare('SELECT * FROM mesas').all();

    const reservas = db.prepare(`
        SELECT  reservas.id, reservas.cliente, reservas.telefono,
                mesas.nombre AS mesa, reservas.mesa_id, reservas.turno,
                reservas.estado, reservas.sena_pagada, reservas.creada_en
        FROM reservas
        INNER JOIN mesas ON reservas.mesa_id = mesas.id
        ORDER BY reservas.id DESC
    
    `).all()
    res.json({ mesas, reservas });
});


// 6. POST /api/reservar - Solicitar una reserva (Validación Anti-Doble Reserva

app.post('/api/reservar', (req, res) => {
    const { cliente, telefono, mesa_id, turno } = req.body;

    if (!cliente || !telefono || !mesa_id || !turno) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (cliente, telefono, mesa_id, turno).' });
    }

    // Verificar que la mesa exista
    const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(mesa_id);
    if (!mesa) {
        return res.status(404).json({ error: 'La mesa seleccionada no existe.' });
    }

    // REGLA DE ORO: Verificar que la mesa NO esté ocupada en ese mismo turno
    const ocupada = db.prepare(`
        SELECT * FROM reservas 
        WHERE mesa_id = ? AND turno = ? AND estado != 'CANCELADA'
        `).get(mesa_id, turno);

    if (ocupada) {
        return res.status(409).json({
            error: `¡Ups! La ${mesa.nombre} ya está reservada para el turno de las ${turno} hs.`
        });
    }
    // Crear la reserva en estado PENDIENTE
    const resultado = db.prepare(`
        INSERT INTO reservas(cliente, telefono, mesa_id, turno, estado, sena_pagada)
        VALUES(?,?,?,?, 'PENDIENTE', 0)    
        
    `).run(cliente, telefono, mesa_id, turno);

    res.status(201).json({
        mensaje: `Reserva solicitada para ${cliente} en ${mesa.nombre} (${turno} hs). Estado: PENDIENTE de seña ($${mesa.precio_sena}).`,
        reservaId: resultado.lastInsertRowid
    });




});





// 7. PUT /api/reservas/:id/pagar - Pagar la seña y pasar a estado CONFIRMADA
app.put('/api/reservas/:id/pagar', (req, res) => {
    const reservaId = Number(req.params.id);
    const { monto } = req.body;
    const reserva = db.prepare(`
        SELECT reservas.*, mesas.nombre AS mesa_nombre, mesas.precio_sena 
        FROM reservas
        INNER JOIN mesas ON reservas.mesa_id = mesas.id
        WHERE reservas.id = ?   
    `).get(reservaId);

    if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    if (reserva.estado === 'CANCELADA') {
        return res.status(400).json({ error: 'No se puede pagar una reserva que fue CANCELADA.' });

    }

    if (reserva.estado === 'CONFIRMADA') {
        return res.status(400).json({ error: 'Esta reserva ya está CONFIRMADA.' });
    }

    if (!monto || Number(monto) < reserva.precio_sena) {
        return res.status(400).json({
            error: `Monto insuficiente. La seña para ${reserva.mesa_nombre} es de $${reserva.precio_sena}.`
        });
    }

    db.prepare(`
        UPDATE reservas
        SET estado = 'CONFIRMADA', sena_pagada = ?
        WHERE id = ?
    `).run(reserva.precio_sena, reservaId);

    const vuelto = Number(monto) - reserva.precio_sena;
    res.json({
        mensaje: `¡Seña abonada con éxito! Reserva #${reservaId} (${reserva.mesa_nombre} - ${reserva.turno} hs) CONFIRMADA. Vuelto: $${vuelto}.`
    });
});


// 8. PUT /api/reservas/:id/cancelar - Cancelar reserva y liberar el turno
app.put('/api/reservas/:id/cancelar', (req, res) => {
    const reservaId = Number(req.params.id);

    const reserva = db.prepare('SELECT * FROM reservas WHERE id =?').get(reservaId);
    if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    if (reserva.estado === 'CANCELADA') {
        return res.status(400).json({ error: 'La reserva ya estaba cancelada.' });
    }

    db.prepare(`
        UPDATE reservas
        SET estado = 'CANCELADA'
        WHERE id = ?    
        
    `).run(reservaId);

    res.json({
        mensaje: `Reserva #${reservaId} de ${reserva.cliente} fue CANCELADA. El turno de las ${reserva.turno} hs volvió a quedar libre.`

    });
});



// 9. Inicializar Mesas y Encender Servidor

const PORT = process.env.PORT || 3002;
inicializarMesas();
app.listen(PORT, () => {
    console.log(`📅 Servidor de Reservas VIP corriendo en http://localhost:${PORT}`);
});
