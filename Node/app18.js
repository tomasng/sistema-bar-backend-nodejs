// =============================================================
//      APP 18: VARIABLES DE ENTORNO (.ENV) Y MANEJO CENTRAL DE ERRORES
// =============================================================


// 1. CARGAMOS DOTENV AL PRINCIPIO DE TODO
// Esto lee el archivo .env y carga las variables en 'process.env'
require('dotenv').config();

const express = require('express');
const path = require('path');

const rutasBar = require('./rutasBar');
const rutasAdmin = require('./rutasAdmin');

const app = express();



// Leemos el puerto desde el .env. Si no existe, usa 3000 por defecto (fallback)


const PUERTO = process.env.PUERTO || 3000;

// 2. MIDDLEWARES GLOBALES

app.use(express.json());


// Logger de auditoría

app.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString();
    console.log(`🔔 [${hora}] Petición: ${req.method} --> ${req.url}`);
    next();

});


// 3. RUTA DEL FRONTEND

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));

});


// 4. MONTAJE DE ROUTERS
app.use('/api', rutasBar);
app.use('/api/admin', rutasAdmin);

// =============================================================
// 5. RUTA DE PRUEBA: Simular un error catastrófico
// =============================================================
// Esta ruta nos sirve para probar cómo el servidor atrapa fallos


app.get('/api/error-test', (req, res, next) => {
    try {
        // Simulamos un error forzado (ej: fallo de base de datos o bug)
        throw new Error("💥 ¡Fallo simulado en el servidor del Bar!");

    } catch (error) {
        // ⭐ Al pasarle el error a next(error), Express salta DIRECTO al middleware de errores
        next(error);
    }
});


// =============================================================
// 6. MANEJO DE RUTAS NO ENCONTRADAS (ERROR 404)
// =============================================================
// Si una petición llega acá, significa que ninguna ruta anterior coincidió

app.use((req, res) => {
    res.status(404).json({
        exito: false,
        error: `🔍 La ruta '${req.originalUrl}' no existe en este servidor.`
    });
});


// =============================================================
// 7. ⭐ MIDDLEWARE CENTRALIZADO DE ERRORES (Los 4 Parámetros Mágicos)
// =============================================================
// REGLA DE ORO DE EXPRESS: Cuando un middleware tiene 4 parámetros (err, req, res, next),
// Express lo reconoce automáticamente como el MANEJADOR GLOBAL DE ERRORES.

app.use((err, req, res, next) => {
    console.error(`🚨 ERROR ATRAPADO: ${err.message}`);

    const status = err.status || 500;
    res.status(status).json({
        exito: false,
        error: err.message || "Error interno del servidor",
        momento: new Date().toLocaleString(),

    });
});


// =============================================================
// 8. ENCENDER EL SERVIDOR
// =============================================================

app.listen(PUERTO, () => {
    console.log(`🚀 Servidor Seguro y Blindado activo en http://localhost:${PUERTO}`);
    console.log(`🔐 Clave Admin cargada desde .env: ${process.env.ADMIN_KEY ? '✅ SÍ' : '❌ NO'}`);
});
