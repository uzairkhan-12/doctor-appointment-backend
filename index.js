let express = require('express')
let cors = require('cors')
let app = express()
app.use(cors())
const mongoose = require('mongoose')
const PORT = 5000
const {MONGOURI} = require('./keys')

require('./models/user')//we cannot store it in a variable because we cannot export from model i.e export.model etc
require('./models/appointments')
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/appointments'))
mongoose.connect(MONGOURI)
mongoose.connection.on('connected',()=>{
    console.log("mongodb is connected")
})
mongoose.connection.on('error',(err)=>{
    console.log("error :",err)
})

app.listen(PORT , ()=>{
    console.log('server is running on port 5000')
})