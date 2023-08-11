//const router = require("express").Router();

//para hacer uso del esquema del usuario
const User = require("../models/userModel");

const userGet = (req, res) => {
  return User.find((error, users) => {
    if(error) {
      console.log('there was an error', error);
    }
    return users;
  }).populate('user').exec();
};

module.exports = {
  userGet
}

//module.exports = router;
