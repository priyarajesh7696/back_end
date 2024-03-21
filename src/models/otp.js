import mongoose from './index.js'

const otpSchema = new mongoose.Schema(
  {
    email: String,
    code: Number,
    expiresIn: Number,
  },
  {
    timestamps: true,
  },
)

const otp = mongoose.model('otp', otpSchema, 'otp')

export default otp