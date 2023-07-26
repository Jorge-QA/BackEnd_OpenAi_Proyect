const router = require("express").Router();

//para hacer uso del esquema del usuario
//const User = require("../models/userModel");

//para hacer uso del esquema del prompt
const Prompt = require("../models/promptModel");

// esquema para validar prompt
const Joi = require("@hapi/joi");

const schemaPrompt = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  type: Joi.string().min(2).max(255).required(), //edit/image/completion
  tags: Joi.string().min(2).max(255).required(),
  input: Joi.string().min(2).max(255).required(),
  user: Joi.string().min(2).max(255),
});

//Guardar un prompt
router.post("/prompts", async (req, res) => {
  // //validaciones de prompt(esquema)  me estaba dando error, igual el ingreso de datos está validado desde el front
  // const { error } = schemaPrompt.validate(req.body); //
  // if (error) {
  //   return res.status(400).json({
  //     error: true,
  //     mensaje:
  //       "Valide los datos ingresados mayores a 2 caracteres y al menos una etiqueta",
  //   });
  // }

  const prompt = new Prompt({
    name: req.body.name,
    type: req.body.type,
    n: req.body.n,
    size: req.body.size,
    tags: req.body.tags,
    input: req.body.input,
    user: req.body.user,
  });

  try {
    const promptDB = await prompt.save();
    res.json({
      data: promptDB,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// obtener info de prompts por usuario
router.get("/prompts", (req, res) => {
  if (req.query && req.query.user) {
    Prompt.find({ user: req.query.user }) // Filtrar por el usuario específico
      .then((prompts) => {
        res.json(prompts);
      })
      .catch((err) => {
        res.status(404);
        console.log("Error al consultar los prompts del usuario", err);
        res.json({ error: "El prompt no existe" });
      });
  } else {
    // get all prompts
    Prompt.find()
      .then((prompts) => {
        res.json(prompts);
      })
      .catch((err) => {
        res.status(422);
        res.json({ error: err });
      });
  }
});


//actualizar prompt
router.patch("/prompts", (req, res) => {
  // get prompt by id
  if (req.query && req.query.id) {
    Prompt.findById(req.query.id)
      .then((prompt) => {
        if (!prompt) {
          res.status(404);
          console.log("error while querying the prompt");
          res.json({ error: "Prompt doesn't exist" });
          return;
        }

        // update the prompt object (patch) || sirve para que le de el mismo valor si el nuevo viene vacío
        prompt.name = req.body.name || prompt.name;
        prompt.type = req.body.type || prompt.type;
        prompt.n = req.body.n || prompt.n;
        prompt.size = req.body.size || prompt.size;
        prompt.tags = req.body.tags || prompt.tags;
        prompt.input = req.body.input || prompt.input;
        prompt.response = req.body.response || prompt.response;

        prompt
          .save()
          .then((updatedPrompt) => {
            res.status(200).json(updatedPrompt);
          })
          .catch((error) => {
            res.status(422);
            console.log("error while saving the prompt", error);
            res.json({
              error: "There was an error saving the prompt",
            });
          });
      })
      .catch((error) => {
        res.status(404);
        console.log("error while querying the prompt", error);
        res.json({ error: "Prompt doesn't exist" });
      });
  } else {
    res.status(404);
    res.json({ error: "Prompt doesn't exist" });
  }
});

//elimina un prompt
router.delete("/prompts", (req, res) => {
  // get prompt by id
  if (req.query && req.query.id) {
    Prompt.findByIdAndDelete(req.query.id)
      .exec()
      .then((prompt) => {
        if (!prompt) {
          res.status(404).json({ error: "Prompt no encontrado" });
        } else {
          res.status(204).json({});
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Error eliminando el prompt" });
      });
  } else {
    res.status(400).json({ error: "No se encontró el id de prompt" });
  }
});

module.exports = router;
