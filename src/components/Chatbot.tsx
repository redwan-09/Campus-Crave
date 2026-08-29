"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMsg {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "Where's my order?",
  "What payment methods work?",
  "How does delivery work?",
  "What's the pricing?",
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: "Hi! I'm the Campus-Crave assistant. Ask me about orders, tokens, payments, delivery, or pricing.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bot", text: data.reply ?? "Sorry, something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "I couldn't reach the server just now — please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[92vw] max-w-[360px] h-[480px] bg-white rounded-3xl shadow-2xl border border-line flex flex-col overflow-hidden animate-fade-up">
          <div className="bg-ink px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-leaf animate-pulse-dot" />
              <span className="font-display font-semibold text-cream text-sm">
                Campus-Crave Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-cream/60 hover:text-cream transition"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-periwinkle-tint/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed animate-slide-in ${
                    m.role === "user"
                      ? "bg-periwinkle text-white rounded-br-sm"
                      : "bg-white text-ink shadow-sm rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-pulse-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-pulse-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11.5px] font-semibold bg-white border border-line rounded-full px-3 py-1.5 hover:border-periwinkle hover:text-periwinkle-deep transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-line flex items-center gap-2 shrink-0 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none focus:border-periwinkle"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center disabled:opacity-40 shrink-0"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-ink text-cream shadow-lg flex items-center justify-center hover:-translate-y-1 transition-transform"
        aria-label="Toggle chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
