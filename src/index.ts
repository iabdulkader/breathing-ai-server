import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import cors from "cors";

import { checkEnvVariables } from "./utils";
import signUpRouter from "./routes/signup.route";


export const app: Express = express();

export const prisma = new PrismaClient();

app.use(morgan("dev"));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running... 🏃");
  });

app.use(signUpRouter);


  const serve = async () => {
    try {
      checkEnvVariables();
  
      console.log("💡 Setting up ORM...");
  
      await prisma.$connect();
  
      app.listen(process.env.PORT || 4000, () => {
        console.log(
          `⚡️ Server is running at http://localhost:${process.env.PORT || 4000}`
        );
      });
    } catch (error: any) {
      console.log(error?.response?.data || error);
    }
  
    process.on("SIGINT", async () => {
        console.log("👋 SIGINT received, shutting down gracefully");

        await prisma.$disconnect();
    
        process.exit(0);
      });
    };
    
    serve();