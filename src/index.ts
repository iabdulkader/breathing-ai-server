import "dotenv/config";
import express, { Express, NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { checkEnvVariables } from "./utils";
import signUpRouter from "./routes/signup.route";
import signInRouter from "./routes/signin.route";
import customerRouter from "./routes/customer.route";
import authGuard from "./middlewares/auth";
import { swaggerSpec } from "./utils/swagger";
import userRouter from "./routes/user.route";
import paymentRouter from "./routes/payment.route";
import bookmarkRoute from "./routes/bookmark.route";


export const app: Express = express();

export const prisma = new PrismaClient();

app.use(morgan("dev"));
app.use(cors());

app.use(paymentRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running... 🏃");
});

app.use("/explorer", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(signUpRouter);
app.use(signInRouter);

app.use(authGuard);
app.use(customerRouter);
app.use(userRouter);
app.use(bookmarkRoute);


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({ error: err.message });
});


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