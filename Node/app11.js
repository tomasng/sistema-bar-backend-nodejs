// 1. Importamos los módulos
const http = require('http');
const fs = require('fs/promises');
const path = require('path');


// 2. Importamos la lógica y precios del bar
const { PRECIOS, atenderClientes, calcularRecaudacion } = require('./logicaBar');



// 3. Puerto y ruta del archivo de persistencia

const PUERTO = 3000;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas_web.json');

// 4. Función para LEER las ventas guardadas en el disco

async function leerVentas() {
    try {
        const datos = await fs.readFile(ARCHIVO_VENTAS, 'utf-8');
        return JSON.parse(datos);

    } catch (error) {
        // Si el archivo no existe todavía, devolvemos un arreglo vacío
        return [];
    }
}

// 5. Función para GUARDAR una nueva venta en el disco

async function guardarVentas(ticket) {
    const ventas = await leerVentas();

    // Le agregamos la fecha y hora de la compra
    const nuevaVenta = {
        ...ticket,
        fechaHora: new Date().toLocaleDateString()
    };

    ventas.push(nuevaVenta);
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, null, 2));

}

// 6. Creamos el servidor web

const servidor = http.createServer(async (req, res) => {
    const urlCompleta = new URL(req.url, `http://${req.headers.host}`);
    const ruta = urlCompleta.pathname;
    const params = urlCompleta.searchParams;

    // --- RUTA 1: Inicio (Formulario del Bar) ---

    if (ruta === '/') {
        try {
            const contenidoHtml = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            return res.end(contenidoHtml);
        } catch (error) {
            res.writeHead(500);
            return res.end("Error al cargar la barra.");
        }
    }



    // --- RUTA 2: Atender Pedido y Guardar en Disco ("/atender") ---

    if (ruta === '/atender') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        const nombre = params.get('nombre');
        const edad = Number(params.get('edad'));
        const cash = Number(params.get('cash'));
        const trago = params.get('trago');

        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            res.writeHead(400);
            return res.end(
                `
                <body style="background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
                    <h2>⚠️ Faltan datos en el pedido</h2>
                    <a href="/" style="color:#38bdf8;">⬅️ Volver a la barra</a>
                </body>
            `
            );
        }



        // Procesamos el pedido con la lógica del bar
        const ticket = atenderClientes({ nombre, edad, cash }, trago);
        // ¡PERSISTENCIA EN DISCO! Si la venta fue exitosa, la guardamos
        if (ticket.exito) {
            await guardarVentas(ticket);
        }
        const colorBorde = ticket.exito ? '#22c55e' : '#ef4444';
        const titulo = ticket.exito ? '✅ ¡Pedido Entregado!' : '❌ Pedido Rechazado';
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
                        width: 400px;
                        text-align: center;
                    }
                    h2 { margin-top: 0; color: ${colorBorde}; }
                    .mensaje {
                        background: #0f172a;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 15px;
                        line-height: 1.5;
                    }
                    .acciones {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .btn {
                        padding: 10px 16px;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    .btn-primary { background: #38bdf8; color: #0f172a; }
                    .btn-secondary { background: #334155; color: #f8fafc; }
                    .btn:hover { opacity: 0.9; }
                </style>
            </head>
            <body>
                <div class="ticket-card">
                    <h2>${titulo}</h2>
                    <div class="mensaje">${ticket.mensaje}</div>
                    ${ticket.exito ? `<p>💰 <strong>Vuelto entregado:</strong> $${ticket.vuelto}</p>` : ''}
                    <div class="acciones">
                        <a href="/" class="btn btn-primary">⬅️ Nuevo Pedido</a>
                        <a href="/ventas" class="btn btn-secondary">📊 Ver Historial</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    // -------------------------------------------------------------
    // RUTA 3: Historial de Ventas y Recaudación Total ("/ventas")
    // -------------------------------------------------------------
    if (ruta === '/ventas') {
        const ventas = await leerVentas();
        const recaudacionTotal = calcularRecaudacion(ventas);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(200);
        // Generamos las filas de la tabla con las ventas registradas
        const filasVentas = ventas.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:15px; color:#94a3b8;">Aún no se registraron ventas.</td></tr>`
            : ventas.map((v, i) => `
                <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 10px;">#${i + 1}</td>
                    <td style="padding: 10px;">${v.fechaHora}</td>
                    <td style="padding: 10px;"><strong>${v.cliente}</strong></td>
                    <td style="padding: 10px;">🍸 ${v.trago}</td>
                    <td style="padding: 10px; color:#22c55e;"><strong>$${v.precioCobrado}</strong></td>
                </tr>
            `).join('');
        return res.end(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Historial de Ventas</title>
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
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .panel {
                        background: #1e293b;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                        width: 100%;
                        max-width: 650px;
                    }
                    h1 { color: #38bdf8; text-align: center; margin-top: 0; }
                    .recaudacion-box {
                        background: #0f172a;
                        border: 1px solid #22c55e;
                        color: #22c55e;
                        font-size: 20px;
                        text-align: center;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    table { width: 100%; border-collapse: collapse; text-align: left; }
                    th { background: #0f172a; padding: 10px; color: #94a3b8; }
                    .btn-volver {
                        display: block;
                        text-align: center;
                        margin-top: 20px;
                        padding: 10px;
                        background: #38bdf8;
                        color: #0f172a;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 6px;
                    }
                </style>
            </head>
            <body>
                <div class="panel">
                    <h1>📊 Historial de Ventas Web</h1>
                    <div class="recaudacion-box">
                        💵 <strong>Total Recaudado:</strong> $${recaudacionTotal}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha y Hora</th>
                                <th>Cliente</th>
                                <th>Trago</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasVentas}
                        </tbody>
                    </table>
                    <a href="/" class="btn-volver">⬅️ Volver a la Barra</a>
                </div>
            </body>
            </html>
        `);
    }
    // -------------------------------------------------------------
    // RUTA 404: Ruta no encontrada
    // -------------------------------------------------------------
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(404);
    res.end(`
        <body style="background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
            <h2>404 - Ruta no encontrada</h2>
            <a href="/" style="color:#38bdf8;">⬅️ Ir a la barra</a>
        </body>
    `);
});
// 7. Encendemos el servidor
servidor.listen(PUERTO, () => {
    console.log(`\n=============================================================`);
    console.log(`🍸 BAR CON PERSISTENCIA ACTIVO EN: http://localhost:${PUERTO}`);
    console.log(`📊 HISTORIAL DE VENTAS EN:        http://localhost:${PUERTO}/ventas`);
    console.log(`=============================================================`);
    console.log(`👉 Abrí tu navegador en http://localhost:${PUERTO}\n`);
});
