import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import uploadRouter from "./route/upload.js";
import getRouter from "./route/Filesroute.js";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./exceptions/errorMiddleware";
import project from "./route/project.js";
import authRoute from "./route/auth.js";
import userProjectRoute from "./route/userProject.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(
  cors({
    origin: "https://dms-prod-7z4r.vercel.app", // Frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", authRoute);
app.use("/user", userProjectRoute);
app.use("/upload", uploadRouter);
app.use("/files", getRouter);
app.use("/project", project);

app.use(errorMiddleware);
const isProduction = process.env.NODE_ENV === "production";
const startServer = async () => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("successfully connected to database");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      if (!isProduction) {
        console.log("🛠️ Running in development mode");
      }
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();
