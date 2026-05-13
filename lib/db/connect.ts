import mongoose from "mongoose";

declare global {
  var _mongooseConn: typeof mongoose | undefined;
}

export async function dbConnect() {
  if (global._mongooseConn) return global._mongooseConn;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to the deployment environment."
    );
  }

  global._mongooseConn = await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
  });

  return global._mongooseConn;
}
