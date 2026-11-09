// =============================================================
//      APP 16: MIDDLEWARES PERSONALIZADOS (LOGGER Y SEGURIDAD)
// =============================================================


const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { PRECIOS, STOCK, atenderClientes } = require('./logicaBar')

const app = express();
const PUERTO = 3001;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');


// Middleware estándar para parsear JSON
app.use(express.json());


// =============================================================
// 1. NUESTROS MIDDLEWARES PERSONALIZADOS
// =============================================================

// 📝 MIDDLEWARE A: Logger / Auditor Global (Aplica a TODAS las peticiones)

app.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString();
    console.log(`🔔 [${hora}] Petición entrante: ${req.method} --> ${req.url}`);

    // ⭐ ¡IMPRESCINDIBLE! next() permite que la petición continúe su camino
    next();
});

// 🚪 MIDDLEWARE B: El "Patovica" (Verifica clave de Administrador)

function patovicaAdmin(req, res, next) {
    // Buscamos la clave en los headers 'x-admin-key' o en la query '?key=...'
    const clave = req.headers['x-admin-key'] || req.query.key;

    if (clave === 'admin123') {
        console.log("🔓 Patovica: Clave de Administrador correcta. Acceso concedido.");
        return next();// Pasa a ejecutar la ruta protegida
    }

    // Si la clave no es correcta, cortamos la petición acá mismo
    console.log("⛔ Patovica: Intento de acceso no autorizado bloqueado.");
    return res.status(401).json({
        exito: false,
        error: "⛔ Acceso denegado: Necesitás la clave de Administrador para esta acción."
    });



}


// =============================================================
// 2. FUNCIONES DE BASE DE DATOS
// =============================================================

async function leerVentas() {
    try {
        const datos = await fs.readFile(ARCHIVO_VENTAS, 'utf-8');
        return JSON.parse(datos);

    } catch (error) {
        return [];
    }
}

async function guardarTodasLasventas(ventas) {
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, 2, null));

}

// =============================================================
// 3. RUTAS PÚBLICAS (Cualquiera puede entrar sin clave)
// =============================================================

// Página web pública

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Ver stock público
app.get('/api/stock', (req, res) => res.json(STOCK));

// Ver ventas público

app.get('/api/ventas', async (req, res) => {
    const ventas = await leerVentas();
    res.json(ventas);
});


// Comprar trago público

app.post('/api/atender', async (req, res) => {

    try {
        const { nombre, edad, cash, trago } = req.body;
        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            return res.status(400).json({ exito: false, menssaje: "Faltan datos requeridos." });

        }
        const ticket = atenderClientes({ nombre, edad: Number(edad), cash: Number(cash) }, trago);
        if (ticket.exito) {
            const ventas = await leerVentas();
            ventas.push({ ...ticket, fechaHora: new Date().toLocaleString() });
            await guardarTodasLasventas(ventas);
        }
        res.json(ticket);

    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error interno del servidor." });
    }

});


// =============================================================
// 4. RUTAS PROTEGIDAS POR EL PATOVICA (Solo con clave de Admin)
// =============================================================

// 🔒 Reponer Stock: Solo si pasa el middleware 'patovicaAdmin'

app.put('/api/stock/reponer', patovicaAdmin, (req, res) => {
    const { trago, cantidad } = req.body;
    if (!PRECIOS[trago] || !cantidad || cantidad <= 0) {
        return res.status(400).json({ exito: false, mensaje: "Trago o cantidad inválida." });

    }
    // Aumentamos el stock en memoria
    STOCK[trago] += Number(cantidad);

    res.json({
        exito: true,
        mensaje: `✅ Se repusieron ${cantidad} unidades de '${trago}'.`,
        stockActual: STOCK
    });

});

// 🔒 Resetear Historial de Ventas: Protegido por el Patovica

app.delete('/api/ventas', patovicaAdmin, async (req, res) => {
    await guardarTodasLasventas([]);
    res.json({
        exito: true,
        mensaje: "🗑️ Historial de ventas reseteado por el Administrador."
    });
});


// =============================================================
// 5. ENCENDER EL SERVIDOR
// =============================================================
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor con Middlewares activo en http://localhost:${PUERTO}`);
});
