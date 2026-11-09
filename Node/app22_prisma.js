// =============================================================
//      APP 22: PRISMA ORM - MODELOS TIPADOS Y RELACIONES
// =============================================================

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// 1. Instanciamos el cliente de Prisma (nuestro puente a la BD)
const prisma = new PrismaClient();

// =============================================================
// FUNCIÓN PARA VENDER UN TRAGO CON PRISMA ORM
// =============================================================
async function realizarVenta(nombreCliente, nombreTrago, dineroCliente) {
    console.log(`\n 🍸 Procesando pedido: ${nombreCliente} pide '${nombreTrago}' con${dineroCliente}...`);

    // A) Buscar el trago por su nombre único
    const trago = await prisma.trago.findUnique({
        where: { nombre: nombreTrago }
    });

    if (!trago) {
        console.log(`❌ Error: El trago '${nombreTrago}' no existe en ala carta. `);
        return;
    }

    if (trago.stock <= 0) {
        console.log(`❌ Agotado: No queda stock de '${trago.nombre}'.`);
        return;
    }

    if (dineroCliente < trago.precio) {
        const falta = trago.precio - dineroCliente;
        console.log(`❌ No le alcanza a ${nombreCliente}: Faltan $${falta}.`);
        return;
    }

    // B) Crear el registro en la tabla Venta
    const vuelto = dineroCliente - trago.precio;
    await prisma.venta.create({
        data: {
            cliente: nombreCliente,
            tragoId: trago.id,
            precioCobrado: trago.precio,
            vuelto: vuelto
        }

    });

    // C) Restar 1 al stock del trago
    await prisma.trago.update({
        where: { id: trago.id },
        data: { stock: { decrement: 1 } }
    });

    console.log(`✅ ¡Venta exitosa! ${nombreCliente} compró '${trago.nombre}'. Vuelto: $${vuelto}`);


}

async function main() {
    console.log("💎 Conectado a la Base de Datos mediante Prisma ORM\n");

    // 2. CARGAR LA CARTA INICIAL (Usando 'upsert' para no duplicar si ya existen)
    console.log("🍾 Verificando y cargando carta de tragos...");

    await prisma.trago.upsert({
        where: { nombre: 'fernet' },
        update: {}, // Si ya existe, no le cambiamos nada
        create: { nombre: 'fernet', precio: 2000, stock: 10 }
    });

    await prisma.trago.upsert({
        where: { nombre: 'gin tonic' },
        update: {},
        create: { nombre: 'gin tonic', precio: 2500, stock: 8 }
    });

    await prisma.trago.upsert({
        where: { nombre: 'cerveza' },
        update: {},
        create: { nombre: 'cerveza', precio: 1500, stock: 15 }
    });

    // 3. CONSULTAR TODOS LOS TRAGOS (Equivalente a: SELECT * FROM tragos)

    const carta = await prisma.trago.findMany();
    console.log("📋 CARTA ACTUAL EN LA BASE DE DATOS:");
    console.table(carta);

    // 4. SIMULAR VENTAS EN LA BARRA
    await realizarVenta("Tomás", "fernet", 5000);
    await realizarVenta("Catalina", "gin tonic", 3000);
    await realizarVenta("Bestia", "fernet", 1500); // No le alcanza
    await realizarVenta("Perrri", "whisky", 10000); // No existe

    // 5. ⭐ REPORTE CON RELACIÓN (Equivalente a JOIN ventas + tragos)
    console.log("\n========================================================");
    console.log("📊 REPORTE DE VENTAS CON RELACIÓN (include: { trago: true })");
    console.log("========================================================");

    const ventasConTrago = await prisma.venta.findMany({
        include: { trago: true },  // 👈 ¡El JOIN mágico de Prisma!
        orderBy: { id: 'desc' }
    });

    // Formateamos para que console.table muestre el nombre del trago prolijo

    const tablaReporte = ventasConTrago.map(v => ({
        ticket: v.id,
        cliente: v.cliente,
        trago_ciomprado: v.trago.nombre,
        pagado: v.precioCobrado,
        vuelto: v.vuelto,
        fecha: v.fecha.toLocaleString()
    }));

    console.table(tablaReporte);

    // 6. 💰 CIERRE DE CAJA CON AGGREGATE (COUNT y SUM)

    const caja = await prisma.venta.aggregate({
        _count: true,
        _sum: { precioCobrado: true }
    });

    console.log("\n💰 CIERRE DE CAJA AUTOMÁTICO (PRISMA AGGREGATE):");
    console.log(`- Total de tickets emitidos: ${caja._count}`);
    console.log(`- Recaudación total acumulada: $${caja._sum.precioCobrado}`);
}

// Ejecutamos la función principal y cerramos la conexión al terminar
main()

    .catch((error) => {
        console.error("❌ Error en Prisma:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
