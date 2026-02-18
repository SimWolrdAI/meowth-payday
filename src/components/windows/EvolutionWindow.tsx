"use client";

import { motion } from "framer-motion";
import Window from "../desktop/Window";

const LEVELS = [
  { name: "Kitten", threshold: 0, label: "I" },
  { name: "Street Cat", threshold: 50, label: "II" },
  { name: "Hustler", threshold: 200, label: "III" },
  { name: "Legend", threshold: 1000, label: "IV" },
];

export default function EvolutionWindow({ currentProfit = 23.47 }: { currentProfit?: number }) {
  let currentLevel = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentProfit >= LEVELS[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const current = LEVELS[currentLevel];
  const next = LEVELS[currentLevel + 1];
  const progressPct = next
    ? ((currentProfit - current.threshold) / (next.threshold - current.threshold)) * 100
    : 100;

  return (
    <Window title="Evolution">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {LEVELS.map((level, i) => (
            <div key={level.name} className="flex flex-col items-center gap-0.5">
              <motion.div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  i <= currentLevel ? "bg-orange-100" : "bg-bg-input"
                }`}
                animate={i === currentLevel ? { scale: [1, 1.1, 1] } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] font-bold">{level.label}</span>
              </motion.div>
              <span className={`text-[8px] font-medium ${i <= currentLevel ? "text-accent-orange" : "text-text-muted"}`}>
                {level.name}
              </span>
              <span className="font-mono text-[7px] text-text-muted">${level.threshold}</span>
            </div>
          ))}
        </div>

        <div className="relative h-1 rounded-full bg-black/5 mx-4">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-orange to-accent-yellow progress-shimmer"
            initial={{ width: 0 }}
            animate={{ width: `${((currentLevel / (LEVELS.length - 1)) * 100) + (progressPct / (LEVELS.length - 1))}%` }}
            transition={{ duration: 2 }}
          />
        </div>

        <div className="rounded-lg bg-bg-input p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold">{current.label}</span>
              <span className="text-[11px] font-bold text-accent-orange">LVL {currentLevel + 1} — {current.name}</span>
            </div>
            <span className="font-mono text-[10px] text-text-secondary">${currentProfit.toFixed(2)}</span>
          </div>
          {next && (
            <>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-orange to-accent-yellow progress-shimmer"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPct, 100)}%` }}
                  transition={{ duration: 2 }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px]">
                <span className="text-text-muted">Next: {next.label} {next.name}</span>
                <span className="font-mono text-text-muted">${currentProfit.toFixed(2)} / ${next.threshold}</span>
              </div>
              <div className="mt-1 text-[9px] text-text-muted">Unlocks: Multi-pair, leverage detection, bigger sizes</div>
            </>
          )}
        </div>
      </div>
    </Window>
  );
}
