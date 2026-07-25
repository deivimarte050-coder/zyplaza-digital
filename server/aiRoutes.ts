import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export const aiRouter = Router();

// Health check
aiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Zyplaza Local Marketplace" });
});

// Generate AI Product Description & Tags
aiRouter.post("/ai/describe-product", async (req, res) => {
  try {
    const { title, category, condition, price, userPrompt } = req.body ?? {};
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Eres un experto vendedor en marketplaces locales (estilo Facebook Marketplace). 
Crea un título llamativo, una descripción vendedora y clara de 3-4 párrafos estructurados, y 5 etiquetas clave en español para este artículo:
- Nombre base/idea: ${title || "Producto sin nombre"}
- Categoría: ${category || "General"}
- Estado: ${condition || "Usado en buen estado"}
- Precio estimado: RD$ ${price || "N/A"}
- Notas adicionales del usuario: ${userPrompt || "Ninguna"}

Responde estrictamente en formato JSON según el esquema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: {
              type: Type.STRING,
              description: "Título atractivo y optimizado para búsquedas locales",
            },
            description: {
              type: Type.STRING,
              description: "Descripción detallada del producto con estado, beneficios y llamado a la acción local",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 5 etiquetas populares",
            },
            safetyTip: {
              type: Type.STRING,
              description: "Un consejo breve de seguridad para la entrega presencial de este tipo de producto",
            },
          },
          required: ["suggestedTitle", "description", "tags", "safetyTip"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating product description:", error);
    res.status(500).json({
      error: "Error al generar la descripción con IA.",
      details: error?.message,
    });
  }
});

// Suggest Fair Local Market Price
aiRouter.post("/ai/suggest-price", async (req, res) => {
  try {
    const { title, category, condition, originalPrice } = req.body ?? {};
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analiza el mercado de compra-venta local para el siguiente producto y sugiere un rango de precio justo en Pesos Dominicanos (RD$):
- Producto: ${title}
- Categoría: ${category}
- Estado: ${condition}
- Precio original o de referencia: RD$ ${originalPrice || "Desconocido"}

Retorna un JSON estructurado con el rango sugerido y una justificación breve.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedPrice: { type: Type.NUMBER, description: "Precio recomendado" },
            minPrice: { type: Type.NUMBER, description: "Precio mínimo para venta rápida" },
            maxPrice: { type: Type.NUMBER, description: "Precio máximo del mercado" },
            reasoning: { type: Type.STRING, description: "Explicación breve del valor" },
          },
          required: ["recommendedPrice", "minPrice", "maxPrice", "reasoning"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error estimating price:", error);
    res.status(500).json({
      error: "Error al estimar el precio con IA.",
      details: error?.message,
    });
  }
});

// AI Buyer / Seller Chat Assistant
aiRouter.post("/ai/chat-assistant", async (req, res) => {
  try {
    const { lastMessage, listingTitle, listingPrice, userRole } = req.body ?? {};
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Actúas como un asistente inteligente para el chat de Zyplaza (Marketplace local).
El usuario actual es un ${userRole === "seller" ? "VENDEDOR" : "COMPRADOR"}.
Producto en negociación: "${listingTitle}" (Precio publicado: RD$ ${listingPrice}).
Último mensaje recibido: "${lastMessage}".

Genera 3 respuestas rápidas y amables en español que el usuario podría enviar con 1 clic (ej. ofertas, disponibilidad, punto de encuentro).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 sugerencias cortas de respuesta",
            },
            dealTip: {
              type: Type.STRING,
              description: "Consejo breve para cerrar el trato de forma segura",
            },
          },
          required: ["suggestions", "dealTip"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in chat assistant:", error);
    res.status(500).json({
      error: "Error al generar respuestas inteligentes.",
      details: error?.message,
    });
  }
});
