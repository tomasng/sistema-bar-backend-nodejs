require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');
const nodemailer = require('nodemailer');

const app = express();

// Habilitamos hasta 10MB para permitir subir fotos reales desde la PC o el celular
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_marketplace_2026';
const db = new DatabaseSync(path.join(__dirname, 'ecomerce_proyecto3.db'));

// 1. Creación de las 5 Tablas del Marketplace
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL
    );


    CREATE TABLE IF NOT EXISTS productos(
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        vendedor_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        precio INTEGER NOT NULL,
        stock INTEGER NOT NULL,
        imagen TEXT NOT NULL,
        FOREIGN KEY (vendedor_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS compras (
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        comprador_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        metodo_pago TEXT NOT NULL,
        cuotas INTEGER DEFAULT 1,
        total_pagado INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comprador_id) REFERENCES usuarios(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
    );


    CREATE TABLE IF NOT EXISTS consultas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        usuario_nombre TEXT NOT NULL,
        pregunta TEXT NOT NULL,
        respuesta TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
    );


    CREATE TABLE IF NOT EXISTS resenas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        comprador_id INTEGER NOT NULL,
        puntuacion INTEGER NOT NULL,
        comentario TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (comprador_id) REFERENCES usuarios(id)
    );
    
`);

// 2. Función para Enviar Correo de Bienvenida con Nodemailer

async function enviarCorreoBienvenida(nombre, email, rol) {
    try {
        // Crea una bandeja de correo de prueba real (Ethereal) si no hay Gmail en .env
        const cuentaPrueba = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: cuentaPrueba.smtp.host,
            port: cuentaPrueba.smtp.port,
            secure: cuentaPrueba.smtp.secure,
            auth: {
                user: cuentaPrueba.user,
                pass: cuentaPrueba.pass
            }
        });

        const textoRol = rol === 'VENDEDOR'
            ? 'Ya podés publicar tus productos con foto, definir stock y responder consultas.'
            : 'Ya podés comprar con tarjeta de crédito/débito, hacer consultas y calificar productos.';

        const info = await transporter.sendMail({
            from: '"Marketplace de Tomás 🛒" <bienvenida@marketplacetomas.com>',
            to: email,
            subject: `🎉 ¡Bienvenido/a ${nombre} a nuestro Marketplace!`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h2 style="color: #f59e0b;">¡Hola ${nombre}! 👋</h2>
                <p>Tu cuenta fue creada con éxito con el perfil de <b>${rol}</b>.</p>
                <p>${textoRol}</p>
                <hr style="border-color: #334155;" />
                <small style="color: #94a3b8;">Correo enviado automáticamente por el Backend Node.js de Tomás.</small>
            </div>
           `
        });


        const urlVistaPrevia = nodemailer.getTestMessageUrl(info);
        console.log(`📩 Correo de bienvenida enviado a ${email}. Ver correo: ${urlVistaPrevia}`);
        return urlVistaPrevia;

    } catch (err) {
        console.log('⚠️ Aviso de correo (modo local):', err.message);
        return null;
    }
}

// 3. Semilla Inicial (1 Vendedor, 1 Comprador y 2 Productos con Imagen)

async function inicializarDatos() {
    const hash = await bcrypt.hashSync('1234', 10);
    const insUser = db.prepare(
        'INSERT OR IGNORE INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)'
    );
    insUser.run('Tomas_Vendedor', 'tomas@vendedor.com', hash, 'VENDEDOR');
    insUser.run('Martin_Comprador', 'martin@comprador.com', hash, 'COMPRADOR');

    const cantProd = db.prepare('SELECT COUNT(*) AS total FROM productos').get().total;
    if (cantProd === 0) {
        const vendedor = db.prepare("SELECT id FROM  usuarios WHERE rol = 'VENDEDOR' LIMIT 1").get();
        const insProd = db.prepare(`
      INSERT INTO productos (vendedor_id, nombre, descripcion, precio, stock, imagen)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
        insProd.run(
            vendedor.id,
            'Kit Bartender Profecional Acero',
            'Cacerola 750ml + Jigger medidor + Cuchara trenzada + Colador.',
            45000,
            10,
            'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600'
        );

        insProd.run(
            vendedor.id,
            'Botella Gin Artesanal Botánico 750ml',
            'Destilado triple en alambique de cobre con bayas de enebro y cítricos.',
            28000,
            15,
            'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=600'
        );
    }
    console.log('✅ Marketplace inicializado en ecommerce_proyecto3.db');

}


// 4. Middleware JWT para identificar al Usuario conectado

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Debés iniciar sesión para realizar esta acción.' });

    }
    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión.' });

    }
}


// 5. Ruta Principal (Frontend del Marketplace)