// =============================================================
//      APP 20: INTRODUCCIÓN A BASES DE DATOS RELACIONALES (SQL)
// =============================================================

// 1. IMPORTAMOS EL MOTOR SQL NATIVO DE NODE.JS (Disponible en Node 24)

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// 2. CONECTAMOS (O CREAMOS) EL ARCHIVO DE BASE DE DATOS 'bar.db'

const rutaDB = path.join(__dirname, 'bar.db');
const db = new DatabaseSync(rutaDB);

console.log("🗄️ Conectado con éxito a la base de datos SQLite 'bar.db'");

// =============================================================
// 3. CREACIÓN DE TABLAS (DDL: Data Definition Language)
// =============================================================
// Tabla A: 'tragos' (Inventario y Carta)
// - id: Clave Primaria autoincremental (1, 2, 3...)
// - nombre: Texto único (no pueden haber 2 tragos con el mismo nombre)
// - precio: Entero obligatorio
// - stock: Entero obligatorio

db.exec(`
    CREATE TABLE IF NOT EXISTS tragos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        precio INTEGER NOT NULL,
        STOCK INTEGER NOT NULL
    );
`);

// Tabla B: 'ventas' (Historial de compras)
// - trago_id: Clave Foránea (conecta con el id de la tabla tragos)
// - fecha: Guarda automáticamente la fecha y hora actual

db.exec(`
    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT NOT NULL,
        trago_id INTEGER NOT NULL,
        precio_cobrado INTEGER NOT NULL,
        vuelto INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trago_id) REFERENCES tragos(id)
    
    );

`);

console.log("✅ Tablas 'tragos' y 'ventas' verificadas / creadas.");


// =============================================================
// 4. INSERTAR DATOS INICIALES (INSERT INTO)
// =============================================================

// Insertamos la carta de tragos inicial si la tabla está vacía


const conteoTragos = db.prepare('SELECT COUNT(*) AS total FROM tragos').get();

if (conteoTragos.total === 0) {
    console.log("📦 Cargando carta de tragos inicial en la base de datos...");

    const insertarTrago = db.prepare(`
        INSERT INTO tragos (nombre, precio, stock)
        VALUES (?,?,?)
        
    
    `);

    insertarTrago.run('fernet', 2000, 10);
    insertarTrago.run('birra', 1200, 15);
    insertarTrago.run('ginTonic', 2500, 8);
    insertarTrago.run('whisky', 3500, 5);
    insertarTrago.run('gaseosa', 800, 20);
    insertarTrago.run('agua', 500, 30);

    console.log("🎉 Carta cargada con éxito.");


}


// =============================================================
// 5. CONSULTAS SQL (SELECT)
// =============================================================


console.log("\n--- 📋 LISTA COMPLETA DE TRAGOS (SELECT * FROM tragos)---");
const todosLosTragos = db.prepare('SELECT * FROM tragos').all();
console.table(todosLosTragos);

console.log("\n--- 🔍 FILTRO: Tragos con precio menor a $2000 (WHERE precio < 2000)--- ");
const tragosBaratos = db.prepare('SELECT nombre, precio FROM tragos WHERE precio < 2000').all();
console.table(tragosBaratos);

