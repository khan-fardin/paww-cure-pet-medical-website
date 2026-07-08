import { v2 as cloudinary } from "cloudinary";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let configured = false;

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      api_key: requiredEnv("CLOUDINARY_API_KEY"),
      api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
      cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export function getCloudinaryClientConfig() {
  return {
    apiKey: requiredEnv("CLOUDINARY_API_KEY"),
    cloudName: requiredEnv("CLOUDINARY_CLOUD_NAME"),
  };
}
