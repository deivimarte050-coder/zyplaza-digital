import express from "express";
import { aiRouter } from "../server/aiRoutes.js";
import { adminRouter } from "../server/adminRoutes.js";
import { renderCatalogHtml } from "../server/catalogRoutes.js";

const app = express();

app.use(express.json({ limit: "5mb" }));

// Vercel may forward the request with or without the /api prefix,
// so the same router is mounted on both paths.
app.use("/api", aiRouter);
app.use("/api", adminRouter);
app.use("/", aiRouter);
app.use("/", adminRouter);

// Catálogo público compartible (ver vercel.json: /catalogo/:slug -> /api).
// Se obtiene el HTML estático ya construido por Vite desde el propio deploy
// y se le inyectan los metadatos Open Graph de la tienda antes de servirlo.
app.get("/catalogo/:slug", async (req, res) => {
  try {
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = req.headers.host;
    const baseHtmlResponse = await fetch(`${proto}://${host}/index.html`);
    const baseHtml = await baseHtmlResponse.text();
    const pageUrl = `${proto}://${host}${req.originalUrl}`;
    const html = await renderCatalogHtml(baseHtml, req.params.slug, pageUrl);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (error) {
    console.error("Error generando el catálogo público:", error);
    res.status(500).send("No se pudo cargar el catálogo.");
  }
});

export default app;
