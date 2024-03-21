import UserModel from "../models/user.js";
import Auth from "../helper/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otp from "../models/otp.js";

const getAllUsers = async (req, res) => {
  try {
    let user = await UserModel.find({}, { password: 0 });
    res.status(200).send({
      message: "User data fetch successful",
      user,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server",
    });
  }
};
const getUserById = async (req, res) => {
  try {
    let user = await UserModel.findById(
      { _id: req.params.id },
      { password: 0 }
    );
    res.status(200).send({
      message: "User data fetch successful",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};
const createUser = async (req, res) => {
  try {
    //check if the email exists in db
    const { email, password } = req.body;
    console.log(email);
    const user = await UserModel.findOne({ email: email });
    console.log(user);
    if (!user) {
      // if email not found create the user
      // create hash for password
      req.body.password = await Auth.createHash(req.body.password);
      let newUser = await UserModel.create(req.body);
      res.status(200).send({
        message: "User Added Successfully",
      });
    } else {
      //if email is found respond error message
      res.status(400).send({
        message: `User with ${req.body.email} already exists`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    //check if the user exists
    if (user) {
      //compare the input password and hash
      if (await Auth.hashCompare(password, user.password)) {
        //create token
        const token = await Auth.createToken({
          userName: user.userName,
          email: user.email,
        });
        res.status(200).send({
          message: "Login Successfull",
          token,
          id: user._id,
        });
      } else {
        res.status(400).send({
          message: `Incorrect Password`,
        });
      }
    } else {
      res.status(400).send({
        message: `User with ${req.body.email} does not exists`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const emailSend = async (req, res) => {
  const { email } = req.body;
  try {
    const data = await UserModel.findOne({ email: email });
    if (data === null) {
      res.status(500).send({ message: "Email was not found" });
    } else {
      const userName = data.userName;

      let otpcode = Math.floor(Math.random() * 10000 + 1);
      let otpData = new otp({
        email: email,
        code: otpcode,
        expiresIn: new Date().getTime() + 300 * 1000,
      });
      const otpResponse = await otpData.save();
      mailer(userName, email, otpcode);

      const message = `The mail with the OTP has been sent. Please check inbox`;

      res.status(200).send({ data: data, message: message });
    }
  } catch (error) {
    res.status(409).send({ message: error.message });
  }
};

const verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    const data = await otp.findOne({ code: code });

    if (data === null) {
      res.status(409).send({ message: "Invalid OTP" });
    } else {
      const currentTime = new Date().getTime();
      const expiresIn = parseInt(data.expiresIn);

      if (expiresIn < currentTime) {
        res.status(409).send({ data: data, message: "Code is expired." });
      } else {
        res.status(200).send({ data: data, message: "Code is valid" });
      }
    }
  } catch (error) {
    res.status(409).send({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp: otpCode, password, confirmPassword } = req.body;

  try {
    let data = await otp.findOne({ code: otpCode });

    if (data) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        if (password !== confirmPassword)
          return res.status(400).send({ message: "Passwords don't match" });

        const newHashedPassword = await Auth.createHash(password);

        const result = await UserModel.findOneAndUpdate(
          { email: user.email },
          { $set: { password: newHashedPassword } },
          { new: true }
        );

        data.deleteOne({ code: otpCode });

        res
          .status(200)
          .send({ data: result, message: "Password changed successfully" });
      } else {
        res.status(409).send({ message: "User not found." });
      }
    } else {
      res.status(409).send({ message: "Could not find OTP in the database." });
    }
  } catch (error) {
    res.status(409).send({ message: error.message });
  }
};

// Nodemailer Configurations to send Email
const mailer = async (userName, email, otp) => {
  // try {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,

    secure: true,
    auth: {
      user: "rameshpriyait@gmail.com",
      // pass: "eiet nylb bctv yerp",
      pass: "bdhw ayuf efgt odlx",
    },
    // tls:{rejectUnauthorized: false}
  });
  // console.log(transporter)
  const mailOptions = {
    from: "rameshpriyait@gmail.com",
    to: email,
    subject: "Link to Reset Password",
    html: `<p>Hi ${userName}, Your verification code to reset your password is ${otp}.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Mail has been sent:- ${info.response}`);
    }
  });
  // } catch (error) {
  //   res.status(500).send({ message: "error" })
  // }
};

export default {
  getAllUsers,
  getUserById,
  login,
  createUser,
  emailSend,
  resetPassword,
  verifyCode,
};
