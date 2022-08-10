const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const User = mongoose.model("User")
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const {GMAIL_PASS} = require('../keys')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const crypto = require('crypto')
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"pk.uzikhan@gmail.com",
        pass:GMAIL_PASS
    }
})
router.post('/sign-up', (req, res) => {
    let { name, email, password, userType,specialization } = req.body
    if (!name || !email || !password) {
        return res.status(422).send({ error: "Oops! Please Enter the data first" })
    }
    User.findOne({ email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).send({ error: "User already exist" })
            }
            bcrypt.hash(password, 12,)
                .then(hashedPassword => {
                    const user = new User({
                        name,
                        email,
                        password: hashedPassword,
                        userType,
                        specialization
                    })
                    user.save()
                    .then(user => {
                        transporter.sendMail({
                            to:user.email,
                            from:"no-reply@insta.com",
                            subject:"Signed up succeeded",
                            html:"<h3>Welcome to Doctor Appointment System by uzair</h3><br /><br /><p>Best Regards</p><br /><p>Developer Uzair and Hospital Team</p>",
                        }).then(response => {
                            // console.log(response)
                        })
                        .catch(err => {
                            console.log('error',err)
                        })
               
            res.send("User created Successfully!")
        })
        .catch(err => {
            console.log("User creation failed", err)
        })
    })
})
})

router.post('/sign-in',(req,res) => {
    const {email , password} = req.body
    if(!email || !password){
        return res.status(422).send("please enter email and password")
    }
    User.findOne({email})
    .then((savedUser) => {
       if(savedUser == null){
        return res.status(422).send("User does not exist")
       }
       bcrypt.compare(password,savedUser.password)
       .then(isMatch => {
        if(isMatch){
          const token = jwt.sign({_id : savedUser._id} , JWT_SECRET)
          const {_id , name , email , userType } = savedUser
                res.send({token, user:{_id , name , email , userType}})
        }
        else{
           return res.status(422).send("Invalid Password")
        }
       })
    })
    .catch(err => console.log({error : err}))
})


router.get('/get-doctors' , (req,res) => {
User.find({userType:"doctor"})
.select('name')
.then(r=>{
    res.json(r)
})



})
router.post('/doctors' , (req,res) =>{
    const { specialization } = req.body
     User.find({userType:"doctor" , specialization})
     .select('name')
    .then(savedUser => {
        res.send(savedUser)
    })
    .catch(err => {
        res.send("user not found")
    })
})


router.post('/reset-password',(req,res) => {
    crypto.randomBytes(32,(err , buffer) => {
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")

        User.findOne({email:req.body.email})
        .then(user => {
            console.log(user)
            if(!user){
                return res.status(422).json({error : "User dont exist with given email"})
            }
            user.resetToken= token
            user.expireToken= Date.now() + 3600000
            user.save()
            .then((result) => {
                transporter.sendMail({
                    to:user.email,
                    from:"noreply@insta.com",
                    subject:"Reset password by Insta by Uzair",
                    html:`
                    <P>You requested for password reset</p>
                    <h5>click in this <a href="http:localhost:5000/reset-password/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message : "Check your Gmail "})
            })
        })
    })
})

router.post('/new-password',(req,res) => {
    console.log('api hitted')
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user => {
        if(!user){
            return res.statusCode(422).json({error : "Try again session expired!"})
        }
        bcrypt.hash(newPassword,12).then(hashedPassword=>{
            user.password = hashedPassword
            user.resetToken=undefined
            user.expireToken=undefined
            user.save().then((savedUser)=> {
                res.json({message:"password updated success"})
            })
        })
    }).catch(err=>{
        console.log(err)
    })
})


module.exports = router