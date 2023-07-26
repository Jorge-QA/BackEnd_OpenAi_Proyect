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
  } else if (req.query.sort === "asc") {
    User.find({rol : "client"})// fitra solo clientes
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
    // get all courses
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

router.patch("/users", (req, res) => {
  // get user by id
  if (req.query && req.query.id) {
    User.findById(req.query.id)
      .then((user) => {
        if (!user) {
          res.status(404);
          console.log("error while querying the user");
          res.json({ error: "User doesn't exist" });
          return;
        }

        // update the user object (patch)
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.email = req.body.email || user.email;
        user.state = req.body.state || user.state;

        user
          .save()
          .then((updatedUser) => {
            res.status(200).json(updatedUser);
          })
          .catch((error) => {
            res.status(422);
            console.log("error while saving the user", error);
            res.json({
              error: "There was an error saving the user",
            });
          });
      })
      .catch((error) => {
        res.status(404);
        console.log("error while querying the user", error);
        res.json({ error: "User doesn't exist" });
      });
  } else {
    res.status(404);
    res.json({ error: "User doesn't exist" });
  }
});

//elimina un curso
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
