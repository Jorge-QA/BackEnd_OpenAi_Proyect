const { Configuration, OpenAIApi } = require("openai");

const router = require("express").Router(); //adicional

// Configura la API key de OpenAI usando la clave almacenada en la variable de entorno OPENAI_KEY
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

// Ruta para la solicitud de completion
router.post("/completion", async (req, res) => {
  // Verificar que se reciban los parámetros necesarios desde el cliente
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({
      message: "Debe proporcionar el modelo y el input para la solicitud.",
    });
  }

  // Crear una instancia de OpenAIApi
  const openai = new OpenAIApi(configuration);

  try {
    // Realizar la solicitud de completion
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: input,
      max_tokens: 50,
    });

    // Enviar la respuesta del API de OpenAI al cliente
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al procesar la solicitud de Open AI.",
    });
  }
});

//  Ejecuta la solicitud de edición de texto (createEdit) a través de la API de OpenAI.
router.post("/edit", async (req, res) => {
  // Verificar que se reciban los parámetros necesarios desde el cliente
  const {input} = req.body;
  if (!input) {
    return res.status(400).json({
      message: "Debe proporcionar el prompt para la solicitud de edición.",
    });
  }

  // Crear una instancia de OpenAIApi
  const openai = new OpenAIApi(configuration);

  try {
    // Realizar la solicitud de edición (edit)
    const response = await openai.createEdit({
      model: "text-davinci-edit-001",
      input: input,
      instruction: "Fix the spelling mistakes and grammar"//
      
    });

    // Enviar la respuesta del API de OpenAI al cliente
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al procesar la solicitud de edición (edit) en Open AI.",
    });
  }
});



/**
 * Crea una imagen mediante la API de OpenAI.
 *
 * @param {*} req - Objeto de solicitud de Express.
 * @param {*} res - Objeto de respuesta de Express.
 */
router.post("/image", async (req, res) => {
  const { OpenAIApi } = require("openai");
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: req.body.input,
    n: parseInt(req.body.n),
    size: req.body.size,
  });

  if (response) {
    res.status(201); // CREATED
    res.json(response.data);
  } else {
    res.status(422);
    res.json({
      message: "Hubo un error al ejecutar el método de Open AI",
    });
  }
});

module.exports = router;

