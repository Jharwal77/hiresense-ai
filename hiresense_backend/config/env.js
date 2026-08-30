import dotenv from "dotenv";

dotenv.config();

const requiredEnvironmentVariables = [
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_DATABASE",
  "MYSQL_USER",
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GEMINI_API_KEY",

  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",

  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_CALLBACK_URL"
];

for (const key of requiredEnvironmentVariables) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }
}

const env = {
  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  port:
    Number(
      process.env.PORT || 5000
    ),

  clientUrl:
    process.env.CLIENT_URL ||
    "http://localhost:5173",

  mysql: {
    host:
      process.env.MYSQL_HOST,

    port:
      Number(
        process.env.MYSQL_PORT ||
        3306
      ),

    database:
      process.env.MYSQL_DATABASE,

    user:
      process.env.MYSQL_USER,

    password:
      process.env.MYSQL_PASSWORD || ""
  },

  mongoUri:
    process.env.MONGO_URI,

  gemini: {
    apiKey:
      process.env.GEMINI_API_KEY
  },

  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET,

    refreshSecret:
      process.env.JWT_REFRESH_SECRET,

    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN ||
      "15m",

    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN ||
      "7d"
  },

  cloudinary: {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME,

    apiKey:
      process.env.CLOUDINARY_API_KEY,

    apiSecret:
      process.env.CLOUDINARY_API_SECRET
  },

  google: {
    clientId:
      process.env.GOOGLE_CLIENT_ID,

    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET,

    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL
  },

  adzuna: {
  appId: process.env.ADZUNA_APP_ID,
  appKey: process.env.ADZUNA_APP_KEY
},

  github: {
    clientId:
      process.env.GITHUB_CLIENT_ID,

    clientSecret:
      process.env.GITHUB_CLIENT_SECRET,

    callbackUrl:
      process.env.GITHUB_CALLBACK_URL
  }
};

export default env;