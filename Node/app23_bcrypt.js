// =============================================================
//      APP 23: SEGURIDAD Y HASHING DE CONTRASEÑAS CON BCRYPT
// =============================================================

const bcrypt = require('bcrypt');

// Simulamos nuestra tabla de Usuarios en la Base de Datos

const usuariosDB = [];

// 1. FUNCIÓN PARA REGISTRAR UN USUARIO DE FORMA SEGURA
async function registrarUsuario(nombre, passwordPlana, rol) {
    console.log(`\n Registrando a '${nombre}' (${rol})...`);

    // Cost Factor (Rondas de Sal): 10 es el estándar profesional
    const saltRounds = 10

    // Encriptamos la contraseña (NUNCA guardamos passwordPlana)

    const passwordHash = await bcrypt.hash(passwordPlana, saltRounds);

    const nuevoUsuario = {
        id: usuariosDB.length + 1,
        nombre: nombre,
        rol: rol,
        passwordHash: passwordHash

    };

    usuariosDB.push(nuevoUsuario);
    console.log(`   🔸 Clave original escrita: "${passwordPlana}"`);
    console.log(`   🛡️ Hash guardado en BD: "${passwordHash}"`);



}

// 3. FUNCIÓN PARA VALIDAR EL LOGIN (BCRYPT COMPARE)

async function iniciarSesion(nombre, passwordIngresada) {
    console.log(`\n🚪 Intento de Login: '${nombre}' ingresó la clave "${passwordIngresada}"...`);

    // A) Buscamos si el usuario existe en nuestra BD
    const usuario = usuariosDB.find(u => u.nombre === nombre);

    if (!usuario) {
        console.log(`   ❌ Acceso denegado: El usuario '${nombre}' no está registrado.`);
        return;
    }

    // B) Comparamos la clave escrita contra el Hash guardado
    const coincide = await bcrypt.compare(passwordIngresada, usuario.passwordHash);

    if (coincide) {
        console.log(`   ✅ ¡Bienvenido/a ${usuario.nombre}! Acceso concedido con rol:
            [${usuario.rol.toUpperCase()}]`);

    } else {
        console.log(`   🚨 ¡Alerta Patovica! Contraseña incorrecta para '${nombre}'.`);

    }

}





async function main() {
    console.log("========================================================");
    console.log("🛡️ SISTEMA DE SEGURIDAD DEL BAR - BCRYPT HASHING");
    console.log("========================================================");

    // 2. REGISTRAMOS USUARIOS (Fijate qué pasa si dos usan la misma clave)
    await registrarUsuario("Tomás", "adminFernet2026", "admin");
    await registrarUsuario("Catalina", "123456", "cliente");
    await registrarUsuario("El Neuen", "123456", "cliente"); // ¡Misma clave que Catalina!

    console.log("\n📋 TABLA DE USUARIOS GUARDADA EN LA BASE DE DATOS:");
    console.table(usuariosDB);

    // 4. SIMULAMOS INTENTOS DE LOGIN EN LA PUERTA DEL BAR
    console.log("\n========================================================");
    console.log("🕵️ PRUEBAS DE LOGIN CON BCRYPT.COMPARE()");
    console.log("========================================================");
    await iniciarSesion("Tomás", "adminFernet2026");   // ✅ Clave correcta (Admin)
    await iniciarSesion("Catalina", "123456");         // ✅ Clave correcta (Cliente)
    await iniciarSesion("Tomás", "claveFalsa999");     // 🚨 Clave incorrecta (Intruso)
    await iniciarSesion("Fantasma", "123456");         // ❌ Usuario no existe

}

main()