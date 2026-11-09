// 1. Importamos el módulo HTTP nativo de Node.js

const http = require('http');

// 2. Importamos las herramientas de nuestro bar modular

const { PRECIOS, atenderClientes } = require("./logicaBar");



// 3. Definimos el puerto del servidor
const PUERTO = 3000;


// 4. Creamos el servidor web

const servidor = http.createServer((req, res) => {
    // Indicamos que siempre responderemos en formato JSON con tildes (UTF-8)
    res.setHeader('Content-Type', 'application/json;charset=utf-8');

    // Separamos la ruta de los parámetros usando la clase nativa 'URL'
    const urlCompleta = new URL(req.url, `http://${req.headers.host}`);
    const ruta = urlCompleta.pathname; // Ejemplo: "/atender"
    const params = urlCompleta.searchParams;   // Contiene los parámetros ?nombre=...

    console.log(`Peticion recibida en: ${req.url}`);

    // --- RUTA 1: Menú principal de ayuda ("/") ---
    if (ruta === '/') {
        res.writeHead(200);
        return res.end(JSON.stringify({
            mensaje: "🍸 ¡Bienvenido a la API interactiva del Bar!",
            instrucciones: "Enviá datos en la URL: /atender?nombre=...&edad=...&cash=...&trago=...",
            ejemplo: `http://localhost:${PUERTO}/atender?nombre=Tomas&edad=25&cash=5000&trago=fernet`
        }, null, 2));
    }

    // --- RUTA 2: Ver carta de precios ("/precios") ---

    if (ruta === '/precios') {
        res.writeHead(200);
        return res.end(JSON.stringify(PRECIOS, null, 2));
    }

    // --- RUTA 3: Atender a un cliente dinámicamente ("/atender") ---
    if (ruta === '/atender') {
        // Extraemos los datos que envió el usuario en la URL
        const nombre = params.get('nombre');
        const edadTexto = params.get('edad');
        const cashTexto = params.get('cash');
        const trago = params.get('trago');

        // A) Validación: ¿Falta algún dato en la URL?
        if (!nombre || !edadTexto || !cashTexto || !trago) {
            res.writeHead(400); // 400 = Bad Request (Petición incompleta)
            return res.end(JSON.stringify({
                error: "Faltan datos obligatorios...",
                formatoEsperado: "/atender?nombre=TuNombre&edad=TuEdad&cash=TuDinero&trago=TuTrago"
            }, null, 2));
        }
        // B) Convertimos texto a número
        const edad = Number(edadTexto);
        const cash = Number(cashTexto);

        // C) Validación: ¿La edad o el dinero son letras o números inválidos?

        if (isNaN(edad) || isNaN(cash) || edad <= 0 || cash < 0) {
            res.writeHead(400);
            return res.end(JSON.stringify({
                error: "La edad y el dinero (Cash) deben ser números válidos mayores a 0..."

            }, null, 2));

        }

        // D) Armamos el objeto cliente y lo procesamos con nuestra lógica del bar

        const cliente = { nombre, edad, cash };
        const ticket = atenderClientes(cliente, trago);

        // E) Respondemos con éxito (200 OK) y el ticket generado
        res.writeHead(200);
        return res.end(JSON.stringify(ticket, null, 2));



    }
    // --- RUTA NO ENCONTRADA (Error 404) ---

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Ruta no encontrada en el bar" }, null, 2));


});

// 5. Encendemos el servidor

servidor.listen(PUERTO, () => {
    console.log(`🚀 Servidor activo en: http://localhost:${PUERTO}`);
    console.log(`👉 Probá en tu navegador:`);
    console.log(`   http://localhost:${PUERTO}/atender?nombre=Tomas&edad=25&cash=5000&trago=fernet`);
});
