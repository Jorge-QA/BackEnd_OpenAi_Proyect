const express = require('express');
const mongoose = require('mongoose');

// database connection
const db = mongoose.connect("mongodb://127.0.0.1:27017/proyect", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const bodyparser = require('body-parser');
require('dotenv').config()// para las variables de entorno...

const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// check for cors
const cors = require("cors");
app.use(cors({
  domains: '*',
  methods: "*"
}));

// importar rutas
const authRoutes = require("./controllers/auth");
const validateToken = require("./controllers/validateToken");
const admin = require("./controllers/admin");
const prompts =require("./controllers/prompt")
const openAi =require("./controllers/openAiController")

// route middlewares para validaciónes
//ruta de validacciones de login y registro de usuario
app.use('/api/session',authRoutes)
// se ejecuta la validación antes de pasar a las rutas...
////ruta de obtención y mandejo de información de usuarios
app.use('/api/admin',validateToken, admin) //
////ruta de obtención y mandejo de información de prompts
app.use('/api/handle',validateToken, prompts)
////ruta de api OpenAi
app.use('/api/openAi',validateToken, openAi)


// iniciar server
app.listen(3001, () => console.log(`Servidor corriendo en puerto: 3001!`))