const router = require("express").Router();
//Para usar la encriptación
const bcrypt = require("bcrypt");

//para hacer uso del esquema del usuario
const User = require("../models/userModel");

//para utilizar la dependencia jwt.
const jwt = require("jsonwebtoken");

router.get("/users", (req, res) => {
  // if an specific user is required
  if (req.query && req.query.first_name) {
    // if (req.query && req.query.id) {  (traerlo por nombre)
    User.findOne({ first_name: req.query.first_name }) //
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        res.status(404);
        console.log("error while queryting the user", err);
        res.json({ error: "User doesnt exist" });
      });
  } else if (req.query && req.query.id) {
    // if (req.query && req.query.id) {  (traerlo por id)
    User.findById({ _id: req.query.id }) //
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        res.status(404);
        console.log("error while queryting the user", err);
        res.json({ error: "User doesnt exist" });
      });
  } else if (req.query.sort === "asc") {
    User.find({ rol: "client" }) // fitra solo clientes
      .then((users) => {
        users = users.sort((a, b) => a.first_name.localeCompare(b.first_name));
        res.json(users);
      })
      .catch((err) => {
        res.status(422);
        res.json({ error: err });
      });
  } else if (req.query.sort === "desc") {
    User.find()
      .then((users) => {
        users = users.sort((a, b) => b.first_name.localeCompare(a.first_name));
        res.json(users);
      })
      .catch((err) => {
        res.status(422);
        res.json({ error: err });
      });
  } else {
    // get all users
    User.find()
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        res.status(422);
        res.json({ error: err });
      });
  }
});

router.patch("/users", async (req, res) => {
  if (req.query && req.query.id) {
    try {
      const user = await User.findById(req.query.id);

      if (!user) {
        res.status(404).json({ error: "User doesn't exist" });
        return;
      }

      const saltos = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, saltos);

      // update the user object (patch)
      //el operador de fusión nula (??) se utiliza para establecer un valor predeterminado solo cuando el valor de la izquierda es null o undefined
      user.first_name = req.body.first_name ?? user.first_name;
      user.last_name = req.body.last_name ?? user.last_name;
      user.email = req.body.email ?? user.email;
      user.phone = req.body.phone ?? user.phone;
      user.state = req.body.state ?? user.state; // solo el admin puede controlarlo
      user.password = password ?? user.password;
      //verifica si el objeto req.body tiene una propiedad llamada 'tfa'
      user.tfa = req.body.hasOwnProperty("tfa") ? req.body.tfa : user.tfa;

      const updatedUser = await user.save();
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(422).json({ error: "There was an error saving the user" });
    }
  } else {
    res.status(404).json({ error: "User doesn't exist" });
  }
});

//elimina un usuario
router.delete("/users", (req, res) => {
  // get user by id
  if (req.query && req.query.id) {
    User.findByIdAndDelete(req.query.id)
      .exec()
      .then((user) => {
        if (!user) {
          res.status(404).json({ error: "Usuario no encontrado" });
        } else {
          res.status(204).json({});
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Error eliminando el usuario" });
      });
  } else {
    res.status(400).json({ error: "No se encontró el id de usuario" });
  }
});

module.exports = router;
