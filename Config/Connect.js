const mongoose = require("mongoose")


const url = "mongodb+srv://nikhil:nikhil@cluster0.x7p2hfa.mongodb.net/MyDB?retryWrites=true&w=majority"

const connect =async()=>{
    try{
    const con = await mongoose.connect(url, () => {
            console.log("You are connected with mongodb database");
        })

    }catch(err){
        console.log("You are unable to connect to the database");
    }
}

module.exports = connect;