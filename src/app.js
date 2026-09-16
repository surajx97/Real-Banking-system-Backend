const express =require('express')
const cookieParser=require("cookie-parser")
const app=express()

app.use(express.json())
app.use(cookieParser());


const authRouter=require('./routes/auth.routes')
const accountRouter=require("../src/routes/account.routes.");
const transactionRoutes = require('./routes/transaction.routes');


app.use('/api/auth',authRouter);
app.use('/api/accounts',accountRouter);
app.use('/api/transactions',transactionRoutes);



module.exports=app