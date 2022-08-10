const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const appointmentSchema = new mongoose.Schema({
    specialization:{
        type:String,
        required:true
    },
    doctorId:{
        type:ObjectId,
        ref:"User"
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    patientDetail:{
        type:ObjectId,
        ref:"User"
    }
})

mongoose.model("Appointments",appointmentSchema)