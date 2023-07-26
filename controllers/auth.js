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
  first_name: Joi.string().min(4).max(255).required(),
  last_name: Joi.string().min(4).max(255).required(),
  email: Joi.string().min(4).max(255).required().email(),
  password: Joi.string().min(4).max(1024).required(),
  rol: Joi.string().min(4).max(255).required(),
  state: Joi.string().min(4).max(255).required(),
});

//esquema para validar login
const schemaLogin = Joi.object({
  email: Joi.string().min(4).max(255).required().email(),
  password: Joi.string().min(4).max(1024).required(),
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
      state: user.state
    },
    process.env.TOKEN_SECRET
  );
    // se devuelve el token en el header
  res.header("auth-token", token).json({
    error: null,
    data: { token }
  })
})

router.post("/register", async (req, res) => {
  //validaciones de usuario(esquema)
  const { error } = schemaRegister.validate(req.body); //
  if (error) {
    return res.status(400).json({ error: true, mensaje: "Valide los datos ingresados mayores a 4 caracteres y formato de correo válido" });
  }

  //valida si el correo ya está registrado
  const existeEmail = await User.findOne({ email: req.body.email });
  if (existeEmail) {
    return res
      .status(400)
      .json({ error: true, mensaje: "Email ya registrado" });
  }

  //encriptar contraseña
  const saltos = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, saltos);

  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: password,
    rol: req.body.rol,
    state: req.body.state
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

//Sirve para hacer archivos aparte
module.exports = router;
