// =============================================================
//      APP 24: AUTENTICACIÓN CON JWT (JSON WEB TOKENS) Y ROLES
// =============================================================

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());// Para leer JSON en req.body

const PUERTO = process.env.PUERTO || 3001
const JWT_SECRET = process.env.JWT_SECRET;

// Para leer JSON en req.body

const usuariosDB = [];


// =============================================================
// 1. RUTA DE REGISTRO: POST /register
// =============================================================

app.post('/register', async (req, res) => {
    const { nombre, password, rol } = req.body;

    if (!nombre || !password) {
        return res.status(400).json({ error: "Faltan datos (nombre y password)." });
    }

    // Verificamos si ya existe
    const existe = usuariosDB.find(u => u.nombre === nombre);
    if (existe) {
        return res.status(400).json({ error: "Este usuario ya esta registrado." });

    }
    // Encriptamos la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
        id: usuariosDB.length + 1,
        nombre: nombre,
        rol: rol || "cliente", // Si no manda rol, por defecto es "cliente"
        passwordHash: passwordHash
    };

    usuariosDB.push(nuevoUsuario);

    res.status(201).json({
        mensaje: `✅ Usuario '${nombre}' registrado con éxito.`,
        usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol }

    });



});


// =============================================================
// 2. RUTA DE LOGIN: POST /login (Entrega la Pulsera VIP - JWT)
// =============================================================

app.post('/login', async (req, res) => {
    const { nombre, password } = req.body;

    // A) Buscamos al usuario
    const usuario = usuariosDB.find(u => u.nombre === nombre);
    if (!usuario) {
        return res.status(401).json({ error: "❌ Usuario o contraseña incorrectos." });
    }

    // B) Comparamos la contraseña con el Hash
    const coincide = await bcrypt.compare(password, usuario.passwordHash);
    if (!coincide) {
        return res.status(401).json({ error: "❌ Usuario o contraseña incorrectos." })

    }

    // C) 🎟️ FABRICAMOS EL TOKEN JWT (La Pulsera VIP firmada)
    const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
        mensaje: `🔓 ¡Bienvenido/a ${usuario.nombre}! Acá tenés tu Token VIP:`,
        token: token
    });

});

// =============================================================
// 3. MIDDLEWARE PATOVICA 1: VERIFICAR PULSERA VIP (JWT)
// =============================================================

function verificarToken(req, res, next) {
    // Leemos el token del header 'authorization'
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "🚫 Alto ahí: No trajiste tu Token VIP." });

    }

    try {
        // Verificamos que la firma sea auténtica y no haya expirado
        const datosDecodificados = jwt.verify(token, JWT_SECRET);

        // Guardamos los datos del usuario (id, nombre, rol) dentro de 'req'
        req.usuario = datosDecodificados;
        next(); // ¡Pasa!
    } catch (error) {
        return res.status(403).json({ error: "🚨 Token inválido, adulterado o vencido." });

    }
}


// =============================================================
// 4. MIDDLEWARE PATOVICA 2: CONTROL DE ROLES (RBAC - SOLO ADMIN)
// =============================================================

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({
            error: `⛔ Acceso denegado para '${req.usuario.nombre}': Se requiere rol ADMIN y tu rol es '${req.usuario.rol}'.`
        });
    }
    next();// ¡Es Admin, adelante!

}

// =============================================================
// 5. RUTAS PROTEGIDAS DEL BAR
// =============================================================

// Ruta A: Pueden entrar Clientes y Admins (solo pide tener Token válido)

app.get('/barra', verificarToken, (req, res) => {
    res.json({
        mensaje: `🍺 ¡Adelante a la barra, ${req.usuario.nombre}!`,
        tusDatosDelToken: req.usuario
    });
});


// Ruta B: Solo puede entrar el ADMIN (pasa por los 2 Patovicas en fila)

app.get('/caja-fuerte', verificarToken, soloAdmin, (req, res) => {
    res.json({
        mensaje: `💰 Bienvenido Jefe ${req.usuario.nombre}. La recaudación secreta del Bar es $500.000.`
    });
});

//app.listen(PUERTO, () => {
//  console.log(`🛡️ Servidor JWT del Bar escuchando en http://localhost:${PUERTO}`);
//});

app.listen(PUERTO, async () => {
    console.log(`🛡️ Servidor JWT del Bar escuchando en http://localhost:${PUERTO}\n`);
    const URL = `http://localhost:${PUERTO}`;
    // 1. Registramos a Catalina (cliente) y a Tomás (admin)
    await fetch(`${URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: "Catalina", password: "123", rol: "cliente" })
    });
    await fetch(`${URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: "Tomás", password: "admin", rol: "admin" })
    });
    // 2. Login de Catalina y Tomás para obtener sus Pulseras VIP (Tokens)
    const loginCata = await (await fetch(`${URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: "Catalina", password: "123" })
    })).json();
    console.log("🎟️ Token de Catalina:", loginCata.token.slice(0, 30) + "...");
    const loginTomas = await (await fetch(`${URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: "Tomás", password: "admin" })
    })).json();
    console.log("🎟️ Token de Tomás:   ", loginTomas.token.slice(0, 30) + "...\n");
    // 3. Catalina intenta entrar a /caja-fuerte (Debería rebotar por rol 'cliente')
    const intentoCata = await (await fetch(`${URL}/caja-fuerte`, {
        headers: { 'authorization': loginCata.token }
    })).json();
    console.log("🕵️ Catalina en /caja-fuerte ->", intentoCata);
    // 4. Tomás entra a /caja-fuerte (Debería pasar por rol 'admin')
    const intentoTomas = await (await fetch(`${URL}/caja-fuerte`, {
        headers: { 'authorization': loginTomas.token }
    })).json();
    console.log("👑 Tomás en /caja-fuerte    ->", intentoTomas);
});