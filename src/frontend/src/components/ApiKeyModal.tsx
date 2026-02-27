import { useState } from "react";
import { Eye, EyeOff, Key, ExternalLink, Trash2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AIProvider = "openai" | "gemini";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (provider: AIProvider, key: string) => void;
  currentProvider: AIProvider;
  openaiKey: string;
  geminiKey: string;
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****...****";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export default function ApiKeyModal({
  open,
  onClose,
  onSave,
  currentProvider,
  openaiKey,
  geminiKey,
}: ApiKeyModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(currentProvider);
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);

  const savedKey = selectedProvider === "openai" ? openaiKey : geminiKey;
  const isEditing = editing || !savedKey;

  const handleProviderChange = (p: AIProvider) => {
    setSelectedProvider(p);
    setInputValue("");
    setEditing(false);
    setShowKey(false);
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSave(selectedProvider, trimmed);
    setInputValue("");
    setEditing(false);
    onClose();
  };

  const handleClear = () => {
    onSave(selectedProvider, "");
    setInputValue("");
    setEditing(false);
  };

  const handleClose = () => {
    setInputValue("");
    setShowKey(false);
    setEditing(false);
    onClose();
  };

  const providerInfo = {
    openai: {
      name: "ChatGPT (OpenAI)",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      activeBg: "bg-emerald-500/20 border-emerald-400",
      placeholder: "sk-...",
      docsUrl: "platform.openai.com",
      hint: "platform.openai.com → API keys → Create new secret key",
      logo: "🤖",
    },
    gemini: {
      name: "Gemini (Google)",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
      activeBg: "bg-blue-500/20 border-blue-400",
      placeholder: "AIza...",
      docsUrl: "aistudio.google.com",
      hint: "aistudio.google.com → Get API key → Create API key",
      logo: "✨",
    },
  };

  const info = providerInfo[selectedProvider];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border border-border/60 shadow-card-raised">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            AI Provider Setup
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            ChatGPT ya Gemini — apna preferred AI chunein aur API key enter karein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Provider Selector */}
          <div className="grid grid-cols-2 gap-2">
            {(["openai", "gemini"] as AIProvider[]).map((p) => {
              const pi = providerInfo[p];
              const isActive = selectedProvider === p;
              const hasKey = p === "openai" ? !!openaiKey : !!geminiKey;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                    ${isActive ? pi.activeBg : pi.bg} hover:opacity-90`}
                >
                  <span className="text-2xl">{pi.logo}</span>
                  <span className={`text-xs font-semibold ${isActive ? pi.color : "text-muted-foreground"}`}>
                    {pi.name}
                  </span>
                  {hasKey && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Key Input / Display */}
          {savedKey && !isEditing ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${info.bg}`}>
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">{info.name} — API Key</p>
                  <p className="text-sm font-mono text-foreground">{maskKey(savedKey)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="flex-1 border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
                >
                  Change Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="api-key-input" className="text-sm text-foreground/80">
                  {info.name} API Key
                </Label>
                <div className="relative">
                  <Input
                    id="api-key-input"
                    type={showKey ? "text" : "password"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={info.placeholder}
                    className="pr-10 bg-secondary/40 border-border/60 focus:border-primary/60 focus:ring-primary/30 font-mono text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {savedKey && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="flex-1 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Key
                </Button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="pt-2 border-t border-border/40 space-y-1">
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <span className={`font-medium ${info.color}`}>{info.name}</span> key kaise milegi:{" "}
                <span className="text-primary/80">{info.hint}</span>
              </span>
            </p>
            <p className="text-xs text-muted-foreground/60 pl-5">
              Key sirf aapke browser mein save hogi — kisi server pe nahi jaati.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
