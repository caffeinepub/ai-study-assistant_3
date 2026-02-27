const GEMINI_SYSTEM_PROMPT = `You are an intelligent AI Study Assistant. You help students with all subjects - math, science, history, geography, English, Hindi, and more.
Respond in Hindi or Hinglish (mix of Hindi and English) - whichever language the user writes in.
Give clear, step-by-step explanations. For math, show all working steps.
Keep responses concise but complete. Use simple language students can understand.
Format key terms in bold using **text** syntax.`;

export async function callGemini(
  userMessage: string,
  imageData: string | null,
  apiKey: string
): Promise<string> {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

  if (imageData) {
    // Extract base64 data and mime type from data URL
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }
  }

  parts.push({ text: userMessage || "Please analyze this image." });

  const body = {
    system_instruction: {
      parts: [{ text: GEMINI_SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

  const model = imageData ? "gemini-1.5-flash" : "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message ?? errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("Gemini ne empty response bheja");
  }
  return content as string;
}
