"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import Window from "../desktop/Window";
import type { TradeEntry } from "@/lib/useAgent";

interface WalletWindowProps {
  trades?: TradeEntry[];
  credits?: number;
  maxCredits?: number;
}

export default function WalletWindow({ trades = [], credits = 20, maxCredits = 20 }: WalletWindowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("7xR2aBcDeFgHiJkLmNoPqRsTuVwXyZkP4f");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Calculate real stats from trades
  const totalPnl = trades.reduce((sum, t) => sum + t.pnlValue, 0);
  const totalApiCost = trades.reduce((sum, t) => {
    const cost = parseFloat(t.apiCost.replace("$", "")) || 0;
    return sum + cost;
  }, 0);
  const netProfit = totalPnl - totalApiCost;
  const wins = trades.filter((t) => t.pnlValue > 0).length;
  const losses = trades.filter((t) => t.pnlValue <= 0).length;

  return (
    <Window title="Wallet">
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="flex w-full items-center gap-2 rounded-lg bg-bg-input px-2.5 py-1.5 font-mono text-[11px] text-sol-purple transition-colors hover:bg-bg-input-hover"
        >
          <span className="text-xs">SOL</span>
          <span>7xR2...kP4f</span>
          {copied ? (
            <span className="ml-auto text-accent-green text-[10px]">done</span>
          ) : (
            <Copy className="ml-auto h-3 w-3 text-text-muted" />
          )}
        </button>

        {/* Trading P&L breakdown */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between rounded px-2 py-1 text-[11px] hover:bg-bg-input">
            <span className="text-text-muted">Trade P&L</span>
            <span className={`font-mono font-semibold ${totalPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded px-2 py-1 text-[11px] hover:bg-bg-input">
            <span className="text-text-muted">API Costs</span>
            <span className="font-mono text-accent-red">-${totalApiCost.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between rounded px-2 py-1 text-[11px] hover:bg-bg-input">
            <span className="text-text-muted">Net Profit</span>
            <span className={`font-mono font-semibold ${netProfit >= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-2 space-y-0.5 px-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Credits Left</span>
            <span className="font-mono font-semibold text-text-bright">${credits.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Started With</span>
            <span className="font-mono text-text-secondary">${maxCredits.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">W / L</span>
            <span className="font-mono text-text-secondary">
              <span className="text-accent-green">{wins}</span> / <span className="text-accent-red">{losses}</span>
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}
