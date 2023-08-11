//const router = require("express").Router();

//para hacer uso del esquema del usuario
const Prompt = require("../models/promptModel");

// const promptGet = (req, res) => {
//   return Prompt.find((error, prompts) => {
//     if(error) {
//       console.log('there was an error', error);
//     }
//     console.log(prompts)
//     return prompts;
//   });
// };

const promptGet = async (req, res) => {
  try {
    const prompts = await Prompt.find();
    return prompts;
  } catch (error) {
    console.error('There was an error:', error);
    throw error; // Puedes lanzar el error para que sea manejado en el nivel superior
  }
};

module.exports = {
  promptGet
}
//module.exports = router;

