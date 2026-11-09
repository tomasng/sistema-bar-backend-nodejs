// 1. Importamos el módulo de archivos nativo de Node.js

const fs = require('fs');


// 2. Nuestra base de datos de clientes


const clientes = [
    { nombre: "Tomás", edad: 30, cash: 5000 },
    { nombre: "Catalina", edad: 21, cash: 60000 },
    { nombre: "El salamin", edad: 17, cash: 1500 },
    { nombre: "Elsa Pito", edad: 27, cash: 3000 },
    { nombre: "El Neuen", edad: 19, cash: 2000 },
    { nombre: "Perrri con 3 erres", edad: 20, cash: 15000 },
    { nombre: "Bestia", edad: 18, cash: 1500 }
];

console.log("=== GESTIÓN PERRISIMA DEL BAR ===");

// -------------------------------------------------------------
// 3. FILTRAR (.filter): Obtener solo los que son mayores de edad
// -------------------------------------------------------------

const mayores = clientes.filter(cliente => cliente.edad >= 18);
console.log(`\n total de clientes que pueden ingresar: ${mayores.length}`);


// -------------------------------------------------------------
// 4. BUSCAR (.find): Buscar a un cliente específico por su nombre
// -------------------------------------------------------------

const clienteBuscado = clientes.find(cliente => cliente.nombre === "El Neuen");
console.log(`\n Buscando a El Neuen: tiene: $${clienteBuscado.cash}`);

// -------------------------------------------------------------
// 5. NODE.JS EN ACCIÓN (Guardar en un archivo de texto)
// -------------------------------------------------------------


let reporte = "=== REPORTE DE CLIENTES HABILITADOS===\n\n";

for (const c of mayores) {
    reporte += `- Nombre: ${c.nombre} | Edad: ${c.edad} | Cash perri: $${c.cash}\n`;

}


// Node.js escribe este archivo en tu carpeta automáticamente

fs.writeFileSync('reporte_bar.txt', reporte);

console.log(`\n ¡Reporte generado con éxito! Revisa el archivo 'reporte_bar.txt' en tu carpeta `);