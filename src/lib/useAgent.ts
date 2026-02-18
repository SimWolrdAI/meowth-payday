"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AgentLog {
  time: string;
  prefix: string;
  message: string;
  cost?: string;
  type: string;
}

export interface CreditState {
  startingBudget: number;
  totalSpent: number;
  remaining: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  callCount: number;
}

export interface TradeEntry {
  time: string;
  pair: string;
  side: "BUY" | "SELL";
  pnl: string;
  pnlValue: number;
  apiCost: string;
  confidence: number;
}

export interface AgentState {
  isRunning: boolean;
  isAlive: boolean;
  cycleCount: number;
  credits: CreditState;
  logs: AgentLog[];
  trades: TradeEntry[];
  isConnected: boolean;
}

const DEFAULT_CREDITS: CreditState = {
  startingBudget: 20,
  totalSpent: 0,
  remaining: 20,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  callCount: 0,
};

export function useAgent() {
  const [state, setState] = useState<AgentState>({
    isRunning: false,
    isAlive: true,
    cycleCount: 0,
    credits: DEFAULT_CREDITS,
    logs: [],
    trades: [],
    isConnected: false,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/status");
      if (!res.ok) return;
      const data = await res.json();
      setState({
        isRunning: data.isRunning ?? false,
        isAlive: data.isAlive ?? true,
        cycleCount: data.cycleCount ?? 0,
        credits: data.credits ?? DEFAULT_CREDITS,
        logs: data.logs ?? [],
        trades: data.trades ?? [],
        isConnected: true,
      });
    } catch {
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, []);

  // Auto-poll every 3 seconds
  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchStatus]);

  return state;
}
