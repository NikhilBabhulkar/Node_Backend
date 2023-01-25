const User = require('../Models/Userschema')
const bcryptjs = require("bcrypt")
const jwt = require("jsonwebtoken")
const EmailConfig = require("../Config/Emailcongi")


const AddUser = async (req, res) => {
    try {

        const { name, email, password, image, mobile } = req.body;

        const user = await User.findOne({ email: email });
        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)
        if (user) {
            res.send({ "status": "failed", "msg": "Email Already exist" })
        } else {

            if (name && email && password && mobile && image) {
                const U1 = new User({
                    name: name,
                    email: email,
                    password: hashPassword,
                    image: image,
                    mobile: mobile
                })

                await U1.save()
                // Generating jsonwebtokon 
                const savedUser = await User.findOne({ email: email })
                const token = jwt.sign({ userID: savedUser._id }, process.env.SECREAT_KEY, { expiresIn: '5d' })

                res.send({ "status": "success", "msg": "User Created", "Token": token })

            }
        }

    } catch (err) {
        console.log(err)
    }
}

// login functionality for user

const LoginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (email && password) {
            const user = await User.findOne({ email: email });
            if (user) {

                const isright = await bcryptjs.compare(password, user.password)

                if (isright && email == user.email) {
                    // Generating user tokens
                    const token = jwt.sign({ userID: user._id }, process.env.SECREAT_KEY, { expiresIn: '5d' })
                    res.send({ "status": "success", "msg": "user login success", "token": token })
                } else {
                    res.send({ "status": "failed", "msg": "wrong credentials" })
                }
            } else {
                res.send({ "status": "failed", "msg": "wrong credentials" })
            }
        } else {
            res.send({ "status": "failed", "msg": "wrong credentials" })
        }

    } catch (error) {
        console.log("error occure")
        res.send({ "status": "failed", "msg": "err occure" })
    }

}

// If user is locked in and now want to change the password

const changepassword = async (req, res) => {

    const { password, password_confirmation } = req.body
    if (password && password_confirmation) {
        if (password !== password_confirmation) {
            res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else {
            const salt = await bcryptjs.genSalt(10)
            const newHashPassword = await bcryptjs.hash(password, salt)
            await User.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
            res.send({ "status": "success", "message": "Password changed succesfully" })
        }
    } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
    }

}

// For Getting the user data 
const UserData = async (req, res) => {
    res.send({ "user": req.user })
}

// Function for sending the link to email if the user forget the email

const ResetEmailPassword = async (req, res) => {
    const { email } = req.body;

    if (email) {
        const user = await User.findOne({ email: email });

        if (user) {

            const secret = user._id + process.env.SECREAT_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)
            // Email sending code touser 
            console.log(user.email)
            let info = await EmailConfig.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Rider  - Password Reset Link",
                html: `<a href=${link}>Click Here</a> to Reset Your Password`
            })
            console.log(info)
            res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })

        } else {
            res.send({ "status": "failed", "message": "Email doesn't exists" })
        }
    } else {
        res.send({ "status": "failed", "message": "Email Field is Required" })
    }
}

const EmailVarification = async (req, res) => {
    const { password, confirmpassword } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    const newsecret = user._id + process.env.SECREAT_KEY

    try {

        jwt.verify(token, newsecret)
        if (password === confirmpassword) {
            const salt = await bcryptjs.genSalt(10)
            const hashp = await bcryptjs.hash(password, salt)
            await User.findByIdAndUpdate(user._id, { $set: { password: hashp } })
            res.send({ "Status": "success", "msg": "Password  changed successfully" })
        } else {
            res.send({
                "status": "failed", "msg": "Password is not matching"
            })
        }

    } catch (error) {
        console.log(error)
        res.send({ "status": "failed", "message": "Invalid Token" })
    }


}

module.exports = { AddUser, LoginUser, changepassword, UserData, ResetEmailPassword, EmailVarification }

