const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Appointments = mongoose.model('Appointments')
router.post('/book-appointment', requireLogin, (req, res) => {
  const { specialization, doctorId, date, time } = req.body
  if (!specialization || !doctorId || !date || !time) {
    res.status(422).send.json({ error: "please fill the input fields" })
  }

  Appointments.find({ date, time,doctorId })
    .then(result => {
      if(result.length !== 0) {
        console.log(result)
        res.status(422).send("please select another date or time")
      }
      else {
        req.user.password = undefined
        const appointment = new Appointments({
          specialization,
          doctorId,
          date,
          time,
          patientDetail: req.user
        })
        appointment.save()
          .then(result => {
            res.send(result)
          })
      }
    })

    // console.log(user.time)
    // console.log(time)
    // console.log(user.date)
    // console.log(date)
    // console.log(user.doctorId)
    // console.log(doctorId)
  //  if(time === user.time && date === user.date && doctorId === user.doctorId){
  //   res.send('please select another date or time')
  //  }
  //  else{
  //   res.send('else is calling')
    // req.user.password=undefined
    // const appointment = new Appointments({
    //  specialization,
    //  doctorId,
    //  date,
    //  time,
    //  patientDetail:req.user
    // })
    // appointment.save()
    // .then(result => {
    //  res.send(result)
    // })
  //  }
  //  })
  //  console.log(req.user)
  //  req.user.password=undefined
  //  const appointment = new Appointments({
  //   specialization,
  //   doctorId,
  //   date,
  //   time,
  //   patientDetail:req.user
  //  })
  //  appointment.save()
  //  .then(result => {
  //   res.send(result)
  //  })
})

router.get('/get-my-appointments', requireLogin, (req, res) => {
  Appointments.find({ patientDetail: { $in: req.user } })
    .populate("patientDetail")
    .populate("doctorId")

    .then(savedUser => {
      res.send(savedUser)
    })
})

router.get('/get-my-patients', requireLogin, (req, res) => {
  Appointments.find({ doctorId: { $in: req.user } })
    .populate("patientDetail")
    .then(savedUser => {
      res.send(savedUser)
    })
})

router.get('/patient-by-id/:id', (req, res) => {
  Appointments.findOne({ _id: req.params.id })
    .then(savedUser => {
      Appointments.deleteOne()
        .then(result => {
          if (!result) {
            res.send('error')
          }
          else {
            res.send({ result: true })
          }
        })
    })
    .catch(err => {
      res.send(err)
    })

    .catch(err => {
      res.send('patient not found')
    })
})

module.exports = router