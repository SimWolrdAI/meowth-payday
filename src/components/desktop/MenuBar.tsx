"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MenuBarProps {
  credits: number;
  maxCredits: number;
  viewers: number;
  isAlive?: boolean;
  callCount?: number;
}

export default function MenuBar({
  credits,
  maxCredits,
  viewers,
  isAlive = true,
  callCount = 0,
}: MenuBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pct = maxCredits > 0 ? (credits / maxCredits) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-7 flex-shrink-0 items-center justify-between border-b border-border-window bg-bg-menubar px-4 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <span className="text-[12px] font-bold text-text-bright">MeowthPayDay</span>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${isAlive ? "bg-accent-green" : "bg-accent-red"}`}
            style={isAlive ? { animation: "pulse-alive 2s infinite" } : undefined}
          />
          <span className={`text-[10px] font-semibold ${isAlive ? "text-accent-green" : "text-accent-red"}`}>
            {isAlive ? "LIVE" : "DEAD"}
          </span>
        </div>
        <span className="hidden text-[10px] text-text-muted sm:inline">
          cycle #{callCount}
        </span>
        <a
          href="https://x.com/MeowthPay"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          X
        </a>
        <a
          href="https://github.com/meowthbot/meowth-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          GitHub
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText("EAqiBkhhQbB6onj9Z4X25gecFFEACkQA6ZEQ82ECpump");
          }}
          className="hidden sm:inline text-[10px] font-mono text-text-muted hover:text-text-primary transition-colors truncate max-w-[180px]"
          title="Click to copy CA"
        >
          CA: EAqiBkhhQbB6onj9Z4X25gecFFEACkQA6ZEQ82ECpump
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">credits</span>
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-black/8">
            <motion.div
              className={`h-full rounded-full ${
                pct > 50 ? "bg-accent-green" : pct > 20 ? "bg-accent-yellow" : "bg-accent-red"
              }`}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <span className="font-mono text-[11px] text-text-secondary">${credits.toFixed(4)}</span>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <span className="text-[10px] text-text-muted">live</span>
          <span className="font-mono text-[11px] text-text-secondary">{viewers.toLocaleString()}</span>
        </div>
        <span className="font-mono text-[11px] text-text-muted">{time}</span>
      </div>
    </motion.div>
  );
}
