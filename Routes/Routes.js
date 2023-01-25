const express = require('express');
const Router = express.Router()
const {AddUser,LoginUser,changepassword,UserData,ResetEmailPassword ,EmailVarification} = require("../Controllers/userController")
const AuthorisedUser = require("../Middleware/AuthUser")


Router.use("/changepassword",AuthorisedUser)
Router.use("/userprofile",AuthorisedUser)

// This are my normal routers or public requests
Router.post("/registration",AddUser)
Router.post("/login",LoginUser)
Router.post("/resetpasswordlink",ResetEmailPassword)
Router.post("/resetpassword/:id/:token",EmailVarification)

// This are my protected routers using middleware
Router.post("/changepassword",changepassword)
Router.get("/userprofile",UserData)



module.exports = Router