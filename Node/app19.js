// =============================================================
//      APP 19: SISTEMA COMPLETO CON VALIDACIÓN DE DATOS (ZOD)
// =============================================================

require('dotenv').config();

const express = require('express');
const path = require('path');

const rutasBar = require('./rutasBar');
const rutasAdmin = require('./rutasAdmin');

const app = express();
const PUERTO = process.env.PUERTO || 3000;


// 1. MIDDLEWARES GLOBALES
app.use(express.json());

// Logger de auditoría

app.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString();
    console.log(`🔔 [${hora}] Petición: ${req.method} --> ${req.url}`);
    next();
});


// 2. FRONTEND PÚBLICO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. MONTAJE DE ROUTERS MODULARES
app.use('/api', rutasBar);
app.use('/api/admin', rutasAdmin);

// 4. MANEJO DE RUTAS NO ENCONTRADAS (404)
app.use((req, res) => {
    res.status(404).json({
        exito: false,
        error: `🔍 La ruta '${req.originalUrl}' no existe en este servidor.`
    });
});


// 5. MANEJADOR CENTRALIZADO DE ERRORES (4 Parámetros)

app.use((err, req, res, next) => {
    console.error(`🚨 ERROR ATRAPADO: ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({
        exito: false,
        error: err.message || "Error interno del servidor",
        momento: new Date().toLocaleString()
    });
});

// 6. ENCENDER EL SERVIDOR
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor Final (Fase 2) con Zod activo en http://localhost:${PUERTO}`);
    console.log(`🛡️ Validaciones automáticas: ACTIVADAS`);
});
