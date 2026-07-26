import express from "express";
import { aiRouter } from "../server/aiRoutes.js";
import { adminRouter } from "../server/adminRoutes.js";

const app = express();

app.use(express.json({ limit: "5mb" }));

// Vercel may forward the request with or without the /api prefix,
// so the same router is mounted on both paths.
app.use("/api", aiRouter);
app.use("/api", adminRouter);
app.use("/", aiRouter);
app.use("/", adminRouter);

export default app;
