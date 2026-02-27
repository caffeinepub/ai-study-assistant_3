const OPENAI_SYSTEM_PROMPT = `You are an intelligent AI Study Assistant. You help students with all subjects - math, science, history, geography, English, Hindi, and more. 
Respond in Hindi or Hinglish (mix of Hindi and English) - whichever language the user writes in.
Give clear, step-by-step explanations. For math, show all working steps.
Keep responses concise but complete. Use simple language students can understand.
Format key terms in bold using **text** syntax.`;

export async function callOpenAI(
  userMessage: string,
  imageData: string | null,
  apiKey: string
): Promise<string> {
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content:
      | string
      | Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }>;
  }> = [{ role: "system", content: OPENAI_SYSTEM_PROMPT }];

  if (imageData) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userMessage || "Please analyze this image." },
        { type: "image_url", image_url: { url: imageData, detail: "high" } },
      ],
    });
  } else {
    messages.push({ role: "user", content: userMessage });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message ?? errorMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI ne empty response bheja");
  }
  return content as string;
}
