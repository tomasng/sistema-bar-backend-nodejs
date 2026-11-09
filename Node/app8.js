// 1. Importamos el módulo HTTP nativo de Node.js
const http = require('http');

// 2. Importamos nuestra lógica del bar
const { PRECIOS, atenderClientes } = require('./logicaBar');



// 3. Definimos el puerto donde va a escuchar el bar (como el número de mesa/canal)

const PUERTO = 3000;


// 4. Creamos el servidor web

const servidor = http.createServer((req, res) => {
    // Configuramos la cabecera para que el navegador entienda que respondemos en JSON
    res.setHeader('Content-Type', 'application/json;charset=utf-8');

    console.log(`Peticion recibida en la ruta: ${req.url}`);

    // RUTA 1: Si entra a la raíz "/"
    if (req.url === '/') {
        res.writeHead(200);
        return res.end(JSON.stringify({
            mensaje: "!Bienvenido a la API web del Bar¡",
            rutasDisponibles: ["/precios", "/atender-demo"]

        }));
    }

    // RUTA 2: Si entra a "/precios"
    if (req.url === '/precios') {
        res.writeHead(200);
        return res.end(JSON.stringify(PRECIOS, null, 2));
    }
    // RUTA 3: Si entra a "/atender-demo"
    if (req.url === '/atender-demo') {
        const clientePrueba = { nombre: "Tomas Web", edad: 25, cash: 5000 };
        const ticket = atenderClientes(clientePrueba, "fernet");
        res.writeHead(200);
        return res.end(JSON.stringify(ticket, null, 2));

    }
    // Si entra a cualquier otra ruta que no existe (Error 404)

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Ruta no encontrada en el bar" }));





});

// 5. Ponemos el servidor a escuchar pedidos

servidor.listen(PUERTO, () => {
    console.log(`🚀 Servidor del Bar corriendo en http://localhost:${PUERTO}`);
    console.log("👉 Abrí tu navegador y visitá:");
    console.log(`   - http://localhost:${PUERTO}/`);
    console.log(`   - http://localhost:${PUERTO}/precios`);
    console.log(`   - http://localhost:${PUERTO}/atender-demo\n`);
});
