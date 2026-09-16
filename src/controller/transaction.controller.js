const transactionModel=require('../models/transactions.model')
const {ledgerModel}=require('../models/ledger.Model')
const emailService=require('../services/email.service') 
const accountModel=require('../models/account.model')
const mongoose=require("mongoose")
//steps we follow here in transaction creation
/**
 * - Create a new transaction
 *
 * THE 10-STEP TRANSFER FLOW:
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
// 1. Validate request
async function createTransaction(req,res){
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;
    if(!fromAccount||!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"fromAccount ,toAccount,amount,and idempotency is required"
        })
    }
    const fromUserAccount= await accountModel.findOne({
        _id:fromAccount,
    })
     const toUserAccount= await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount||!toAccount){
     return res.status(400).json({
            message:"fromAccount ,toAccount both must be exist"
        })
    }

// 2.Validate idempotency key
/* 
An idempotency key is a unique identifier sent by the client with a request so the server can recognize that the same operation is being retried.
*/
const isTransactionAlreadyExists=await transactionModel.findOne({
    idempotencyKey:idempotencyKey
})
if(!isTransactionAlreadyExists.status==="COMPLETED"){
    return res.status(200).json({
        message:"Transaction alerady Processed",
        transaction:isTransactionAlreadyExists
    })
}
if(!isTransactionAlreadyExists.status==="PENDING")
{
     return res.status(200).json({
        message:"Transaction alerady Processing",
       
    })
}
if(!isTransactionAlreadyExists.status==="FAILED")
{
     return res.status(200).json({
        message:"Transaction  Processing FAILED",
       
    })
}
if(!isTransactionAlreadyExists.status==="REVERSED")
{
     return res.status(200).json({
        message:"Transaction was Reversed please retry",
    })
}

/* 
 3. Check account status
*/
if(fromUserAccount.status!=="ACTIVE"||toUserAccount.status!=="ACTIVE"){
return res.status(400).json({
    meassage:"both sender and reciver account must be active for any further transaction"
})
}

/*4. Derive sender balance from ledger  */
const balance=await fromUserAccount.getBalance();
if(balance<amount){
  return  res.status(400).json({
        message:`insufficent balance .current balance is ${balance}`
    })
}



/* 
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
*/
//they are compele at once if any one is failed rollback
const session=await mongoose.startSessoin();
session.startTransaction();
const transaction=await transactionModel.create({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
},{session})

const debitLedgerEntry=await ledgerModel.create({
    account:fromAccount,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"

},{session})

const creditLedgerEntry=await ledgerModel.create({
    account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"CREDIT"

},{session})

transaction.status="COMPLETED";
await transaction.save({session});
await session.commitTransaction();

session.endSession();
/* 10. Send email notification */
await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    toAccount,
    amount

)
return res.status(201).json({
    message:"transaction is completed sucessfully",
    transaction:transaction
})
}

/*  async function createIntialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;
    if(!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"toAccount,amount,and idempotency is required"
        })
    }
    const toUserAccount= await accountModel.findOne({
        _id:toAccount,
    })
    
    if(!toUserAccount){
     return res.status(400).json({
            message:"toAccount must be exist"
        })
    }

    const fromUserAccount=await accountModel.findOne({
        systemUser:true,
        user:req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message:"System account not found"
        })
    }

    //create transaction from system account to user account
    const session=await mongoose.startSession();
session.startTransaction();
const transaction=await transactionModel.create({
    fromAccount:fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
},{session})

const debitLedgerEntry=await ledgerModel.create({
    account:fromUserAccount._id,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"    

}
,{session})

const creditLedgerEntry=await ledgerModel.create({
    account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"CREDIT"

},{session})

transaction.status="COMPLETED";
await transaction.save({session});
await session.commitTransaction();

session.endSession();

return res.status(201).json({
    message:"transaction is completed sucessfully",
    transaction:transaction
})
}           
*/
async function createIntialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body;

    // 1. Validate input
    if (!toAccount || !idempotencyKey || !amount || amount <= 0) {
        return res.status(400).json({
            message: "toAccount, valid amount, and idempotencyKey are required"
        });
    }

    // 2. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({
            message: "Invalid account ID"
        });
    }

    
    // 3. Find destination account
    const toUserAccount = await accountModel.findOne({
        user: toAccount
    });

    if (!toUserAccount) {
        return res.status(400).json({
            message: "toAccount must exist"
        });
    }
console.log(req.user);
    // 4. Find system account
    const fromUserAccount = await accountModel.findOne({
        user:req.user._id,
    });


    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System account not found"
        });
    }

    // 5. Start MongoDB transaction
    const session = await mongoose.startSession();

    try {

         session.startTransaction();

        // 6. Create transaction
        const [transaction] = await transactionModel.create(
            [{
                fromAccount: fromUserAccount._id,
                toAccount: toAccount,
                amount: amount,
                idempotencyKey: idempotencyKey,
                status: "PENDING"
            }],
            { session }
        );

        // 7. Debit system account
        await ledgerModel.create(
            [{
                account: fromUserAccount._id,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            { session }
        );

        // 8. Credit user account
        await ledgerModel.create(
            [{
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            { session }
        );

        // 9. Mark transaction completed
        transaction.status = "COMPLETED";

        await transaction.save({ session });

        // 10. Commit everything
        await session.commitTransaction();

        return res.status(201).json({
            message: "Transaction completed successfully",
            transaction
        });

    } catch (error) {

        // 11. Undo everything
        await session.abortTransaction();

        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        });

    } finally {

        // 12. Close session
        await session.endSession();

    }
}

module.exports={createTransaction,createIntialFundsTransaction};
