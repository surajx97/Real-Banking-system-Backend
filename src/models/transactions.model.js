const mongoose =require("mongoose")
const{Schema}=mongoose

const transacitonSchema=new mongoose.Schema({
 fromAccount:{
    type:mongoose.Types.ObjectId,
    ref:'account',
    required:[true,"Transaciton must be associated with a from account"],
    index:true
 },
 toAccount:{
    type:mongoose.Types.ObjectId,
    ref:'account',
    required:[true,"transacions must be associated with a account"],
    index:true
 },
 status:{
    type:String,
    enum:["PENDING","COMPLETED","FAILED","REVERSED"],
    default:"PENDING"
 },
 amount:{
    type:Number,
    required:[true,"amount is required for creating a transaction"],
    min:[0,"min balance is 0"]
 },
 idempotencyKey:{
    type:String,
    required:[true,"idempotency key is required for creating a transaciton"],
    unique:true,
    index:true
 }
},{
    timestamps:true
})

const transactionModel=mongoose.model("transaction",transacitonSchema);
module.exports=transactionModel;
