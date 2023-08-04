const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Agrega esta línea para cargar las variables de entorno
dotenv.config(); // Carga las variables de entorno del archivo .env

// database connection
const db = mongoose.connect(process.env.DB_Connection, {
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
const prompts =require("./controllers/prompt");
const openAi =require("./controllers/openAiController");
const autentication =require("./controllers/admin");


// route middlewares para validaciónes
//ruta de validacciones de login y registro de usuario
app.use('/api/session',authRoutes)
// se ejecuta la validación antes de pasar a las rutas...
////ruta de obtención y mandejo de información de usuarios
app.use('/api/admin',validateToken, admin) 
////ruta de obtención y mandejo de información de prompts
app.use('/api/handle',validateToken, prompts)
////ruta de api OpenAi
app.use('/api/openAi',validateToken, openAi)
//para la autenticación por correo
app.use('/api/email',autentication) 


// iniciar server
app.listen(3001, () => console.log(`Servidor corriendo en puerto: 3001!`))