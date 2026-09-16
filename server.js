const { default: mongoose } = require("mongoose");
const app=require("./src/app")
const connectToDb=require('./src/config/db')


connectToDb();

    app.listen(3000,()=>{
    console.log("server is running on 3000");

    })



