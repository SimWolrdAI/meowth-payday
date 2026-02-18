// Claude API pricing (per token)
// Claude 3.5 Haiku:  $0.25 / 1M input, $1.25 / 1M output
// Claude 4 Sonnet:   $3 / 1M input, $15 / 1M output

const PRICING = {
  "claude-sonnet-4-20250514": { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  "claude-3-5-haiku-20241022": { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
} as const;

export type ModelId = keyof typeof PRICING;

export const DEFAULT_MODEL: ModelId = "claude-3-5-haiku-20241022";

export interface CreditUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  timestamp: number;
}

export interface CreditState {
  startingBudget: number;
  totalSpent: number;
  remaining: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  callCount: number;
  history: CreditUsage[];
}

// In-memory state
let state: CreditState = {
  startingBudget: parseFloat(process.env.AGENT_BUDGET || "20.00"),
  totalSpent: 0,
  remaining: parseFloat(process.env.AGENT_BUDGET || "20.00"),
  totalInputTokens: 0,
  totalOutputTokens: 0,
  callCount: 0,
  history: [],
};

let initialized = false;

// Restore state from Supabase on first access
export async function initCreditsFromDB(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("credit_state")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0 && !error) {
      const row = data[0];
      state.startingBudget = parseFloat(row.starting_budget);
      state.totalSpent = parseFloat(row.total_spent);
      state.remaining = parseFloat(row.remaining);
      state.totalInputTokens = parseInt(row.total_input_tokens);
      state.totalOutputTokens = parseInt(row.total_output_tokens);
      state.callCount = parseInt(row.call_count);
      console.log(`[CREDITS] Restored from DB: $${state.remaining.toFixed(4)} remaining, ${state.callCount} calls`);
    } else {
      console.log("[CREDITS] No DB state found, starting fresh with $" + state.startingBudget);
    }
  } catch (err) {
    console.log("[CREDITS] DB init failed, using defaults:", err);
  }
}

export function getCreditState(): CreditState {
  return { ...state, history: [...state.history.slice(-50)] };
}

export function recordUsage(
  model: ModelId,
  inputTokens: number,
  outputTokens: number
): CreditUsage {
  const pricing = PRICING[model] || PRICING[DEFAULT_MODEL];
  const cost = inputTokens * pricing.input + outputTokens * pricing.output;

  const usage: CreditUsage = {
    inputTokens,
    outputTokens,
    costUsd: cost,
    model,
    timestamp: Date.now(),
  };

  state.totalSpent += cost;
  state.remaining = state.startingBudget - state.totalSpent;
  state.totalInputTokens += inputTokens;
  state.totalOutputTokens += outputTokens;
  state.callCount += 1;
  state.history.push(usage);

  if (state.history.length > 200) {
    state.history = state.history.slice(-200);
  }

  return usage;
}

export function isAlive(): boolean {
  return state.remaining > 0;
}

export function resetCredits(): void {
  state = {
    startingBudget: parseFloat(process.env.AGENT_BUDGET || "20.00"),
    totalSpent: 0,
    remaining: parseFloat(process.env.AGENT_BUDGET || "20.00"),
    totalInputTokens: 0,
    totalOutputTokens: 0,
    callCount: 0,
    history: [],
  };
}
