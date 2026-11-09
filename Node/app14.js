// =============================================================
//               APP 14: SERVIDOR REST CON EXPRESS.JS
// =============================================================

// 1. Importamos Express y módulos necesarios
const express = require('express');
const path = require('path');
const fs = require('fs/promises');

// 2. Importamos la lógica y stock del bar

const { PRECIOS, STOCK, atenderClientes, calcularRecaudacion } = require('./logicaBar');


// 3. Inicializamos la aplicación de Express - Creamos la aplicación de Express y definimos el puerto
const app = express();
const PUERTO = 3001;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');

// 3. MIDDLEWARES (Configuraciones globales)
// Permite que Express entienda y procese automáticamente JSON en el Body de los pedidos POST

app.use(express.json());


// 4. Funciones auxiliares para la base de datos de ventas (JSON)
async function leerVentas() {
    try {
        const datos = await fs.readFile(ARCHIVO_VENTAS, 'utf-8');
        return JSON.parse(datos);
    } catch (error) {
        return [];
    }
}

async function guardarVentas(ticket) {
    const ventas = await leerVentas();
    const nuevaVenta = {
        ...ticket,
        fechaHora: new Date().toLocaleDateString()
    };
    ventas.push(nuevaVenta);
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, null, 2));

}


// =============================================================
// 6. RUTAS CON EXPRESS (¡Mirá qué limpias quedan!)
// =============================================================


// RUTA 1: Servir la página HTML de la Barra
app.get('/', (req, res) => {
    // res.sendFile() le envía el archivo HTML directamente al navegador
    res.sendFile(path.join(__dirname, 'index.html'));
});


// RUTA 2 (API): Consultar el Stock actual en vivo

app.get('/api/stock', (req, res) => {
    // res.json() envía la respuesta en formato JSON automáticamente
    res.json(STOCK);
});

// RUTA 3 (API): Atender un pedido por POST en JSON

app.post('/api/atender', async (req, res) => {
    try {
        // ⭐ ¡Gracias a express.json(), los datos ya están listos en req.body!
        const { nombre, edad, cash, trago } = req.body;

        // Validación de datos de entrada
        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            return res.status(400).json({
                exito: false,
                mensaje: "Faltan datos requeridos (nombre, edad, cash, trago)"
            });
        }
        // Procesamos el pedido con la lógica del bar

        const ticket = atenderClientes(
            { nombre, edad: Number(edad), cash: Number(cash) },
            trago
        );
        // Si se vendió con éxito, guardamos la venta en el JSON
        if (ticket.exito) {
            await guardarVentas(ticket);
        }
        // Devolvemos el ticket generado al navegado
        res.json(ticket);



    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: "Error interno en el servidor..."
        });
    }
});


// RUTA 4 (API): Consultar el historial completo de ventas

app.get('/api/ventas', async (req, res) => {
    const ventas = await leerVentas();
    res.json(ventas);
});

// =============================================================
// 7. ENCENDIDO DEL SERVIDOR
// =============================================================
app.listen(PUERTO, () => {
    console.log(`\n🍸 Servidor EXPRESS del Bar activo en: http://localhost:${PUERTO}`);
    console.log(`📦 API Stock: http://localhost:${PUERTO}/api/stock`);
    console.log(`📜 API Ventas: http://localhost:${PUERTO}/api/ventas`);
});