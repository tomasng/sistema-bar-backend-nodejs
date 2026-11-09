// 1. Importamos el módulo de archivos

const fs = require('fs');

console.log('=== Auditoría y estadísticas del BAR === ')


// 2. Leemos el archivo JSON como texto desde el disco ('utf-8' es para leer bien las letras y acentos)+

const archiviTexto = fs.readFileSync('cierre_caja.json', 'utf-8');


// 3. Convertimos ese texto en un objeto de JavaScript real

const datosCierre = JSON.parse(archiviTexto);



// 4. Mostramos los datos leídos

console.log(`\n Fecha del reporte: ${datosCierre.fecha}`);
console.log(` Precio del Fernet esa noche: $${datosCierre.precioFernet} `);
console.log(` Recaudacion TOTAL registrada: $${datosCierre.recaudacionTotal}`);
console.log(` Cantidad total de clientes procesados: ${datosCierre.detalleVentas.length}`);




// -------------------------------------------------------------
// 5. ANÁLISIS DE DATOS (Métricas del Bar)
// -------------------------------------------------------------

const tickets = datosCierre.detalleVentas;

// A) Filtrar quiénes compraron y quiénes fueron rebotados

const ventasExitosas = tickets.filter(t => t.vuelto !== "sin vuelto");
const clientesRebotados = tickets.filter(t => t.vuelto === "sin vuelto");

console.log("\n--- MÉTRICAS DE VENTAS ---");
console.log(` Fernets vendidos: ${ventasExitosas.length}`);
console.log(` Clientes rebotados por falta de cash: ${clientesRebotados.length}`);


// B) Encontrar al cliente VIP (el que más dinero trajo al bar)
// Usamos .reduce() para comparar ticket a ticket y quedarnos con el mayor pago



const clienteVIP = tickets.reduce((maximo, ticketActual) => {

    return ticketActual.pago > maximo.pago ? ticketActual : maximo;
});

console.log(` Cliente VIP de la noche: ${clienteVIP.cliente} (trajo $${clienteVIP.pago})`);

// C) Calcular el promedio de dinero que traía la gente

const dineroTotalTraido = tickets.reduce((acum, t) => acum + t.pago, 0);
const promedioCash = dineroTotalTraido / tickets.length;

console.log(` Promedio de cash por cliente: $${promedioCash}`); 
