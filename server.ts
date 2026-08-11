import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { aiRouter } from "./server/aiRoutes.js";
import { adminRouter } from "./server/adminRoutes.js";
import { renderCatalogHtml } from "./server/catalogRoutes.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));
app.use("/api", aiRouter);
app.use("/api", adminRouter);

// Las rutas de IA viven en server/aiRoutes.ts y se comparten con Vercel.

// Mount Vite middleware in development or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");
  const vite = isProd
    ? null
    : await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });

  // Catálogo público compartible: mismo bundle de la SPA, pero con metadatos
  // Open Graph inyectados en el servidor para que WhatsApp/Facebook/Telegram
  // muestren una vista previa correcta de la tienda.
  app.get("/catalogo/:slug", async (req, res) => {
    try {
      const templatePath = isProd
        ? path.join(distPath, "index.html")
        : path.join(process.cwd(), "index.html");
      let baseHtml = fs.readFileSync(templatePath, "utf-8");
      if (!isProd && vite) {
        baseHtml = await vite.transformIndexHtml(req.originalUrl, baseHtml);
      }
      const pageUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const html = await renderCatalogHtml(baseHtml, req.params.slug, pageUrl);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      console.error("Error generando el catálogo público:", error);
      res.status(500).send("No se pudo cargar el catálogo.");
    }
  });

  if (!isProd && vite) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Multiplaza Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
