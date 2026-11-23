import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/config.service";
import { corsOption } from "./Utils/Cors/Cors";
import { limiter } from "./Middlewares/RateLimiter.middleware";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/Response/Error.Response";
import { authController, userController,postController } from "./Modules/index";
import connectDB from "./DB/Models/DB.Connection";
import { redisConnection } from "./DB/Models/Redis.connection";
import { uploadDir } from "./Utils/multer/local.multer";
import { userModel } from "./DB/Models/User.Model";


export const bootstrap = async (): Promise<void> => {
  await connectDB();
  await redisConnection();

  const app: Express = express();[]

  app.use(helmet());
  app.use(cors(corsOption));
  app.use(express.json());
  app.use(limiter);
  app.use("/uploads", express.static(uploadDir));

  app.use("/api/auth", authController);
  app.use("/api/user", userController);
  app.use("/api/post", postController);

  // const user = new userModel({
  //   userName:"Alaa Elsayed",
  //   email:`gezera188@GMAIL.COM `,
  //   password:"0987654",
  //   phone:"01115152809"
  // }).save()
  app.use((_req: Request, _res: Response) => {
    throw new NotFoundException("Route not found");
  });
  app.use(globalErrorHandler);


  app.listen(env.PORT, () => {
    console.log(`server is Running on http://localhost:${env.PORT}`);
  });
};
