const mongoose = require('mongoose');

function ConnectToDb(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch((error)=>
    console.log("error in connecting the databse",error.message))
}

module.exports=ConnectToDb