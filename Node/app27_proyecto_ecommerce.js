require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');

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
