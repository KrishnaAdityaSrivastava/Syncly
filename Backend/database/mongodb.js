import mongoose from "mongoose";

import { DB_URI, NODE_ENV } from "../config/env.js";

export const getDatabaseStatus = () => mongoose.connection.readyState;

const ConnectToDatabase = async () => {
  if (!DB_URI) {
    throw new Error('Please define Mongo DB connection URI');
  }

  await mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  console.info(`Connected to DataBase in ${NODE_ENV} mode`);
  return mongoose.connection;
};

export default ConnectToDatabase;
