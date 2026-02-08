import mongoose from "mongoose";

import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
    throw new Error('Please define Mongo DB connection URI')
}

const ConnectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.info(`Connected to DataBase in ${NODE_ENV} mode`);
    }
    catch (error) {
        console.error("Error : ", error);
        process.exit(1);
    }
}
export default ConnectToDatabase;
