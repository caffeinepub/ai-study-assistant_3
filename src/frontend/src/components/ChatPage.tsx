import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, FileDown, X, Bot, User, Loader2, Sparkles, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateAIResponse } from "../utils/aiResponses";
import { callOpenAI } from "../utils/openaiService";
import { callGemini } from "../utils/geminiService";
import ApiKeyModal, { type AIProvider } from "./ApiKeyModal";
import { exportChatToPDF, type ChatMessageForPDF } from "../utils/pdfExport";
import { useGetChatHistory, useCreateChatSession, useAddMessage } from "../hooks/useQueries";

interface LocalMessage {
  id: string;
  sender: string;
  content: string;
  isAI: boolean;
  imagePreview?: string;
  imageData?: string;
  timestamp: Date;
}

const SESSION_ID_KEY = "ai-study-session-id";
const OPENAI_KEY_STORAGE = "openai-api-key";
const GEMINI_KEY_STORAGE = "gemini-api-key";
const PROVIDER_STORAGE = "ai-provider";

// Default Gemini key (pre-configured)
const DEFAULT_GEMINI_KEY = "AIzaSyAkFl-5AAUM1zzcCqKV5WW6VYPYiZyy7ok";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "ChatGPT",
  gemini: "Gemini",
};

export default function ChatPage() {
  const sessionId = useRef(getOrCreateSessionId());
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ preview: string; data: string } | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const [provider, setProvider] = useState<AIProvider>(
    () => (localStorage.getItem(PROVIDER_STORAGE) as AIProvider) || "gemini"
  );
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem(OPENAI_KEY_STORAGE) || "");
  const [geminiKey, setGeminiKey] = useState(() => {
    const stored = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (!stored) {
      // Pre-fill default key
      localStorage.setItem(GEMINI_KEY_STORAGE, DEFAULT_GEMINI_KEY);
      return DEFAULT_GEMINI_KEY;
    }
    return stored;
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: chatHistory } = useGetChatHistory(sessionId.current);
  const createSession = useCreateChatSession();
  const addMessage = useAddMessage();

  const currentKey = provider === "openai" ? openaiKey : geminiKey;
  const isConnected = !!currentKey;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Initialize session and load history
  useEffect(() => {
    if (!sessionInitialized) {
      createSession.mutate(sessionId.current, {
        onSettled: () => setSessionInitialized(true),
      });
    }
  }, [sessionInitialized, createSession]);

  // Load chat history from backend
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && messages.length === 0) {
      const loadedMessages: LocalMessage[] = chatHistory.map((msg) => ({
        id: crypto.randomUUID(),
        sender: msg.sender,
        content: msg.content,
        isAI: msg.isAI,
        imageData: msg.imageData ?? undefined,
        timestamp: msg.timestamp ? new Date(Number(msg.timestamp / 1_000_000n)) : new Date(),
      }));
      setMessages(loadedMessages);
    }
  }, [chatHistory, messages.length]);

  // Add welcome message if no messages
  useEffect(() => {
    if (sessionInitialized && messages.length === 0 && (!chatHistory || chatHistory.length === 0)) {
      const welcome: LocalMessage = {
        id: crypto.randomUUID(),
        sender: "AI Study Assistant",
        content: "Namaste! Main aapka AI Study Assistant hoon.\n\nAap mujhse koi bhi sawal poochh sakte hain:\n- **Math**: 2+2, algebra, geometry, trigonometry\n- **Science**: Photosynthesis, Newton's law, chemistry, biology\n- **History**: Mughal empire, Indian independence\n- **Geography**: Rivers, mountains, climate\n- **GK**: India ke PM, President, national symbols\n- **Computer**: Hardware, software, internet\n\nReal AI (ChatGPT / Gemini) ke liye upar **Key** button dabao aur apna API key add karo.",
        isAI: true,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [sessionInitialized, messages.length, chatHistory]);

  // Auto-scroll whenever messages or typing changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setSelectedImage({ preview: dataUrl, data: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content && !selectedImage) return;

    const userMsg: LocalMessage = {
      id: crypto.randomUUID(),
      sender: "You",
      content: content || "Please analyze this image.",
      isAI: false,
      imagePreview: selectedImage?.preview,
      imageData: selectedImage?.data,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Save user message to backend
    addMessage.mutate({
      sessionId: sessionId.current,
      sender: "user",
      content: userMsg.content,
      imageData: userMsg.imageData ?? null,
      isAI: false,
    });

    setIsTyping(true);

    let aiContent: string;

    if (currentKey) {
      try {
        if (provider === "openai") {
          aiContent = await callOpenAI(userMsg.content, userMsg.imageData || null, currentKey);
        } else {
          aiContent = await callGemini(userMsg.content, userMsg.imageData || null, currentKey);
        }
        toast.success(`${PROVIDER_LABELS[provider]} se jawab aa gaya!`, { id: "ai-connected" });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`${PROVIDER_LABELS[provider]} jawab nahi de saka: ${errMsg}`, {
          description: "Fallback use ho raha hai",
        });
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));
        aiContent = generateAIResponse(userMsg.content, !!userMsg.imageData);
      }
    } else {
      // No API key — smart fallback
      const thinkTime = 600 + Math.random() * 1200;
      await new Promise((resolve) => setTimeout(resolve, thinkTime));
      aiContent = generateAIResponse(userMsg.content, !!userMsg.imageData);
    }

    const aiMsg: LocalMessage = {
      id: crypto.randomUUID(),
      sender: "AI Study Assistant",
      content: aiContent,
      isAI: true,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);

    addMessage.mutate({
      sessionId: sessionId.current,
      sender: "ai",
      content: aiContent,
      imageData: null,
      isAI: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportPDF = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const pdfMessages: ChatMessageForPDF[] = messages.map((m) => ({
      sender: m.sender,
      content: m.content,
      isAI: m.isAI,
    }));
    exportChatToPDF(pdfMessages, sessionId.current);
    toast.success("Opening PDF export...", { description: "Use browser Print → Save as PDF" });
  };

  const handleApiKeySave = (prov: AIProvider, key: string) => {
    if (prov === "openai") {
      localStorage.setItem(OPENAI_KEY_STORAGE, key);
      setOpenaiKey(key);
    } else {
      localStorage.setItem(GEMINI_KEY_STORAGE, key);
      setGeminiKey(key);
    }
    // Switch provider to whichever was just saved (if key added)
    if (key) {
      setProvider(prov);
      localStorage.setItem(PROVIDER_STORAGE, prov);
      toast.success(`${PROVIDER_LABELS[prov]} connected!`);
    } else {
      toast.info(`${PROVIDER_LABELS[prov]} key remove ho gaya`);
    }
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const innerText = part.slice(2, -2);
          return <strong key={`bold-${lineIdx}-${partIdx}`} className="font-semibold">{innerText}</strong>;
        }
        return <span key={`text-${lineIdx}-${partIdx}`}>{part}</span>;
      });
      return (
        <span key={`line-${lineIdx}`}>
          {rendered}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  // Provider badge color
  const providerBadge = {
    openai: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    gemini: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 glass shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-body">
            {messages.filter((m) => !m.isAI).length} messages
          </span>
          {isConnected && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${providerBadge[provider]}`}>
              <CheckCircle2 className="w-3 h-3" />
              {PROVIDER_LABELS[provider]}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* AI toggle — if both keys present */}
          {openaiKey && geminiKey && (
            <button
              type="button"
              onClick={() => {
                const next: AIProvider = provider === "openai" ? "gemini" : "openai";
                setProvider(next);
                localStorage.setItem(PROVIDER_STORAGE, next);
                toast.info(`Switched to ${PROVIDER_LABELS[next]}`);
              }}
              className={`text-xs px-2 py-1 rounded-lg border transition-colors font-body ${providerBadge[provider]}`}
              title="Switch AI provider"
            >
              Switch AI
            </button>
          )}
          {/* API Key button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowApiKeyModal(true)}
            className={`h-8 w-8 transition-colors ${
              isConnected
                ? "text-green-400 hover:text-green-300 hover:bg-green-400/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
            title="Setup AI API key"
          >
            <Key className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-1.5 text-xs border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="py-4 space-y-4 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.isAI ? "" : "flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${msg.isAI
                    ? "bg-primary/20 border border-primary/40"
                    : "bg-accent/20 border border-accent/40"
                  }`}
              >
                {msg.isAI ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-accent" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.isAI ? "" : "items-end flex flex-col"}`}>
                <div className={`text-xs mb-1 font-medium ${msg.isAI ? "text-primary/80" : "text-accent/80 text-right"}`}>
                  {msg.isAI ? "AI Study Assistant" : "You"}
                  <span className="ml-2 text-muted-foreground font-normal">
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.imagePreview && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-border/50 max-w-xs">
                    <img
                      src={msg.imagePreview}
                      alt="Uploaded"
                      className="w-full h-auto max-h-48 object-cover"
                    />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-body
                    ${msg.isAI
                      ? "bg-card border border-border/60 text-foreground rounded-tl-sm shadow-card-raised"
                      : "bg-primary text-primary-foreground rounded-tr-sm shadow-glow-cyan"
                    }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 border border-primary/40">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-tl-sm shadow-card-raised">
                <div className="flex items-center gap-1.5 h-5">
                  <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                </div>
              </div>
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Preview Bar */}
      {selectedImage && (
        <div className="px-4 py-2 border-t border-border/40 glass shrink-0">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <div className="relative">
              <img
                src={selectedImage.preview}
                alt="Selected"
                className="w-16 h-16 object-cover rounded-lg border border-border/60"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                type="button"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Image ready to send</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border/40 glass shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10 border-border/60 hover:border-primary/60 hover:bg-primary/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
          >
            <ImagePlus className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Koi bhi sawal poochho... (Shift+Enter for new line)"
              className="min-h-[42px] max-h-32 resize-none bg-secondary/40 border-border/60 focus:border-primary/60 focus:ring-primary/30 font-body text-sm pr-2 py-2.5 placeholder:text-muted-foreground/60 rounded-xl"
              rows={1}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedImage) || isTyping}
            size="icon"
            className="shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all disabled:opacity-40 shadow-glow-cyan"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-2 font-body">
          {isConnected ? (
            <>Powered by <span className="font-medium">{PROVIDER_LABELS[provider]}</span></>
          ) : (
            <>
              ChatGPT ya Gemini ke liye API key add karein —{" "}
              <button
                type="button"
                onClick={() => setShowApiKeyModal(true)}
                className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors cursor-pointer"
              >
                Setup karo
              </button>
            </>
          )}
        </p>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
        currentProvider={provider}
        openaiKey={openaiKey}
        geminiKey={geminiKey}
      />
    </div>
  );
}
