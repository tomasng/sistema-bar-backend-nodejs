// 1. Importamos el módulo de archivos ASINCRÓNICO (basado en promesas)

const fs = require('fs/promises');

// 2. Importamos nuestra lógica del bar que ya tenemos armada
const { PRECIOS, atenderClientes, calcularRecaudacion } = require('./logicaBar');

console.log("=== SISTEMA ASINCRÓNICO DEL BAR (app6.js) ===\n");


// 3. Clientes que llegan al bar
const clientes = [
    { nombre: "Tomás", edad: 30, cash: 5000, pedido: "ginTonic" },
    { nombre: "Catalina", edad: 21, cash: 60000, pedido: "whisky" },
    { nombre: "El salamin", edad: 16, cash: 3000, pedido: "birra" },
    { nombre: "El Neuen", edad: 19, cash: 2000, pedido: "fernet" }
];

// 4. FUNCIÓN ASINCRÓNICA PRINCIPAL (Contiene 'async' para poder usar 'await')

async function ejecutarCierreDelBar() {

    try {
        console.log(" 1. Procesando pedidos de la noche...");
        const tickets = clientes.map(c => atenderClientes(c, c.pedido));

        const total = calcularRecaudacion(tickets);
        console.log(`2. Recaudación calculada: $${total}`);

        const reporte = {
            fecha: new Date().toLocaleDateString(),
            recaudacioTotal: total,
            tickets: tickets
        };
        // 'await' le dice a Node: "Esperá a que el disco termine de guardar antes de seguir"


        console.log(" 3. Guardando archivo asincroónicamente en disco...");
        await fs.writeFile('cierre_async.json', JSON.stringify(reporte, null, 2));
        console.log(" 4. ¡Archivo 'cierre_async.json' guardado con éxito!");

        // Para demostrar el asincronismo: ¡Ahora lo leemos del disco también con 'await'!

        console.log("\n 5. Leyendo el archivo recien guardado...");
        const datosEnDisco = await fs.readFile('cierre_async.json', 'utf-8');
        const reporteLeido = JSON.parse(datosEnDisco);

        console.log(`6. Comprobado: leído desde el disco con ${reporteLeido.tickets.length} tickets registrados`);





    } catch (error) {
        // Si algo falla (ej. disco lleno o error de permisos), cae acá sin romper la app
        console.error(" Ocurrio un error en el proseso asincrónico:", error.message);

    }


}

// 5. Ejecutamos nuestra función asincrónica

ejecutarCierreDelBar();
