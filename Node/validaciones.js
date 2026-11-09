// =============================================================
//      ESQUEMAS DE VALIDACIÓN CON ZOD (validaciones.js)
// =============================================================


const { z } = require('zod');

// 1. Esquema para pedidos de tragos en la barra

const pedidoSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 letras.")
        .max(50, "El nombre no puede superar los 50 caracteres."),

    edad: z.number({ invalid_type_error: "La edad debe ser un numero." })
        .int("La edad debe ser un número entero")
        .min(1, "La edad mínima es de 1 año")
        .max(120, "Sos un viejo..."),


    cash: z.number({ invalid_type_error: "El dinero debe ser un número." })
        .positive("El dinero debe ser un monto positivo mayor a $0"),

    trago: z.enum(
        ['fernet', 'birra', 'ginTonic', 'whisky', 'gaseosa', 'agua'],
        { errorMap: () => ({ message: "Trago no disponible, solicita otra bebida si no tomate el palo..." }) }
    )


});


// 2. Middleware reutilizable para validar cualquier esquema

function validar(schema) {
    return (req, res, next) => {
        // safeParse valida sin romper el servidor si hay error
        const resultado = schema.safeParse(req.body);

        if (!resultado.success) {
            // Extraemos todos los mensajes de error legibles
            const errores = resultado.error.issues.map(issue => issue.message);
            return res.status(400).json({
                exito: false,
                mensaje: "❌ Error de validación en los datos enviados.",
                errores: errores
            });

        }
        // Si pasó la validación, dejamos los datos limpios en req.body y avanzamos
        req.body = resultado.data;
        next();
    };
}


module.exports = {
    pedidoSchema,
    validar
};
