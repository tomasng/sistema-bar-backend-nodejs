// =============================================================
//      MÓDULO DE RUTAS: ADMINISTRACIÓN Y SEGURIDAD (rutasAdmin.js)
// =============================================================

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs/promises');
const { PRECIOS, STOCK } = require('./logicaBar');

const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json')



// --- Función auxiliar para vaciar ventas ---
async function vaciarVentas() {
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify([], null, 2));

}

// =============================================================
// 1. EL PATOVICA (Middleware de seguridad para este Router)
// =============================================================

function patovicaAdmin(req, res, next) {
    const clave = req.headers['x-admin-key'] || req.query.key;

    if (clave === process.env.ADMIN_KEY) {// 👈 Ahora lee la clave secreta desde el .env

        console.log("🔓 Patovica: Clave de Administrador Correcta.");
        return next();

    }

    console.log("⛔ Patovica: Acceso no Autorizado BLOQUEADO...");
    return res.status(401).json({
        exito: false,
        error: "⛔ Acceso denegado: Se requiere clave de Administrador. SAPALLIN"
    });

}

// 🛡️ APLICAMOS EL PATOVICA A TODO ESTE ROUTER:
// Cualquier ruta escrita debajo de esta línea estará automáticamente protegida.
router.use(patovicaAdmin);


// =============================================================
// 2. RUTAS PROTEGIDAS DEL ADMINISTRADOR
// =============================================================
// Reponer Stock (PUT /api/admin/stock/reponer)

router.put('/stock/reponer', (req, res) => {
    const { trago, cantidad } = req.body;
    if (!PRECIOS[trago] || !cantidad || cantidad <= 0) {
        return res.status(400).json({ exito: false, mensaje: "Trago o cantidad invalida" });
    }

    STOCK[trago] += Number(cantidad);

    res.json({
        exito: true,
        mensaje: `✅  Se repusieron  ${cantidad} unidades de '${trago}'.`,
        stockActual: STOCK

    });

});

// Resetear Historial de Ventas (DELETE /api/admin/ventas)
router.delete('/ventas', async (req, res) => {
    await vaciarVentas();
    res.json({
        exito: true,
        mensaje: "🗑️ Historial de ventas reseteado por el Administrador."
    });
});


// ⭐ Exportamos el router de administración
module.exports = router;
