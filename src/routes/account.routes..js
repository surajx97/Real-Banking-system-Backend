const express=require("express");
const authMiddleware=require("../middleware/auth.middleware")
const accountController=require("../controller/account.controller")


const router=express.Router()
/* create account api */

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/* get api for all  account  for single user*/
router.get("/",authMiddleware.authMiddleware ,accountController.getUserAccountsController)

/* *
* -GET /api/account/balance/:accountId
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController);

module.exports=router;

