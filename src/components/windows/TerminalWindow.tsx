"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Window from "../desktop/Window";
import type { AgentLog } from "@/lib/useAgent";

interface TerminalWindowProps {
  logs?: AgentLog[];
  isLive?: boolean;
}

// Fallback when agent hasn't loaded yet
const IDLE_LOGS: AgentLog[] = [
  { time: "--:--:--", prefix: "SYS", message: "Connecting to agent...", type: "system" },
];

const prefixColors: Record<string, string> = {
  SCAN: "text-accent-blue",
  DATA: "text-text-secondary",
  THINK: "text-amber-600",
  MEOW: "text-accent-orange",
  MOOD: "text-sol-purple",
  EXEC: "text-accent-orange",
  TX: "text-text-muted",
  OK: "text-accent-green",
  FAIL: "text-accent-red",
  LOSS: "text-accent-red",
  SKIP: "text-text-muted",
  API: "text-sol-purple",
  SYS: "text-accent-blue",
  ERR: "text-accent-red",
  DEAD: "text-accent-red",
};

const typeColors: Record<string, string> = {
  scan: "text-accent-blue",
  data: "text-text-secondary",
  think: "text-amber-600",
  action: "text-accent-orange",
  success: "text-accent-green font-semibold",
  fail: "text-accent-red",
  info: "text-text-muted",
  system: "text-accent-blue",
};

export default function TerminalWindow({ logs, isLive = false }: TerminalWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayLogs = logs && logs.length > 0 ? logs : IDLE_LOGS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayLogs]);

  return (
    <Window title={`Terminal — ${isLive ? "Live" : "Idle"}`} noPadding>
      <div className="flex h-full flex-col bg-white">
        <div className="border-b border-border-subtle px-3 py-1.5 bg-bg-input">
          <span className="font-mono text-[11px] text-accent-green">meowth@solana</span>
          <span className="font-mono text-[11px] text-text-muted">:</span>
          <span className="font-mono text-[11px] text-accent-blue">~</span>
          <span className="font-mono text-[11px] text-text-muted">$ </span>
          <span className="font-mono text-[11px] text-text-primary">
            {isLive ? "agent --run --chain=solana --live" : "agent --idle"}
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1.5">
          <AnimatePresence initial={false}>
            {displayLogs.map((log, i) => (
              <motion.div
                key={`${log.time}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-1.5 py-[2px] font-mono text-[11px] leading-relaxed"
              >
                <span className="flex-shrink-0 text-text-muted">[{log.time}]</span>
                <span className={`flex-shrink-0 font-semibold ${prefixColors[log.prefix] || "text-text-muted"}`}>
                  [{log.prefix}]
                </span>
                <span className={`flex-1 ${typeColors[log.type] || "text-text-primary"}`}>
                  {log.message}
                </span>
                {log.cost && (
                  <span className="flex-shrink-0 text-text-muted text-[10px]">{log.cost}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex items-center gap-1 py-[2px] font-mono text-[11px]">
            <span className="text-accent-green">meowth@solana</span>
            <span className="text-text-muted">$ </span>
            <span className="cursor-blink inline-block h-3 w-1.5 bg-text-primary" />
          </div>
        </div>
      </div>
    </Window>
  );
}
