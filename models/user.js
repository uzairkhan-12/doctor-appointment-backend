const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userType:{
        type:String,
        required:true
    },
    specialization:{
        type:String
    },
    resetToken:String,
    expireToken:Date
})

mongoose.model("User",userSchema)