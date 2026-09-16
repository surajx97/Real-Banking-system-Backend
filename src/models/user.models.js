// const { default: mongoose } = require("mongoose");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt=require('bcrypt');
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    unique:[true,"email already exist"]
  },
  name:{
type:String,
required:[true,"name is required to create the account"]          
  },
  password:{                                                 
    type:String,                                            
    required:[true,"password is required to create the account"],
    minlength:[6,"password should contain more than 6 character"],
    select:false,
  },
  systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select:false
}                                                                        
                                                           
},{
    timestamps:true
});


userSchema.pre('save', async function(){
if(!this.isModified("password")){
return ;
}
const hash=await bcrypt.hash(this.password,10);
this.password=hash;

})

userSchema.method('comparePassword',async function(password){

    return await bcrypt.compare(password,this.password);

})

const userModel=mongoose.model("user",userSchema);
module.exports=userModel;