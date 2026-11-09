// =============================================================
//      APP 15: CRUD COMPLETO Y PARÁMETROS DE RUTA CON EXPRESS
// =============================================================

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { PRECIOS, STOCK, atenderClientes } = require('./logicaBar');


const app = express();
const PUERTO = 3001;
const ARCHIVO_VENTAS = path.join(__dirname, 'ventas.json');

app.use(express.json());


// Funciones auxiliares de base de datos
async function leerVentas() {
    try {
        const datos = await fs.readFile(ARCHIVO_VENTAS, 'utf-8');
        return JSON.parse(datos);

    } catch (error) {
        return [];
    }


}
async function guardartTodasLasVentas(ventas) {
    await fs.writeFile(ARCHIVO_VENTAS, JSON.stringify(ventas, null, 2));

}

// -------------------------------------------------------------
// 1. RUTAS DE LECTURA (GET)
// -------------------------------------------------------------


// Servir la página web

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// Consultar stock completo
app.get('/api/stock', (req, res) => {
    res.json(STOCK);
});

// Consultar todas las ventas

app.get('/api/ventas', async (req, res) => {
    const ventas = await leerVentas();
    res.json(ventas);

});


// ⭐ NUEVO: Buscar ventas de un cliente específico por URL usando :nombreCliente
app.get('/api/ventas/:nombreCliente', async (req, res) => {
    // req.params captura lo que el usuario escribió después de /api/ventas/
    const { nombreCliente } = req.params;

    const ventas = await leerVentas();
    // Filtramos ignorando mayúsculas y minúsculas
    const ventasDeCliente = ventas.filter(
        v => v.cliente.trim().toLowerCase() === nombreCliente.trim().toLowerCase()
    );

    if (ventasDeCliente.length === 0) {
        return res.status(404).json({
            mensaje: `No se encontraron compras para el cliente'${nombreCliente}'.`
        });
    }
    res.json({
        cliente: nombreCliente,
        totalCompras: ventasDeCliente.length,
        historial: ventasDeCliente
    });

});


// -------------------------------------------------------------
// 2. RUTA DE CREACIÓN (POST)
// -------------------------------------------------------------

app.post('/api/atender', async (req, res) => {
    try {
        const { nombre, edad, cash, trago } = req.body;
        if (!nombre || isNaN(edad) || isNaN(cash) || !trago) {
            return res.status(400).json({
                exito: false,
                mensaje: "Faltan datos requeridos(nombre, edad, cash, trago)."
            });
        }
        const ticket = atenderClientes(
            { nombre, edad: Number(edad), cash: Number(cash) },
            trago
        );

        if (ticket.exito) {
            const ventas = await leerVentas();
            ventas.push({
                ...ticket,
                fechaHora: new Date().toLocaleString()
            });
            await guardartTodasLasVentas(ventas);
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error interno del servidor." });
    }
});



// -------------------------------------------------------------
// 3. RUTA DE ACTUALIZACIÓN (PUT): Reponer Stock de un trago
// -------------------------------------------------------------
app.put('/api/stock/reponer', (req, res) => {
    const { trago, cantidad } = req.body;


    // Validamos que el trago exista en la carta y que la cantidad sea positiva
    if (!PRECIOS[trago] || !cantidad || cantidad <= 0) {
        return res.status(400).json({
            exito: false,
            mensaje: "Trago no valido o cantidad incorrecta..."
        });
    }
    // Aumentamos el stock
    STOCK[trago] += Number(cantidad);

    res.json({
        exito: true,
        mensaje: `¡Stock repusto! Ahora hay ${STOCK[trago]}  unidades de '${trago}'.`,
        stockActual: STOCK
    });

});



// -------------------------------------------------------------
// 4. RUTA DE ELIMINACIÓN (DELETE): Limpiar/Resetear Historial
// -------------------------------------------------------------


app.delete('/api/ventas', async (req, res) => {
    try {
        // Guardamos un arreglo vacío en ventas.json
        await guardartTodasLasVentas([]);
        res.json({
            exito: true,
            mensaje: "Historial de ventas reseteado con exito."
        });

    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error al resetear ventas" });

    }
});



// -------------------------------------------------------------
// 5. ENCENDIDO DEL SERVIDOR
// -------------------------------------------------------------
app.listen(PUERTO, () => {
    console.log(`\n🍸 Servidor CRUD Express activo en: http://localhost:${PUERTO}`);
    console.log(`📦 Ver Stock: http://localhost:${PUERTO}/api/stock`);
    console.log(`📜 Ver Ventas: http://localhost:${PUERTO}/api/ventas`);
    console.log(`🔍 Filtrar Cliente: http://localhost:${PUERTO}/api/ventas/neuen`);
});
