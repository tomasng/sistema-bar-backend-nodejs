// 1. Variables (guardar datos)

const nombre = "Tomás"; //const -> constante, no se puede cambiar

let edad = 30; //let -> variable, se puede cambiar

// 2. condicionales (tomar decisiones)

//if (edad >= 18) {
//    console.log(`${nombre} Eres mayor de edad puede tomar alcohol`);
// } else {
//    console.log(`${nombre}Eres menor de edad no puede tomar alcohol`);
// }


// 3. Funciones (bloques de codigo reutilizables)

//function saludar(nombre) {
//    return `Hola ${nombre} bienvenido al bar`

//}


//console.log(saludar(nombre));



// 1. Un Arreglo de Objetos (como si viniera de una base de datos)
const clientes = [
    { nombre: "Tomás", edad: 30, cash: 5000 },
    { nombre: "Catalina", edad: 21, cash: 60000 },
    { nombre: "El salamin", edad: 17, cash: 1500 },
    { nombre: "Elsa Pito", edad: 27, cash: 3000 },
    { nombre: "El Neuen", edad: 19, cash: 2000 },
    { nombre: "Perrri con 3 erres", edad: 20, cash: 15000 },
    { nombre: "Bestia ", edad: 18, cash: 1500 },



];

const preciofernet = 2000;


// 2. Función para procesar a cada cliente
function procesarCliente(cliente) {
    console.log(`---revisando al ${cliente.nombre}---`);

    if (cliente.edad < 18) {
        return `stop perri ${cliente.nombre} sos mu niño salamin capish...`;
    }


    if (cliente.cash < preciofernet) {
        return `tas secaso hermano ${cliente.nombre} ... andate a cagar no te alcanza esa mugre($${cliente.cash})...`;

    }
    const vuelto = cliente.cash - preciofernet;

    return `toma ${cliente.nombre} el fernusconi ... te dejo el guelto pa te quedo eso: $${vuelto}`

};

// 3. Recorrer la lista (bucle for...of)

for (const c of clientes) {
    const resultado = procesarCliente(c)
    console.log(resultado);
}