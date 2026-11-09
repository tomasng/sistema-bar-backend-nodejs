// 1. Importamos los módulos nativos
const http = require('http');
const fs = require('fs/promises');
const path = require('path');


// 2. Importamos la lógica y persistencia del bar
const { atenderClientes, calcularRecaudacion, STOCK } = require('./logicaBar');


const PUERTO = 3000;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');

// 3. Funciones auxiliares para leer y guardar ventas

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

function obtenerDatosBody(req) {
    return new Promise((resolve, reject) => {
        let cuerpo = '';

        req.on('data', chunk => {
            cuerpo += chunk.toString();
        });

        req.on('end', () => {
            const params = new URLSearchParams(cuerpo);
            resolve(params);
        });
        req.on('error', (err) => reject(err));
    });
}

// 4. Servidor Web


const servidor = http.createServer(async (req, res) => {
    const urlCompleta = new URL(req.url, `http://${req.headers.host}`);
    const ruta = urlCompleta.pathname;

    // --- RUTA 1: Inicio (Formulario del Bar + Stock en vivo) ---
    if (ruta === '/' && req.method === 'GET') {
        try {
            let contenidoHtml = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
            // 1. Armamos la cajita de stock con HTML dinámico
            const listaStockHtml = Object.entries(STOCK).map(([trago, cant]) => {
                const color = cant > 0 ? '#22c55e' : '#ef4444';
                const estado = cant > 0 ? `${cant} disponibles` : '⛔ AGOTADO';
                return `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #334155;">
                    <span style="text-transform:capitalize;">🍸 ${trago}</span>
                    <strong style="color:${color};">${estado}</strong>
                </div>`;
            }).join('');
            const cajaStock = `
                <div style="background:#0f172a; padding:15px; border-radius:8px; margin-top:20px; border:1px solid #38bdf8;">
                    <h3 style="margin:0 0 10px 0; color:#38bdf8; font-size:15px; text-align:center;">📦 Stock en Barra en Vivo</h3>
                    ${listaStockHtml}
                </div>
            `;
            // 2. Inyectamos la cajita de stock justo antes del cierre de </form>
            contenidoHtml = contenidoHtml.replace('</form>', `</form>${cajaStock}`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.writeHead(200);
            return res.end(contenidoHtml);
        } catch (error) {
            res.writeHead(500);
            return res.end("Error al cargar la barra");
        }
    }


    // 💥 SIMULACIÓN DE FALLO CRÍTICO:
    // Descomentamos esta línea para fingir que explotó la base de datos o el disco:
    //throw new Error("¡La caja registradora se quedó sin papel y el disco se trabó!");
    // --- RUTA 2: Atender Pedido por POST ("/atender") ---
    if (ruta === '/atender' && req.method === 'POST') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        try {
            // Obtenemos los datos que vinieron en el body del formulario
            const params = await obtenerDatosBody(req);
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
                    </body>
                `);
            }

            // Procesamos con la lógica del bar
            const ticket = atenderClientes({ nombre, edad, cash }, trago);

            // Si fue exitosa, la guardamos en ventas.json
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
                    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                    .card { background: #1e293b; padding: 30px; border-radius: 12px; border-top: 6px solid ${colorBorde}; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 400px; text-align: center; }
                    h2 { margin-top: 0; color: ${colorBorde}; }
                    .mensaje { background: #0f172a; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 15px; }
                    .acciones { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
                    .btn { padding: 10px 16px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; }
                    .btn-primary { background: #38bdf8; color: #0f172a; }
                    .btn-secondary { background: #334155; color: #f8fafc; }
                </style>
            </head>
            <body>
                <div class="card">
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
        catch (error) {  // 👈 AQUÍ ATRAPAMOS LA EXPLOSIÓN
            console.error("\n❌ ERROR ATRAPADO EN EL SERVIDOR:", error.message);
            res.writeHead(500);
            return res.end(`
                <body style="background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
                    <h2 style="color:#ef4444;">💥 500 - Error Interno del Servidor</h2>
                    <p style="color:#94a3b8;">Ocurrió un problema en el bar: <strong>${error.message}</strong></p>
                    <br>
                    <a href="/" style="color:#38bdf8;">⬅️ Volver a la barra</a>
                </body>
            `);
        }
    }
    // --- RUTA 3: Historial de Ventas e Informe de Stock ("/ventas") ---
    if (ruta === '/ventas' && req.method === 'GET') {
        const ventas = await leerVentas();
        const recaudacionTotal = calcularRecaudacion(ventas);
        // Generamos el resumen de stock restante
        const tarjetasStock = Object.entries(STOCK).map(([trago, cant]) => `
            <div style="background:#0f172a; padding:8px 12px; border-radius:6px; text-align:center; min-width:80px; border:1px solid ${cant > 0 ? '#334155' : '#ef4444'};">
                <div style="font-size:12px; color:#94a3b8; text-transform:capitalize;">${trago}</div>
                <div style="font-size:16px; font-weight:bold; color:${cant > 0 ? '#38bdf8' : '#ef4444'};">${cant}</div>
            </div>
        `).join('');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(200);
        const filasVentas = ventas.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:15px; color:#94a3b8;">Aún no hay ventas registradas.</td></tr>`
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
                <title>Historial de Ventas e Informe</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                    .panel { background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 100%; max-width: 650px; }
                    h1 { color: #38bdf8; text-align: center; margin-top: 0; }
                    .recaudacion { background: #0f172a; border: 1px solid #22c55e; color: #22c55e; font-size: 20px; text-align: center; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                    .stock-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; text-align: left; }
                    th { background: #0f172a; padding: 10px; color: #94a3b8; }
                    .btn-volver { display: block; text-align: center; margin-top: 20px; padding: 10px; background: #38bdf8; color: #0f172a; text-decoration: none; font-weight: bold; border-radius: 6px; }
                </style>
            </head>
            <body>
                <div class="panel">
                    <h1>📊 Informe General del Bar</h1>
                    <div class="recaudacion">💵 <strong>Total Recaudado:</strong> $${recaudacionTotal}</div>
                    
                    <h3 style="font-size:14px; color:#94a3b8; text-align:center; margin-bottom:10px;">📦 INVENTARIO ACTUAL</h3>
                    <div class="stock-grid">${tarjetasStock}</div>
                    <h3 style="font-size:14px; color:#94a3b8; margin-top:20px;">📋 DETALLE DE VENTAS</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Trago</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>${filasVentas}</tbody>
                    </table>
                    <a href="/" class="btn-volver">⬅️ Volver a la Barra</a>
                </div>
            </body>
            </html>
        `);
    }
});

// 5. Encendemos el servidor
servidor.listen(PUERTO, () => {
    console.log(`\n🍸 Servidor POST Activo en: http://localhost:${PUERTO}`);
    console.log(`📊 Historial de Ventas en: http://localhost:${PUERTO}/ventas\n`);
});

