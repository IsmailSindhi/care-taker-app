const mongoose = require('mongoose');

let userSchema = mongoose.Schema({

    name: {type: String},
    phoneNumber : {type: Number},
    email: {type: String, unique:true},
    password: {type: String}
})


module.exports = mongoose.model('User',userSchema);