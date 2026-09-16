// const userModel=require('../models/user.models');
const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const emailService=require('../services/email.service')

const userRegisterController = async (req, res) => {
  const { name, email, password } = req.body;

  const isExist = await userModel.findOne({
    email,
  });
  if (isExist) {
    return res.status(422).json({
      meassage: "uesr is already Exist",
      status: "failed",
    });
  }
  const user = await userModel.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
  await emailService.sendRegistrationEmail(user.email,user.name);
};

const userLoginController = async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ meassage: "email,and password both required" });
  }
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.stauts(401).json({
      meassage: "Email or password is invalid",
    });
  }
   
  const isValidPassword = user.comparePassword(password);
  if (!isValidPassword) {
    return res.stauts(401).json({
      meassage: "password or email is wrong",
    });
  }


   
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
        expiresIn:"3d"
    });
    res.cookie("token",token)

    res.status(201).json({
        uesr:{
            _id:user._id,
            email:user.email,
            name:user.name
        },token
    })


};

module.exports = { userRegisterController, userLoginController };
