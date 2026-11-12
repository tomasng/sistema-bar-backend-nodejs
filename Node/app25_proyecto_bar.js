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


// =============================================================
// 2. MIDDLEWARES DE SEGURIDAD (JWT + RBAC)
// =============================================================

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: "🚫 Falta el Token VIP." });
    }
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ error: "🚨 Token inválido o vencido." });
    }

}


function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: "⛔ Acceso exclusivo para Administradores." });
    }
    next();
}

// =============================================================
// 3. RUTAS PÚBLICAS (FRONTEND WEB, CARTA Y COMPRAR TRAGO)
// =============================================================

// Servimos la interfaz web principal

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'bar_fullstack.html'));
});

// Obtener todos los tragos desde SQLite

app.get('/api/carta', (req, res) => {
    const tragos = db.prepare('SELECT * FROM tragos').all();
    res.json(tragos);
});

// Comprar un trago en la barra
app.post('/api/comprar', (req, res) => {
    const { cliente, edad, efectivo, tragoId } = req.body;

    if (edad < 18) {
        return res.status(400).json({
            exito: false, mensaje: `🛑 Alto ahí ${cliente}:
            Prohibida la venta a los chamaquitos... `});
    }

    const trago = db.prepare('SELECT * FROM tragos WHERE id = ?').get(tragoId);
    if (!trago) {
        return res.status(404).json({ exito: false, mensaje: "❌ Ese trago no existe." });

    }
    if (trago.stock <= 0) {
        return res.status(400).json({ exito: false, mensaje: `⛔ Se agotó el stock de ${trago.nombre}.` });
    }

    if (efectivo < trago.precio) {
        const falta = trago.precio - efectivo;
        return res.status(400).json({ exito: false, mensaje: `💸 No te alcanza, ${cliente}. Te faltan $${falta}.` });
    }

    const vuelto = efectivo - trago.precio;

    // A) Descontamos 1 unidad del stock en SQLite

    db.prepare('UPDATE tragos SET stock = stock - 1 WHERE id = ? ').run(trago.id)

    // B) Registramos el ticket en la tabla 'ventas'
    db.prepare(
        'INSERT INTO ventas (cliente, trago_id, precio_cobrado, vuelto) VALUES  (?,?,?,?)'
    ).run(cliente, trago.id, trago.precio, vuelto);

    res.json({
        exito: true,
        mensaje: `🍸 ¡Salud, ${cliente}! Disfrutá tu ${trago.nombre}.`,
        vuelto: vuelto
    });


});


// =============================================================
// 4. LOGIN DE USUARIOS Y RUTAS DE ADMINISTRACIÓN (JWT + RBAC)
// =============================================================


// Login: valida con Bcrypt y entrega el Token VIP (JWT)

app.post('/api/login', async (req, res) => {
    const { nombre, password } = req.body;

    const usuario = db.prepare('SELECT * FROM usuarios WHERE nombre = ?').get(nombre);
    if (!usuario) {
        return res.status(401).json({ error: "❌ Usuario o contraseña incorrectos." });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
        return res.status(401).json({ error: "❌ Usuario o contraseña incorrectos." });
    }

    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    res.json({
        mensaje: `🔓 Bienvenido Jefe ${usuario.nombre}`,
        token: token
    });
});


// Reporte de Caja Fuerte (JOIN ventas + tragos y SUM total) - SOLO ADMIN

app.get('/api/admin/caja', verificarToken, soloAdmin, (req, res) => {
    const ventas = db.prepare(`
        SELECT
            ventas.id,
            ventas.cliente,
            tragos.nombre AS trago,
            ventas.precio_cobrado,
            ventas.vuelto,
            ventas.fecha
        FROM ventas
        JOIN tragos ON ventas.trago_id = tragos.id
        ORDER BY ventas.id DESC
        `).all();

    const resumen = db.prepare(`
            SELECT
                COUNT(*) AS total_tickets,
                COALESCE(SUM(precio_cobrado),0) AS recaudacion_total
            FROM ventas
        `).get();

    res.json({ resumen, ventas });

});

// Reponer Stock de un trago - SOLO ADMIN
app.post('/api/admin/reponer', verificarToken, soloAdmin, (req, res) => {
    const { tragoId, cantidad } = req.body;

    db.prepare('UPDATE tragos SET stock = stock + ? WHERE id = ?').run(cantidad, tragoId);

    res.json({ mensaje: `📦 Se sumaron +${cantidad} unidades al inventario.` });

});

// =============================================================
// 5. INICIALIZAR DATOS Y ENCENDER EL SERVIDOR
// =============================================================

inicializarDatos().then(() => {
    app.listen(PUERTO, () => {
        console.log(`🚀 Proyecto Final 1 del Bar corriendo en http://localhost:${PUERTO}`);
    });
});
