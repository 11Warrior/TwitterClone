import { config } from "dotenv";
import mongoose from "mongoose";
config()
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(console.log('Connected to our database'))
  } catch (error) {
    console.log(error);
  }
}
