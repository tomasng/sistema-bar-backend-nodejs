// =============================================================
//      APP 17: ARQUITECTURA MODULAR PROFESIONAL CON ROUTER
// =============================================================

const express = require('express');
const path = require('path');

// 1. IMPORTAMOS NUESTROS MÓDULOS DE RUTAS

const rutasBar = require('./rutasBar');
const rutasAdmin = require('./rutasAdmin');

const app = express();
const PUERTO = 3001;


// 2. MIDDLEWARES GLOBALES
app.use(express.json());


// Logger de auditoría: registra en consola toda petición entrante

app.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString();
    console.log(`🔔 [${hora}] Petición entrante: ${req.method} --> ${req.url}`);
    next();
});



// 3. RUTA DEL FRONTEND (Página pública)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =============================================================
// 4. MONTAJE DE ENRUTADORES CON PREFIJOS
// =============================================================

// Rutas de clientes: /api/stock, /api/ventas, /api/atender
app.use('/api', rutasBar);


// Rutas privadas de administración: /api/admin/stock/reponer, /api/admin/ventas

app.use('/api/admin', rutasAdmin);


// =============================================================
// 5. ENCENDER EL SERVIDOR
// =============================================================

app.listen(PUERTO, () => {
    console.log(`🚀 Servidor Modular (Router) activo en http://localhost:${PUERTO}`);
});

