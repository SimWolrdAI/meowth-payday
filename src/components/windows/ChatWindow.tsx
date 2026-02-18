"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import Window from "../desktop/Window";
import { useChat } from "@/lib/useChat";

export default function ChatWindow() {
  const { messages, isConnected, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  // Format time from ISO timestamp
  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "--:--";
    }
  };

  return (
    <Window title="Live Chat" noPadding headerRight={
      <div className="flex items-center gap-1">
        <div
          className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-accent-green" : "bg-accent-red"}`}
          style={isConnected ? { animation: "pulse-alive 2s infinite" } : undefined}
        />
      </div>
    }>
      <div className="flex h-full flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1.5">
          {messages.length === 0 && (
            <div className="py-4 text-center text-[11px] text-text-muted">
              {isConnected ? "No messages yet. Be the first to chat!" : "Connecting to chat..."}
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="py-[1px] text-[11px] leading-relaxed"
              >
                <span className="text-text-muted">{formatTime(msg.created_at)} </span>
                <span className={`font-semibold ${msg.color || "text-accent-blue"}`}>{msg.username}</span>
                <span className="text-text-muted">: </span>
                <span className="text-text-secondary">{msg.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1.5 border-t border-border-subtle px-2.5 py-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Say something..."
            className="flex-1 rounded-md bg-bg-input px-2.5 py-1.5 text-[11px] text-text-primary placeholder-text-muted outline-none focus:ring-1 focus:ring-accent-blue/30"
          />
          <button onClick={handleSend} className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20">
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </Window>
  );
}
