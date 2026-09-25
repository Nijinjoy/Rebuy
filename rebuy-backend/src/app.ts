import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorMiddleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "ReBuy backend is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
