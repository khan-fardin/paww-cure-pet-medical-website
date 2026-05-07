import mongoose from "mongoose";

declare global {
  var _mongooseConn: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export async function dbConnect() {
  if (global._mongooseConn) return global._mongooseConn;

  global._mongooseConn = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
  });

  return global._mongooseConn;
}
