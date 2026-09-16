require("dotenv").config()
const mongoose=require('mongoose')

async function connectToDb(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected sucessgully mongoDB");
        
    }
    catch(error){
       console.log("connection failed",error.meassgae);
       process.exit(1);
    }
}

module.exports=connectToDb;