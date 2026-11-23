import mongoose from "mongoose";
import { env } from "../../config/config.service";
import chalk, { Chalk } from "chalk";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(chalk.green(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error) {
    console.error(`Database connection error: ${(error as Error).message}`);
    throw error;
  }
};

export default connectDB;
