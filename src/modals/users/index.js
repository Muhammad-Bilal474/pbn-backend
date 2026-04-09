import mongoose from "mongoose";
import { STATUS_OPTIONS, THEME_OPTIONS , THEME, STATUS } from "../../../utils/constants/enum.js";


const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    playerId: {
      type: String,
    },
    status: {
      type: String,
      enum: STATUS_OPTIONS,
      default: STATUS.ACTIVE,
    },
    theme: {
      type: String,
      enum: THEME_OPTIONS,
      default: THEME.LIGHT,
    },
    subscribedAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", UserSchema);

export default User;
