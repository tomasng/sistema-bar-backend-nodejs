
// const precios = [900, 1650, 8000, 7898, 124, 265, 3500];


// .map() pasa por cada precio y le aplica la operación que le digas

// const preciosDuplicados = precios.map(precio => precio * 2);


// console.log(preciosDuplicados);

// Resultado: [2000, 4000, 6000]



const clientes = [
    { nombre: "Tomás", cash: 4000 },
    { nombre: "Santiago", cash: 9000 },
    { nombre: "Matias", cash: 700 },
    { nombre: "Ale", cash: 2000 },
    { nombre: "Camila", cash: 10000 },


];

const PRECIO_FERNET = 1500;


// Usamos .map() para transformar cada cliente en un ticket de compra:
//const tickets = clientes.map(cliente => {
// return {
//    cliente: cliente.nombre,
//     pago: cliente.cash,
//     vuelto: cliente.cash - PRECIO_FERNET,
////   };
//});



// 1. Preguntamos si el dinero le alcanza:
const tickets = clientes.map(cliente => {

    // Si le alcanza: calculamos el vuelto normalmente

    if (cliente.cash >= PRECIO_FERNET) {
        return {
            cliente: cliente.nombre,
            pago: cliente.cash,
            vuelto: cliente.cash - PRECIO_FERNET,
            estado: "¡aca tenes el Fernandiño!"

        }
    } else {
        const falta = PRECIO_FERNET - cliente.cash;
        return {
            cliente: cliente.nombre,
            pago: cliente.cash,
            vuelto: "sin vuelto",
            estado: `Andate a cagar ${cliente.nombre} te falta $${falta} pa llevarte el Fernandiño`,
        }
    }
});







console.log(tickets);


// -------------------------------------------------------------
// 2. MÉTODO .reduce(): Calcular la recaudación total de la noche
// -------------------------------------------------------------

const totalRecaudado = tickets.reduce((acumulador, ticket) => {

    // Si el ticket fue una compra exitosa, sumamos el precio del Fernet
    if (ticket.vuelto !== "sin vuelto") {
        return acumulador + PRECIO_FERNET;
    }

    // Si no compró (ej. Matías), devolvemos el acumulador sin sumar nada

    return acumulador;

}, 0); // <-- El 0 es donde arranca la alcancía

console.log(`\n Recaudacion total de la nigth en el bar: $${totalRecaudado}`);



// -------------------------------------------------------------
// 3. GUARDAR EL CIERRE DE CAJA EN UN ARCHIVO .json
// -------------------------------------------------------------


// 1. Importamos el módulo de archivos de Node (si no lo pusiste arriba de todo)

const fs = require('fs');


// 2. Armamos el objeto con el resumen completo de la noche

const balanceNoche = {
    fecha: new Date().toLocaleDateString(),
    precioFernet: PRECIO_FERNET,
    recaudacionTotal: totalRecaudado,
    detalleVentas: tickets
};

// 3. Convertimos el objeto en formato texto JSON con sangría de 2 espacios

const datoJson = JSON.stringify(balanceNoche, null, 2);


// 4. Guardamos el archivo en disco

fs.writeFileSync('cierre_caja.json', datoJson);


console.log("¡Archivo 'cierre_caja.json' se registro con exito!")
