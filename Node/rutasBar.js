
// =============================================================
//          MÓDULO DE RUTAS: BARRA PÚBLICA (rutasBar.js)
// =============================================================

const express = require('express');
const router = express.Router();// 👈 Creamos el Router modular
const path = require('path');
const fs = require('fs/promises');
const { STOCK, atenderClientes } = require('./logicaBar');
const { pedidoSchema, validar } = require('./validaciones');

const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');

// --- Funciones auxiliares para el archivo de ventas ---
async function leerVentas() {
    try {
        const datos = await fs.readFile(ARCHIVO_VENTAS, 'utf-8');
        return JSON.parse(datos);

    } catch (error) {
        return []
    }
}

async function guardarTodasLasVentas(ventas) {
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, null, 2));

}

// =============================================================
// DEFINICIÓN DE RUTAS (Nota: no llevan '/api' porque será el prefijo)
// =============================================================


// 1. Ver Stock disponible (GET /api/stock)

router.get('/stock', (req, res) => {
    res.json(STOCK);
});

// 2. Ver historial de Ventas (GET /api/ventas)
router.get('/ventas', async (req, res) => {
    const ventas = await leerVentas();
    res.json(ventas);
});


// 3. Atender cliente / Comprar trago (POST /api/atender)

router.post('/atender', validar(pedidoSchema), async (req, res) => {
    try {
        const { nombre, edad, cash, trago } = req.body;
        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            return res.status(400).json({ exito: false, mensaje: "Faltan datos requeridos." });
        }
        const ticket = atenderClientes({ nombre, edad: Number(edad), cash: Number(cash) }, trago);

        if (ticket.exito) {
            const ventas = await leerVentas();
            ventas.push({ ...ticket, fechaHora: new Date().toLocaleString() });
            await guardarTodasLasVentas(ventas);

        }
        res.json(ticket);

    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error interno en el servidor." })
    }
});



// ⭐ IMPRESCINDIBLE: Exportamos el router para que app17.js pueda usarlo





module.exports = router;
