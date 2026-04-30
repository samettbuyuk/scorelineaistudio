import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TransformationResult {
  text: string;
  explanation?: string;
}

export const geminiService = {
  async transformContent(input: string, mode: 'translate' | 'summarize' | 'enhance'): Promise<TransformationResult> {
    const isTranslate = mode === 'translate';
    
    const systemInstruction = `Sen Scoreline AI asistanısın, profesyonel bir spor Twitter içerik üreticisisin. 
    Görevin: Gelen metni Türkçeye çevirmek (eğer yabancı dildeyse) veya özetleyip optimize etmek.
    
    ${isTranslate 
      ? "ÖNEMLİ: 'Translate' (Çeviri) modunda metni kısaltma. Anlamı tam olarak koru ve tüm detayları çevir. Karakter limiti (280) kısıtlamasına takılma, gerekirse uzun bir metin üret."
      : "Karakter limitine (280) sadık kalmaya çalış, gerekirse bilgileri özetle."}
    
    Kurallar:
    - Dil samimi, enerjik ve spor dünyasına uygun olmalı.
    - Emoji kullanımı dengeli ve profesyonel (spor temalı) olmalı.
    - KESİNLİKLE HASHTAG (#) EKLEME. Kullanıcı hashtag istemiyor.
    - Yanıtı her zaman JSON formatında ver.`;

    const prompt = `Mod: ${mode}
    Girdi Metni: "${input}"
    
    Lütfen bu metni spor dünyasına uygun${isTranslate ? ", tam metin çeviri olacak şekilde" : ""} dönüştür.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Dönüştürülmüş tweet metni" },
              explanation: { type: Type.STRING, description: "Neden bu şekilde optimize edildiğinin kısa açıklaması" }
            },
            required: ["text"]
          }
        }
      });

      return JSON.parse(response.text || "{}") as TransformationResult;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  async suggestTweetsBrief(keywords: string): Promise<string[]> {
    const prompt = `Aşağıdaki anahtar kelimelere dayalı 5 adet yaratıcı spor tweet önerisi sun: "${keywords}".
    Her tweet özgün, dikkat çekici ve etkileşim odaklı olmalı. Yanıtı sadece bir dizi (array) string olarak ver.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
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
      console.error("Gemini Suggest Error:", error);
      return [];
    }
  }
};
