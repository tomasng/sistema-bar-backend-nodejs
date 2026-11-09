// 1. Importamos el módulo interactivo de Node (con promesas)
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');


// 1. Importamos el módulo interactivo de Node (con promesas)
const { PRECIOS, atenderClientes } = require('./logicaBar');

// 3. Creamos la interfaz de preguntas y respuestas

const rl = readline.createInterface({ input, output });


async function atenderEnVivo() {
    console.log("=== BAR INTERACTIVO EN VIVO (app7.js) ===");
    console.log("== Carta de precios disponibles:", PRECIOS);
    console.log("----------------------------------/n");

    try {
        // Le hacemos preguntas al usuario en vivo por la terminal:
        const nombre = await rl.question("👤 Nombre del cliente: ");
        const edadTexto = await rl.question("🎂 Edad: ");
        const cashTexto = await rl.question("💵 Dinero disponible: $");
        const trago = await rl.question("🍹 ¿Qué trago desea tomar?: ");

        // Convertimos los números (que entran como texto) a tipo Number

        const cliente = {
            nombre: nombre,
            edad: Number(edadTexto),
            cash: Number(cashTexto)
        };
        console.log("\n Atendiendo pedido...");
        const ticket = atenderClientes(cliente, trago.trim());

        console.log("-------------------------------");
        console.log(" RESULTADO DEL TICKET:");
        console.log(ticket.mensaje);
        console.log("---------------------------------");


    } catch (error) {
        console.error("XXXX Ocurrio un error:", error.message);

    } finally {
        // 'finally' SIEMPRE se ejecuta: cerramos la consola interactiva para que no se quede colgada
        rl.close();
    }
}

// Ejecutamos la función interactiva
atenderEnVivo();
