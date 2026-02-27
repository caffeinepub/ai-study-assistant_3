import { useState } from "react";
import { MessageSquare, Timer } from "lucide-react";
import { Toaster } from "sonner";
import ChatPage from "./components/ChatPage";
import StudyMode from "./components/StudyMode";

type Tab = "chat" | "study";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* App Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary text-sm font-display font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold text-foreground leading-tight">
              AI Study Assistant
            </h1>
            <p className="text-xs text-muted-foreground font-body leading-tight">
              Smart learning companion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-body">Online</span>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "chat" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <ChatPage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "study" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <StudyMode />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex border-t border-border/50 bg-card/80 backdrop-blur-sm shrink-0 safe-area-bottom">
        <button
          type="button"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors font-body
            ${activeTab === "chat"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab("chat")}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === "chat" ? "bg-primary/15" : ""}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">Chat</span>
        </button>

        <button
          type="button"
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors font-body
            ${activeTab === "study"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab("study")}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${activeTab === "study" ? "bg-primary/15" : ""}`}>
            <Timer className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">Study Mode</span>
        </button>
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}
