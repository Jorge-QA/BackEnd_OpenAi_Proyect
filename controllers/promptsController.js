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

const promptsByName = async ({ user, name }) => {
  try {
    const prompts = await Prompt.find({
      user: user,
      //$regex se utiliza para realizar una búsqueda basada en una expresión regular.
      //$options para que la busqueda no sea case-sensitive
      name: { $regex: name, $options: "i" },
    });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar el prompt por nombre");
  }
};

const promptsByTags = async ({ user, tags }) => {
  try {
    //El operador $in se utiliza para buscar documentos donde el valor del campo tags esté presente en una lista de valores proporcionados
    const prompts = await Prompt.find({ user: user, tags: { $in: tags.map(tag => new RegExp(tag, 'i')) } });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar el prompt por tags");
  }
};

const userPrompt = async ({user}) => {
  try {
    const prompts = await Prompt.find({ user: user });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar los prompts del usuario");
  }
};

module.exports = {
  promptGet, promptsByTags, promptsByName, userPrompt
}
//module.exports = router;

