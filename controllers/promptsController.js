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
      name: { $regex: name, $options: "i" },
    });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar el promt por nombre");
  }
};

const promptsByTags = async ({ user, tags }) => {
  try {
    const prompts = await Prompt.find({ user: user, tags: { $in: tags } });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar el promt por tags");
  }
};

const userPrompt = async ({user}) => {
  try {
    const prompts = await Prompt.find({ user: user });
    return prompts;
  } catch (err) {
    throw new Error("Hubo un error al buscar los promts del usuario");
  }
};

module.exports = {
  promptGet, promptsByTags, promptsByName, userPrompt
}
//module.exports = router;

