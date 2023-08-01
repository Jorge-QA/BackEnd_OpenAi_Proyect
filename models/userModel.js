const mongoose = require('mongoose');
const userSchema = mongoose.Schema;

const user = new userSchema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true  },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: true },// admin or client
    state: { type: String, required: true },// activo o inactivo
    tfa: { type: Boolean, required: true }// activo o inactivo
  });
  
  module.exports = mongoose.model('User', user);


