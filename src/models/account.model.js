const mongoose = require("mongoose");
const { Schema } = mongoose;
const ledgerModel = require("./ledger.Model");
const accountSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "account must be associated with the user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "CLOSED", "FROZEN"],
        message: "status can be either ACTIVE,FROZEN OR CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "currency is requred for "],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);
//make a compounnd index.
accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  console.log(ledgerModel);
  const balanceData =await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  if (balanceData.length == 0) {
    return 0;
  }

return balanceData[0].balance;
};

///if user is new so this pipeline give us only empty array because
//user have not ant leder entry

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
