"use client";

import { motion, AnimatePresence } from "framer-motion";
import Window from "../desktop/Window";
import type { TradeEntry } from "@/lib/useAgent";

interface TradeHistoryWindowProps {
  trades?: TradeEntry[];
}

export default function TradeHistoryWindow({ trades = [] }: TradeHistoryWindowProps) {
  // Show trades in reverse chronological order
  const sortedTrades = [...trades].reverse();

  const totalPnl = trades.reduce((sum, t) => sum + t.pnlValue, 0);
  const wins = trades.filter((t) => t.pnlValue > 0).length;
  const losses = trades.filter((t) => t.pnlValue <= 0).length;
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(0) : "0";

  return (
    <Window title="Trade History" noPadding headerRight={
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-text-muted">{trades.length} trades</span>
        {trades.length > 0 && (
          <span className={`font-mono text-[9px] font-semibold ${totalPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(4)}
          </span>
        )}
      </div>
    }>
      <div className="flex h-full flex-col">
        {/* Stats bar */}
        {trades.length > 0 && (
          <div className="flex items-center gap-3 border-b border-border-subtle px-3 py-1.5 bg-bg-input">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-text-muted">W/L:</span>
              <span className="font-semibold text-accent-green">{wins}</span>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-accent-red">{losses}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-text-muted">WR:</span>
              <span className="font-semibold text-text-primary">{winRate}%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-text-muted">Net:</span>
              <span className={`font-mono font-semibold ${totalPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Column headers */}
        <div className="grid grid-cols-5 gap-1 border-b border-border-subtle px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          <span>Time</span><span>Pair</span><span>Side</span><span className="text-right">P&L</span><span className="text-right">API $</span>
        </div>

        {/* Trade rows */}
        <div className="flex-1 overflow-y-auto">
          {sortedTrades.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="font-mono text-[11px] text-text-muted">No trades yet — agent is scanning...</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sortedTrades.map((trade, i) => (
                <motion.div
                  key={`${trade.time}-${trade.pair}-${i}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="grid grid-cols-5 gap-1 border-b border-border-subtle px-3 py-1.5 font-mono text-[11px] hover:bg-bg-input"
                >
                  <span className="text-text-muted">{trade.time}</span>
                  <span className="text-text-primary">{trade.pair}</span>
                  <span className={trade.side === "BUY" ? "text-accent-green" : "text-accent-orange"}>{trade.side}</span>
                  <span className={`text-right font-semibold ${trade.pnlValue >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {trade.pnl}
                  </span>
                  <span className="text-right text-text-muted">{trade.apiCost}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Window>
  );
}
