//Para el uso de envío de correos
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.TWILIO_KEY);
//para el uso de envío de mensajes
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const miPhone = process.env.MI_PHONE;
const client = require("twilio")(accountSid, authToken);
//const verifySid = process.env.TWILIO_VERIFY_SID;

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
      .json({ error: true, mensaje: "Valide sus datos de inicio de sesión" });

  // Genera un número aleatorio entre 0 y 9999
  const randomNumber = Math.floor(Math.random() * 10000);
  const formattedNumber = String(randomNumber).padStart(4, "0");

  //podemos enviar el sms si se tiene activo el tfa y está activo.
  if (user.tfa && user.state === "activo") {
    sendMessage(user.first_name, formattedNumber);
    console.log("Tfa Activa");
  }

  //acá creamos el token
  const token = jwt.sign(
    {
      name: user.first_name,
      id: user._id,
      rol: user.rol,
      state: user.state,
      tfa: user.tfa,
      code: formattedNumber,
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
    return res.status(400).json({
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
    //envío de correo con enlace
    enviarCorreoAuth(userDB.email, userDB.first_name, userDB.id);
  } catch (error) {
    res.status(400).json({ error });
  }
});


// Configuración del envío del correo async
async function enviarCorreoAuth(destinatario, nombreUsuario, id) {
  try {
    // Contenido del correo
    const asunto = "Autenticación de usuario APP Open AI";
    const mensaje =
      `Hola ${nombreUsuario},\n\n` +
      "Gracias por registrarte, solo falta un paso más, ingresa al link para autentificar tu correo\n\n" +
      `Tu link de autenticación es: http://127.0.0.1:5500/client/autenticacion.html?id=${id}\n\n` +
      "¡Gracias por utilizar nuestra app!";

    console.log("http://127.0.0.1:5500/client/autenticacion.html?id=" + id);

    const correo = {
      to: destinatario,
      from: {
        name: "Open AI APP",
        email: "quesadaartaviajorge@gmail.com", // correo registrado en twilio
      },
      subject: asunto,
      text: mensaje,
    };

    // Enviar el correo usando await
    await sgMail.send(correo);
    console.log("Correo enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

//Función async para Envío de sms
async function sendMessage(name, code) {
  try {
    const message = await client.messages.create({
      body: `Hola ${name} tu código es el: ${code}`,
      from: twilioPhone,
      to: miPhone,
    });
    console.log(message.sid);
  } catch (error) {
    console.error(error);
  }
}

// 'prueba:
const name = "Jorginho Quesada"
const code = "1225"
//sendMessage(name, code)

//Sirve para hacer archivos aparte
module.exports = router;
