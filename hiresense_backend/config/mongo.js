import mongoose from "mongoose";
import env from "./env.js";

async function connectMongo() {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

async function checkMongo() {
  return mongoose.connection.readyState === 1;
}

async function closeMongo() {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
}

export {
  connectMongo,
  checkMongo,
  closeMongo
};