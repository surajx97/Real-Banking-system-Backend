const mongoose=require("mongoose")
const {Schema}=mongoose

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Types.ObjectId,
        ref:'account',
        required:[true,"ledger must be assoicated with account "],
        index:true,
        immutable:true,
    },
    amount:{
        type:Number,
        required:[true,"any transacion have amount"],
        immutable:true,

    },
    transaction:{
        type:mongoose.Types.ObjectId,
        ref:'transaction',
        required:[true,"ledger must be asociated with transaciton"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can be either credit or debit"
        },
        immutable:true,
        required:true,
    },

})

function preventLedgerModification(){
    throw new Error("ledeger entries are imuutable and can`t be modified");

}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)
const ledgerModel=mongoose.model('ledger',ledgerSchema);
module.exports=ledgerModel