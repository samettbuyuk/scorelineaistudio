import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, SchemaType as Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  // API Routes
  app.post("/api/transform", async (req, res) => {
    const { input, mode } = req.body;

    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      const isTranslate = mode === 'translate';
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Dönüştürülmüş tweet metni" },
              explanation: { type: Type.STRING, description: "Neden bu şekilde optimize edildiğinin kısa açıklaması" }
            },
            required: ["text"]
          }
        },
        systemInstruction: `Sen Scoreline AI asistanısın, profesyonel bir spor Twitter içerik üreticisisin. 
        Görevin: Gelen metni Türkçeye çevirmek (eğer yabancı dildeyse) veya özetleyip optimize etmek.
        
        ${isTranslate 
          ? "ÖNEMLİ: 'Translate' (Çeviri) modunda metni kısaltma. Anlamı tam olarak koru ve tüm detayları çevir. Karakter limiti (280) kısıtlamasına takılma, gerekirse uzun bir metin üret."
          : "Karakter limitine (280) sadık kalmaya çalış, gerekirse bilgileri özetle."}
        
        Kurallar:
        - Dil samimi, enerjik ve spor dünyasına uygun olmalı.
        - Emoji kullanımı dengeli ve profesyonel (spor temalı) olmalı.
        - KESİNLİKLE HASHTAG (#) EKLEME. Kullanıcı hashtag istemiyor.
        - Yanıtı her zaman JSON formatında ver.`
      });

      const prompt = `Mod: ${mode}\nGirdi Metni: "${input}"\n\nLütfen bu metni spor dünyasına uygun${isTranslate ? ", tam metin çeviri olacak şekilde" : ""} dönüştür.`;
      
      const result = await model.generateContent(prompt);
      const output = result.response.text();
      res.json(JSON.parse(output || "{}"));
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to transform content" });
    }
  });

  app.post("/api/suggest", async (req, res) => {
    const { keywords } = req.body;

    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const prompt = `Aşağıdaki anahtar kelimelere dayalı 5 adet yaratıcı spor tweet önerisi sun: "${keywords}".
      Her tweet özgün, dikkat çekici ve etkileşim odaklı olmalı. Yanıtı sadece bir dizi (array) string olarak ver.`;

      const result = await model.generateContent(prompt);
      const output = result.response.text();
      res.json(JSON.parse(output || "[]"));
    } catch (error) {
      console.error("Gemini Suggest Error:", error);
      res.status(500).json({ error: "Failed to suggest tweets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
