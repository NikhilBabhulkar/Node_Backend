const router = require("./Routes/Routes")
const express = require('express');
const app = express()
const db = require("./Config/Connect")
const dotenv = require("dotenv")

dotenv.config()

app.use(express.json())
db()
app.use("/api",router)

app.listen(process.env.PORT,()=>{
    console.log("server is started with port ",process.env.PORT);
})