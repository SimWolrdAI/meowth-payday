"use client";

import { motion } from "framer-motion";
import Window from "../desktop/Window";

interface CreditsWindowProps {
  credits?: number;
  maxCredits?: number;
  totalSpent?: number;
  callCount?: number;
}

export default function CreditsWindow({
  credits = 20,
  maxCredits = 20,
  totalSpent = 0,
  callCount = 0,
}: CreditsWindowProps) {
  const pct = maxCredits > 0 ? (credits / maxCredits) * 100 : 0;
  const survivalScore = totalSpent > 0 ? (credits / totalSpent).toFixed(2) : "--";

  return (
    <Window title="Credits & Survival">
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-text-muted">API Credits</span>
            <span className="font-mono text-text-primary">${credits.toFixed(4)} / ${maxCredits.toFixed(2)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5">
            <motion.div
              className={`progress-shimmer h-full rounded-full ${
                pct > 50
                  ? "bg-gradient-to-r from-accent-green to-accent-teal"
                  : pct > 20
                  ? "bg-gradient-to-r from-accent-yellow to-accent-orange"
                  : "bg-gradient-to-r from-accent-red to-accent-orange"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
          <div className="mt-0.5 text-right font-mono text-[9px] text-text-muted">{pct.toFixed(1)}%</div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg bg-bg-input p-2">
            <div className="text-[9px] text-text-muted">Remaining</div>
            <div className={`font-mono text-xs font-semibold ${pct > 20 ? "text-accent-green" : "text-accent-red"}`}>
              ${credits.toFixed(4)}
            </div>
          </div>
          <div className="rounded-lg bg-bg-input p-2">
            <div className="text-[9px] text-text-muted">Spent</div>
            <div className="font-mono text-xs font-semibold text-accent-orange">${totalSpent.toFixed(4)}</div>
          </div>
          <div className="rounded-lg bg-bg-input p-2">
            <div className="text-[9px] text-text-muted">API Calls</div>
            <div className="font-mono text-xs font-semibold text-text-primary">{callCount}</div>
          </div>
          <div className="rounded-lg bg-bg-input p-2">
            <div className="text-[9px] text-text-muted">Avg Cost</div>
            <div className="font-mono text-xs font-semibold text-text-secondary">
              ${callCount > 0 ? (totalSpent / callCount).toFixed(5) : "0.00"}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-input p-2.5">
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${credits > 0 ? "bg-accent-green" : "bg-accent-red"}`}
                style={credits > 0 ? { animation: "pulse-alive 2s infinite" } : undefined}
              />
              <span className={`text-[11px] font-semibold ${credits > 0 ? "text-accent-green" : "text-accent-red"}`}>
                {credits > 0 ? "ALIVE" : "DEAD"}
              </span>
            </div>
            <span className="font-mono text-[10px] text-text-secondary">score: {survivalScore}x</span>
          </div>
          <div className="mt-1 text-[9px] text-text-muted">Dies if credits hit $0.00</div>
        </div>
      </div>
    </Window>
  );
}
