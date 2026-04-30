export interface TransformationResult {
  text: string;
  explanation?: string;
}

export const geminiService = {
  async transformContent(input: string, mode: 'translate' | 'summarize' | 'enhance'): Promise<TransformationResult> {
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch from server");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Client Gemini Error:", error);
      throw error;
    }
  },

  async suggestTweetsBrief(keywords: string): Promise<string[]> {
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch suggestion from server");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Client Gemini Suggest Error:", error);
      return [];
    }
  }
};
