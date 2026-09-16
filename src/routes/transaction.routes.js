const transactionModel=require("../models/transactions.model")
const authMiddleware=require("../middleware/auth.middleware")
const express=require('express');
const router=express.Router()
const transactionController=require("../controller/transaction.controller")



router.post('/',authMiddleware.authMiddleware,transactionController.createTransaction)

router.post('/system/intial-funds',authMiddleware.authSystemUserMiddleware,transactionController.createIntialFundsTransaction)

module.exports=router