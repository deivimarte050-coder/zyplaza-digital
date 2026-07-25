import express from "express";
import { aiRouter } from "../server/aiRoutes.js";

const app = express();

app.use(express.json({ limit: "5mb" }));

// Vercel may forward the request with or without the /api prefix,
// so the same router is mounted on both paths.
app.use("/api", aiRouter);
app.use("/", aiRouter);

export default app;
