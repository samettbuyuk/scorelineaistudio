import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface TransformationResult {
  text: string;
  explanation?: string;
}

export const geminiService = {
  async transformContent(input: string, mode: 'translate' | 'summarize' | 'enhance'): Promise<TransformationResult> {
    if (!ai) {
      throw new Error("Gemini API key is not configured.");
    }

    const isTranslate = mode === 'translate';
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Mod: ${mode}\nGirdi Metni: "${input}"\n\nLütfen bu metni spor dünyasına uygun${isTranslate ? ", tam metin çeviri olacak şekilde" : ""} dönüştür.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Dönüştürülmüş tweet metni" },
              explanation: { type: Type.STRING, description: "Neden bu şekilde optimize edildiğinin kısa açıklaması" }
            },
            required: ["text"]
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
        }
      });

      return JSON.parse(response.text || "{}") as TransformationResult;
    } catch (error) {
      console.error("Client Gemini Error:", error);
      throw error;
    }
  },

  async suggestTweetsBrief(keywords: string): Promise<string[]> {
    if (!ai) return [];
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Aşağıdaki anahtar kelimelere dayalı 5 adet yaratıcı spor tweet önerisi sun: "${keywords}".
        Her tweet özgün, dikkat çekici ve etkileşim odaklı olmalı. Yanıtı sadece bir dizi (array) string olarak ver.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Client Gemini Suggest Error:", error);
      return [];
    }
  }
};
