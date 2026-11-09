// 1. Importamos la lógica y los precios desde nuestro propio archivo


//const { PRECIOS, atenderClientes } = require("./logicaBar");
const fs = require('fs');
const { PRECIOS, atenderClientes, calcularRecaudacion } = require("./logicaBar");

console.log("=== SISTEMA MODULAR DEL BAR ===");
console.log("Carta de precios disponibles", PRECIOS);

// 2. Clientes que llegan a la barra

const clientes = [
    { nombre: "Tomás", edad: 30, cash: 5000, pedido: "fernet" },
    { nombre: "Catalina", edad: 21, cash: 60000, pedido: "whisky" },
    { nombre: "El salamin", edad: 16, cash: 3000, pedido: "birra" },   // Menor pidiendo alcohol -> Rebotado
    { nombre: "Pedrito", edad: 15, cash: 1000, pedido: "gaseosa" },     // Menor pidiendo gaseosa -> ¡Pasa!
    { nombre: "Elsa Pito", edad: 27, cash: 1000, pedido: "ginTonic" }, // Le falta plata -> Rebotado
    { nombre: "El Neuen", edad: 19, cash: 2000, pedido: "fernet" }     // Compra justa -> ¡Pasa!

];


// 3. Procesamos a cada cliente usando la función importada

console.log("\n --- ATENDIENDO EN LA BARRA --- ");

const tickets = clientes.map(cliente => {
    const ticket = atenderClientes(cliente, cliente.pedido);
    console.log(ticket.mensaje);
    return ticket;
});

// 4. Calcular recaudación total usando nuestra función modular

const total = calcularRecaudacion(tickets);
console.log(`\n Recaudación total dela noche: $${total}`);


// 5. Guardar el reporte en disco

const repoorteNoche = {
    fecha: new Date().toLocaleDateString(),
    recaudacionTotal: total,
    totalClientesAtendidos: tickets.length,
    detallesTickets: tickets
};

fs.writeFileSync('cierre_modular.json', JSON.stringify(repoorteNoche, null, 2));
console.log("📄 ¡Archivo 'cierre_modular.json' guardado con éxito!");



