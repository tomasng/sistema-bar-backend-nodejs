// =============================================================
//               MÓDULO: LÓGICA DEL BAR (logicaBar.js)
// =============================================================

// 1. CARTA DE PRECIOS DEL BAR (Objeto con los tragos y bebidas)
const PRECIOS = {
    fernet: 2000,
    birra: 1200,
    ginTonic: 2500,
    whisky: 3500,
    gaseosa: 800,
    agua: 500
};


// 2. INVENTARIO / STOCK DISPONIBLE
const STOCK = {
    fernet: 3,      // Ponemos pocas para probar cuando se agote
    birra: 2,
    ginTonic: 4,
    whisky: 0,      // Whisky empieza en 0 para probar el rechazo inmediato
    gaseosa: 5,
    agua: 10
};

// 2. Función para procesar el pedido de un cliente
function atenderClientes(cliente, trago) {
    // Buscamos el precio del trago pedido en el objeto PRECIOS
    const precio = PRECIOS[trago];

    // A) Validar si el trago existe en nuestra carta
    if (!precio) {
        return {
            clientes: cliente.nombre,
            trago: trago,
            exito: false,
            vuelto: 0,
            mensaje: `No vendemos '${trago}' en el bar.`

        };
    }

    // B) Validar si es menor de edad (salvo que pida gaseosa o agua)
    if (trago !== "gaseosa" && trago !== "agua" && cliente.edad < 18) {

        return {
            cliente: cliente.nombre,
            trago: trago,
            exito: false,
            vuelto: 0,
            mensaje: `Rebotado: ${cliente.nombre} tiene ${cliente.edad} años y no le puedo vender alcohol`
        };
    }

    // C) Validar si hay STOCK disponible del trago
    if (STOCK[trago] <= 0) {
        return {
            cliente: cliente.nombre,
            trago: trago,
            exito: false,
            vuelto: 0,
            mensaje: `❌ ¡Agotado! No queda más '${trago}' en la barra.`
        };
    }



    // C) Validar si le alcanza el dinero

    if (cliente.cash < precio) {
        const falta = precio - cliente.cash;
        return {
            cliente: cliente.nombre,
            trago: trago,
            exito: false,
            vuelto: 0,
            mensaje: ` No te alcanza, ${cliente.nombre}. Te falta $${falta} para el coctel ${trago}`
        };
    }

    // D) Si pasó todos los controles: ¡Venta exitosa!
    STOCK[trago] -= 1; // 👈 ¡Descontamos 1 unidad del inventario!
    const vuelto = cliente.cash - precio;
    return {
        cliente: cliente.nombre,
        trago: trago,
        precioCobrado: precio,
        pagoCon: cliente.cash,
        vuelto: vuelto,
        stockRestante: STOCK[trago], // 👈 Dato extra útil
        exito: true,
        mensaje: `¡Listo el trago! ${cliente.nombre} compró ${trago} por $${precio}. Su vuelto es de $${vuelto}. (Quedan ${STOCK[trago]} en stock)`
    };
}


// 4. Función para calcular la recaudación total de las ventas exitosas
function calcularRecaudacion(tickets) {
    return tickets.reduce((total, ticket) => {
        // Solo sumamos si la venta fue exitosa (exito === true)
        if (ticket.exito) {

            return total + ticket.precioCobrado;
        }
        return total;

    }, 0);

}




// 3. Exportamos las herramientas para que otros archivos puedan usarlas
module.exports = {
    PRECIOS,
    STOCK,
    atenderClientes,
    calcularRecaudacion
};

