import mongoose from "mongoose";

import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error('Please define Mongo DB connection URI');
}

export const getDatabaseStatus = () => mongoose.connection.readyState;

const ConnectToDatabase = async () => {
  await mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.info(`Connected to DataBase in ${NODE_ENV} mode`);
  return mongoose.connection;
};

export default ConnectToDatabase;
