// =============================================================
//      APP 21: VENTAS RELACIONADAS, UPDATE Y CONSULTAS CON JOIN
// =============================================================


const { DatabaseSync } = require('node:sqlite');
const path = require('path');


// 1. CONECTAMOS A LA BASE DE DATOS EXISTENTE 'bar.db'

const rutaDB = path.join(__dirname, 'bar.db');
const db = new DatabaseSync(rutaDB);

console.log("🗄️ Conectado a 'bar.db' para procesar ventas y reportes.");



// =============================================================
// 2. FUNCIÓN PARA VENDER UN TRAGO (LÓGICA CON SQL PURO)
// =============================================================

function realizarVenta(nombreCliente, nombreTrago, dineroCliente) {
    console.log(`\n 🍸 procesando pedido: ${nombreCliente} pide '${nombreTrago}' con $${dineroCliente}...`);

    // A) Buscar el trago en la base de datos
    const buscarTrago = db.prepare('SELECT * FROM tragos WHERE nombre = ?');
    const trago = buscarTrago.get(nombreTrago);

    // Validar si existe

    if (!trago) {
        console.log(`❌ Error: El trago '${nombreTrago}' no existe en la carta.`);
        return;
    }

    // Validar stock
    if (trago.stock <= 0) {
        console.log(`❌ Agotado: No queda stock de '${trago.nombre}'.`);
        return;

    }

    // Validar si le alcanza el dinero

    if (dineroCliente < trago.precio) {
        const falta = trago.precio - dineroCliente;
        console.log(`❌ No le alcanza a ${nombreCliente}: Faltan $${falta}.`);
        return;

    }

    // B) REGISTRAR LA VENTA EN LA TABLA 'ventas' (INSERT INTO)
    const vuelto = dineroCliente - trago.precio;
    const insertarVenta = db.prepare(`
        INSERT INTO ventas (cliente, trago_id, precio_cobrado, vuelto)
        VALUES (?,?,?,?)
    `)

    insertarVenta.run(nombreCliente, trago.id, trago.precio, vuelto);

    // C) DESCONTAR STOCK EN LA TABLA 'tragos' (UPDATE)
    const actualizarStock = db.prepare(`
        UPDATE tragos
        SET stock = stock - 1
        WHERE id = ?
    `);
    actualizarStock.run(trago.id);

    console.log(`✅ ¡Venta exitosa! ${nombreCliente} compró ${trago.nombre}. Vuelto: $${vuelto}.`);




}


// =============================================================
// 3. SIMULAMOS VENTAS DE CLIENTES
// =============================================================
realizarVenta("Neuen", "fernet", 5000);   // Compra Fernet ($2000)
realizarVenta("Tomas", "birra", 2000);    // Compra Birra ($1200)
realizarVenta("Sofia", "ginTonic", 3000); // Compra Gin Tonic ($2500)
// =============================================================
// 4. ⭐ LA CONSULTA REINA: EL 'JOIN' (UNIR DOS TABLAS)
// =============================================================


console.log("\n========================================================");
console.log("📊 REPORTE DE VENTAS COMBINADO (JOIN VENTAS + TRAGOS)");
console.log("========================================================");

// Unimos ventas con tragos donde ventas.trago_id sea igual a tragos.id
const consultaReporte = db.prepare(`
    SELECT 
        ventas.id AS venta_id,
        ventas.cliente,
        tragos.nombre AS trago_comprado,
        ventas.precio_cobrado,
        ventas.vuelto,
        ventas.fecha
    FROM ventas
    JOIN tragos ON ventas.trago_id = tragos.id
    ORDER BY ventas.id DESC
    
`)


const reporteCompleto = consultaReporte.all();
console.table(reporteCompleto);



// =============================================================
// 5. FUNCIONES DE AGREGACIÓN SQL: SUM() Y COUNT()
// =============================================================



// La base de datos calcula la recaudación total al instante

const caja = db.prepare(`
    SELECT 
        COUNT(*) AS total_ventas,
        SUM(precio_cobrado) AS dinero_en_caja
    FROM ventas
`).get();

console.log("\n💰 CIERRE DE CAJA AUTOMÁTICO (SQL):");
console.log(`- Total de tickets emitidos: ${caja.total_ventas}`);
console.log(`- Recaudación total acumulada: $${caja.dinero_en_caja}`);


// Verificamos el stock actualizado de los tragos vendidos
console.log("\n📦 STOCK ACTUALIZADO EN LA BASE DE DATOS:");
const stockActual = db.prepare('SELECT id, nombre, stock FROM tragos').all();
console.table(stockActual);
