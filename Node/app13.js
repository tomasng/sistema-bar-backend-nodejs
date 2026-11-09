// =============================================================
//          APP 13: API REST DINÁMICA CON JSON Y FETCH
// =============================================================


// 1. Importamos módulos nativos

const http = require('http');
const fs = require('fs/promises');
const path = require('path');


// 2. Importamos la lógica, precios y stock del bar

const { PRECIOS, STOCK, atenderClientes, calcularRecaudacion } = require('./logicaBar');

const PUERTO = 3000;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');

// 2. Importamos la lógica, precios y stock del bar

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
        fechaHora: new Date().toLocaleString()
    };
    ventas.push(nuevaVenta);
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, null, 2));

}

// 4. Función para capturar el cuerpo (Body) en formato JSON
function obtenerBodyJSON(req) {
    return new Promise((resolve, reject) => {
        let cuerpo = '';
        req.on('data', chunk => { cuerpo += chunk.toString(); });
        req.on('end', () => {
            try {
                // Parseamos el texto recibido a un Objeto JavaScript
                const datos = JSON.parse(cuerpo);
                resolve(datos);
            } catch (err) {
                // Si el JSON viene mal formado
                resolve({});
            }
        });
        req.on('error', err => reject(err));
    });
}


// 5. Servidor API REST

const servidor = http.createServer(async (req, res) => {
    const urlCompleta = new URL(req.url, `http://${req.headers.host}`);
    const ruta = urlCompleta.pathname;

    // --- RUTA 1: Servir la página HTML de la Barra ---
    if (ruta === '/' && req.method === 'GET') {
        try {
            const contenidoHtml = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            return res.end(contenidoHtml);


        } catch (error) {
            res.writeHead(500);
            return res.end("Error al cargar la barra")
        }
    }

    // --- RUTA 2 (API): Consultar el Stock actual en vivo ---

    // --- RUTA 2 (API): Consultar el Stock actual en vivo ---
    if (ruta === '/api/stock' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        return res.end(JSON.stringify(STOCK));
    }
    // --- RUTA 3 (API): Atender un pedido por POST en JSON ---
    if (ruta === '/api/atender' && req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        try {
            const datos = await obtenerBodyJSON(req);
            const { nombre, edad, cash, trago } = datos;
            // Validación de entrada

            if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
                res.writeHead(400);
                return res.end(JSON.stringify({
                    exito: false,
                    mensaje: "Faltandatos requeridos (nombre, edad, cash, trago)."

                }));

            }
            // Procesamos el pedido
            const ticket = atenderClientes(
                { nombre, edad: Number(edad), cash: Number(cash) },
                trago
            );
            // Si se vendió con éxito, guardamos en el historial
            if (ticket.exito) {
                await guardarVentas(ticket);
            }

            res.writeHead(200);
            return res.end(JSON.stringify(ticket));

        } catch (error) {
            res.writeHead(500);
            return res.end(JSON.stringify({
                exito: false,
                mensaje: "Error interno del servidor al prosesar el pedido."
            }));
        }
    }
    // --- RUTA 404: Endpoint no encontrado ---
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(404);
    return res.end(JSON.stringify({ error: "Ruta no encontrada" }));

});

//6. Encendemos el servidor 
servidor.listen(PUERTO, () => {
    console.log(`\n🍸 Servidor REST + Web activo en: http://localhost:${PUERTO}`);
    console.log(`📦 API Stock: http://localhost:${PUERTO}/api/stock`);
});
