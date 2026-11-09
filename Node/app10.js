// 1. Importamos los módulos necesarios

const http = require('http');
const fs = require('fs/promises');// Para leer el index.html de forma asincrónica
const path = require('path'); // Para manejar rutas de archivos de forma segura

// 2. Importamos la lógica del bar
const { PRECIOS, atenderClientes } = require('./logicaBar');

// 3. Puerto
const PUERTO = 3000;


// 4. Creamos el servidor (le agregamos 'async' para poder usar await con fs)
const servidor = http.createServer(async (req, res) => {
    const urlCompleta = new URL(req.url, `http://${req.headers.host}`);
    const ruta = urlCompleta.pathname;
    const params = urlCompleta.searchParams;

    // --- RUTA 1: Servir el archivo index.html ("/") ---
    if (ruta === '/') {
        try {
            // Leemos el archivo index.html del disco
            const rutaHtml = path.join(__dirname, 'index.html');
            const contenidoHtml = await fs.readFile(rutaHtml, 'utf-8');

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            return res.end(contenidoHtml);


        } catch (error) {
            res.writeHead(500);
            return res.end("Error al cargar la página de inicio...  ")
        }
    }
    // --- RUTA 2: Atender y responder con el resultado ("/atender") ---
    if (ruta === '/atender') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        const nombre = params.get('nombre');
        const edad = Number(params.get('edad'));
        const cash = Number(params.get('cash'));
        const trago = params.get('trago');

        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            res.writeHead(400);
            return res.end(`
                <body style="background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
                    <h2>⚠️ Faltan datos en el pedido</h2>
                    <a href="/" style="color:#38bdf8;">⬅️ Volver a la barra</a>
                </body>`);

        }
        const ticket = atenderClientes({ nombre, edad, cash }, trago);
        const colorBorde = ticket.exito ? '#22c55e' : "#ef4444";
        const titulo = ticket.exito ? '!Pedido Entregado¡' : 'X Pedido Rechazado X';

        res.writeHead(200);
        return res.end(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Ticket del Bar</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: #0f172a;
                        color: #f8fafc;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }
                    .ticket-card {
                        background: #1e293b;
                        padding: 30px;
                        border-radius: 12px;
                        border-top: 6px solid ${colorBorde};
                        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                        width: 380px;
                        text-align: center;
                    }
                    h2 { margin-top: 0; color: ${colorBorde}; }
                    .mensaje { background: #0f172a; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px; line-height: 1.5; }
                    .btn-volver {
                        display: inline-block;
                        padding: 10px 20px;
                        background: #38bdf8;
                        color: #0f172a;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 6px;
                    }
                    .btn-volver:hover { background: #0284c7; color: white; }
                </style>
            </head>
            <body>
                <div class="ticket-card">
                    <h2>${titulo}</h2>
                    <div class="mensaje">${ticket.mensaje}</div>
                    ${ticket.exito ? `<p>💰 <strong>Vuelto entregado:</strong> $${ticket.vuelto}</p>` : ''}
                    <br>
                    <a href="/" class="btn-volver">⬅️ Hacer otro pedido</a>
                </div>
            </body>
            </html>
        `);

    }
    // --- RUTA NO ENCONTRADA (404) ---

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(404);
    res.end(`<body style="background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h2>404 - Ruta no encontrada</h2>
        <a href="/" style="color:#38bdf8;">⬅️ Ir a la barra</a>
    </body>`);
});

// 5. Encendemos el servidor
servidor.listen(PUERTO, () => {
    console.log(`\n=============================================================`);
    console.log(`🍸 BAR CON FRONTEND ACTIVO EN: http://localhost:${PUERTO}`);
    console.log(`=============================================================`);
    console.log(`👉 Abrí tu navegador en http://localhost:${PUERTO}\n`);
});