//Para el uso de envío de correos
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.TWILIO_KEY);

//Para hacer nuestra ruta en un archivo separado
const router = require("express").Router();

//Para usar la encriptación
const bcrypt = require("bcrypt");

//para hacer uso del esquema del usuario
const User = require("../models/userModel");

//para utilizar la dependencia jwt.
const jwt = require("jsonwebtoken");

// esquema para validar registro
const Joi = require("@hapi/joi");

const schemaRegister = Joi.object({
  first_name: Joi.string().min(3).max(255).required(),
  last_name: Joi.string().min(3).max(255).required(),
  email: Joi.string().min(4).max(255).required().email(),
  phone: Joi.string().min(4).max(255).required(),
  password: Joi.string().max(1024).required(),
  rol: Joi.string().min(4).max(255).required(),
  state: Joi.string().min(4).max(255).required(),
  tfa: Joi.bool().required(), // para la autenticación de 2 factores
});

//esquema para validar login
const schemaLogin = Joi.object({
  email: Joi.string().min(4).max(255).required().email(),
  password: Joi.string().max(1024).required(),
});

router.post("/login", async (req, res) => {
  // validaciones
  const { error } = schemaLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .json({ error: true, mensaje: "Usuario no registrado" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .json({ error: true, mensaje: "contraseña inválida" });

  //acá creamos el token
  const token = jwt.sign(
    {
      name: user.first_name,
      id: user._id,
      rol: user.rol,
      state: user.state,
      tfa: user.tfa,
    },
    process.env.TOKEN_SECRET
  );
  // se devuelve el token en el header
  res.header("auth-token", token).json({
    error: null,
    data: { token },
  });
});

router.post("/register", async (req, res) => {
  //validaciones de usuario(esquema)
  const { error } = schemaRegister.validate(req.body); //
  if (error) {
    return res
      .status(400)
      .json({
        error: true,
        mensaje:
          "Valide los datos ingresados mayores a 4 caracteres y formato de correo válido",
      });
  }

  //valida si el correo ya está registrado
  const existeEmail = await User.findOne({ email: req.body.email });
  if (existeEmail) {
    return res
      .status(400)
      .json({ error: true, mensaje: "Email ya registrado" });
  }
  //para trabajar con el link sin mandar correo
  console.log("http://127.0.0.1:5500/client/autenticacion.html")

  //encriptar contraseña
  const saltos = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, saltos);

  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    password: password,
    rol: req.body.rol,
    state: req.body.state,
    tfa: req.body.tfa,
  });

  try {
    const userDB = await user.save();
    res.json({
      data: userDB,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});



// Configuración del envío del correo

function enviarCorreoAuth(
  destinatario,
  nombreUsuario,
  link
) {
  // Contenido del correo
  const asunto = "Autenticación de usuario APP Open AI";
  const mensaje =
    `Hola ${nombreUsuario},\n\n` + "Gracias por registrarte, solo falta un paso más, ingresa al link para autentificar tu correo\n\n" +
    `Tu link de autenticación es: ${link}\n\n` +
    "¡Gracias por utilizar nuestra app!";

  const correo = {
    to: destinatario,
    from: {
      name: "Open AI APP",
      email: "quesadaartaviajorge@gmail.com", // correo registrado en twilio
    },
    subject: asunto,
    text: mensaje,
  };

  // Enviar el correo
  sgMail
    .send(correo)
    .then(() => {
      console.log("Correo enviado con éxito");
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error);
    });
}

// Uso de la función para enviar el correo de autenticación
// const correoDestino = 'jorge.q.a@hotmail.com'; // Cambiar por el correo del destinatario
// const nombreUsuario = 'Jorge Quesada'; // Cambiar por el nombre del usuario
// const link = 'http://127.0.0.1:5500/client/autenticacion.html'; // link para autenticar
// enviarCorreoAuth(correoDestino, nombreUsuario, link);

//Sirve para hacer archivos aparte
module.exports = router;
