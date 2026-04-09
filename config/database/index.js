import mongoose from "mongoose";
import { MONGODB_URL } from "../config.js";


const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

export default connectDB;
