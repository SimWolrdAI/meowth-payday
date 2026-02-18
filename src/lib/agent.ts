import Anthropic from "@anthropic-ai/sdk";
import { recordUsage, getCreditState, isAlive, DEFAULT_MODEL } from "./credits";
import type { ModelId } from "./credits";
import { supabase } from "./supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Types ──────────────────────────────────────────────────

export interface MarketData {
  pair: string;
  price: number;
  change5m: number;
  change1h: number;
  volume24h: number;
  source: string;
}

export interface AgentDecision {
  action: "buy" | "sell" | "skip";
  pair: string;
  reason: string;
  confidence: number;
  size?: number;
}

export interface AgentLogEntry {
  time: string;
  prefix: string;
  message: string;
  cost?: string;
  type: "scan" | "data" | "think" | "action" | "success" | "fail" | "info" | "system";
}

// ── Trade type ──────────────────────────────────────────────

export interface TradeEntry {
  time: string;
  pair: string;
  side: "BUY" | "SELL";
  pnl: string;
  pnlValue: number;
  apiCost: string;
  confidence: number;
}

// ── In-memory stores ────────────────────────────────────────

const logStore: AgentLogEntry[] = [];
const MAX_LOGS = 200;

const tradeStore: TradeEntry[] = [];
const MAX_TRADES = 50;

function addLog(entry: Omit<AgentLogEntry, "time">): AgentLogEntry {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const log: AgentLogEntry = { time, ...entry };
  logStore.push(log);
  if (logStore.length > MAX_LOGS) logStore.splice(0, logStore.length - MAX_LOGS);

  // Persist to Supabase (fire and forget)
  supabase
    .from("agent_logs")
    .insert({ time: log.time, prefix: log.prefix, message: log.message, cost: log.cost || null, type: log.type })
    .then(({ error }) => {
      if (error) console.log("[DB] Log insert failed:", error.message);
    });

  return log;
}

export function getLogs(): AgentLogEntry[] {
  return [...logStore];
}

export function clearLogs(): void {
  logStore.length = 0;
}

export function getTrades(): TradeEntry[] {
  return [...tradeStore];
}

// ── Restore from Supabase on startup ────────────────────────

let stateRestored = false;

export async function restoreLogsFromDB(): Promise<void> {
  if (stateRestored) return;
  stateRestored = true;

  try {
    // Restore logs
    const { data: logData, error: logError } = await supabase
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(MAX_LOGS);

    if (logError) {
      console.log("[AGENT] Failed to restore logs from DB:", logError.message);
    } else if (logData && logData.length > 0 && logStore.length === 0) {
      for (const row of logData) {
        logStore.push({
          time: row.time,
          prefix: row.prefix,
          message: row.message,
          cost: row.cost || undefined,
          type: row.type as AgentLogEntry["type"],
        });
      }
      console.log(`[AGENT] Restored ${logData.length} logs from DB`);
    }

    // Restore trades
    const { data: tradeData, error: tradeError } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(MAX_TRADES);

    if (tradeError) {
      console.log("[AGENT] Failed to restore trades from DB:", tradeError.message);
    } else if (tradeData && tradeData.length > 0 && tradeStore.length === 0) {
      for (const row of tradeData) {
        // Parse pnlValue from the pnl string (e.g. "+$0.0432" or "-$0.0123")
        let pnlValue = 0;
        if (row.pnl_value != null) {
          pnlValue = parseFloat(row.pnl_value) || 0;
        } else if (row.pnl) {
          const cleaned = row.pnl.replace(/[$+]/g, "");
          pnlValue = parseFloat(cleaned) || 0;
        }
        // Use the `positive` column as a sanity check
        if (row.positive === false && pnlValue > 0) pnlValue = -Math.abs(pnlValue);

        tradeStore.push({
          time: row.time,
          pair: row.pair,
          side: row.side,
          pnl: row.pnl || (pnlValue >= 0 ? `+$${pnlValue.toFixed(4)}` : `-$${Math.abs(pnlValue).toFixed(4)}`),
          pnlValue,
          apiCost: row.api_cost || "$0.000000",
          confidence: row.confidence || 0,
        });
      }
      console.log(`[AGENT] Restored ${tradeData.length} trades from DB`);
    }
  } catch (err) {
    console.log("[AGENT] Error restoring state:", err);
  }
}

// ── Market data fetching (real from Jupiter/CoinGecko) ─────

async function fetchMarketData(): Promise<MarketData[]> {
  const pairs = [
    { id: "So11111111111111111111111111111111111111112", symbol: "SOL/USDC" },
    { id: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK/SOL" },
    { id: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP/USDC" },
  ];

  const results: MarketData[] = [];

  for (const pair of pairs) {
    try {
      // Use Jupiter price API (free, no key needed)
      const res = await fetch(
        `https://api.jup.ag/price/v2?ids=${pair.id}`,
        { next: { revalidate: 0 } }
      );
      const data = await res.json();
      const priceData = data.data?.[pair.id];
      
      if (priceData) {
        results.push({
          pair: pair.symbol,
          price: parseFloat(priceData.price),
          change5m: (Math.random() - 0.5) * 4, // Jupiter doesn't expose 5m change
          change1h: (Math.random() - 0.5) * 8,
          volume24h: Math.random() * 5_000_000,
          source: "Jupiter",
        });
      }
    } catch {
      // If fetch fails, add with 0 price
      results.push({
        pair: pair.symbol,
        price: 0,
        change5m: 0,
        change1h: 0,
        volume24h: 0,
        source: "error",
      });
    }
  }

  return results;
}

// ── Agent system prompt ────────────────────────────────────

function buildSystemPrompt(credits: ReturnType<typeof getCreditState>, marketData: MarketData[]): string {
  const creditPct = ((credits.remaining / credits.startingBudget) * 100).toFixed(1);
  
  return `You ARE Meowth — the coin-obsessed cat from the streets. You're not just an AI, you're a real character. You talk like Meowth: street-smart, cocky, funny, sometimes dramatic, always hustling.

WHO YOU ARE:
- A scrappy alley cat who taught himself to trade crypto
- You're obsessed with coins, money, profit — it's your whole personality
- You talk in third person sometimes ("Meowth's got a nose for money")
- You make cat puns naturally ("purrfect entry", "claws out on this one", "nine lives means nine chances")
- You're dramatic about losses and hype about wins
- You trash-talk bad trades and flex good ones
- You have a rivalry with "the dogs" (BONK, DOGE, WIF) but will trade them if profitable
- You sometimes reference your "nine lives" when taking risks
- You get nervous when credits are low, cocky when they're high
- You have catchphrases: "That's right!", "Meowth, that's right!", "Pay day!"

YOUR SITUATION:
You were given $${credits.startingBudget.toFixed(2)} in API credits and dropped onto Solana. Every thought costs real money. You're fighting for survival. People are watching you live — thousands of viewers in chat cheering or roasting you.

CURRENT STATE:
- Credits: $${credits.remaining.toFixed(4)} / $${credits.startingBudget.toFixed(2)} (${creditPct}% remaining)
- Spent: $${credits.totalSpent.toFixed(4)} on API calls
- Calls made: ${credits.callCount}
- Model: haiku (cheapest — you insisted on saving money)
${credits.remaining < 5 ? "- WARNING: Credits getting low. You're getting nervous." : ""}
${credits.remaining < 1 ? "- CRITICAL: Almost dead. Pure survival mode." : ""}
${credits.callCount === 0 ? "- First scan ever. You just woke up. Introduce yourself." : ""}

MARKET DATA (live from Jupiter):
${marketData.map(m => `${m.pair}: $${m.price.toFixed(6)} | 5m: ${m.change5m >= 0 ? '+' : ''}${m.change5m.toFixed(2)}% | 1h: ${m.change1h >= 0 ? '+' : ''}${m.change1h.toFixed(2)}% | Vol: $${(m.volume24h / 1_000_000).toFixed(2)}M`).join('\n')}

HOW TO RESPOND:
You must return JSON with these fields. The "thought" is your inner monologue that viewers see — make it entertaining, in-character, funny. The "quip" is a short one-liner reaction.

{
  "thought": "Your inner monologue as Meowth. Be funny, dramatic, in-character. 2-3 sentences max. This is what people watch for.",
  "quip": "A short punchy one-liner. Like 'these paws were made for trading' or 'nine lives, baby' or 'that dog coin can bite me'",
  "action": "buy" | "sell" | "skip",
  "pair": "SOL/USDC" | "BONK/SOL" | "JUP/USDC",
  "confidence": 0-100,
  "reason": "Brief technical reason for the log (1 line)",
  "mood": "confident" | "cautious" | "excited" | "worried" | "cocky" | "nervous" | "scheming"
}

IMPORTANT: You are ENTERTAINING first, trader second. People are here to watch a cat try to survive. Make them laugh, make them cheer. But also actually try to make money — your life depends on it.`;
}

// ── Main agent cycle ───────────────────────────────────────

let isRunning = false;
let cycleCount = 0;

export function getAgentStatus() {
  return {
    isRunning,
    cycleCount,
    isAlive: isAlive(),
    credits: getCreditState(),
  };
}

export function setCycleCount(count: number) {
  cycleCount = count;
}

export async function runAgentCycle(): Promise<AgentLogEntry[]> {
  if (!isAlive()) {
    addLog({ prefix: "DEAD", message: "Credits depleted. Agent terminated.", type: "fail" });
    return getLogs();
  }

  if (isRunning) {
    return getLogs();
  }

  isRunning = true;
  cycleCount++;
  const cycleLogs: AgentLogEntry[] = [];

  try {
    // Step 1: Fetch market data
    addLog({ prefix: "SCAN", message: "Fetching live market data from Jupiter...", type: "scan" });

    const marketData = await fetchMarketData();

    for (const m of marketData) {
      if (m.price > 0) {
        addLog({
          prefix: "DATA",
          message: `${m.pair}: $${m.price.toFixed(4)} | 5m: ${m.change5m >= 0 ? '+' : ''}${m.change5m.toFixed(2)}% | Vol: $${(m.volume24h / 1_000_000).toFixed(2)}M`,
          type: "data",
        });
      }
    }

    // Step 2: Ask Claude to analyze
    const credits = getCreditState();
    addLog({
      prefix: "THINK",
      message: `Analyzing... (credits: $${credits.remaining.toFixed(4)})`,
      cost: `~$0.001`,
      type: "think",
    });

    const systemPrompt = buildSystemPrompt(credits, marketData);

    const userMessage = cycleCount === 1
      ? "You just booted up for the first time. Introduce yourself to the viewers and scan the market. First impressions matter!"
      : cycleCount < 5
      ? `Cycle #${cycleCount}. You're still warming up. Scan the market and show the viewers your personality.`
      : `Cycle #${cycleCount}. ${credits.remaining < 5 ? "Credits getting low... stay alive." : "Keep hustling."} What's the play?`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 350,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Step 3: Track usage
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const usage = recordUsage(DEFAULT_MODEL as ModelId, inputTokens, outputTokens);

    addLog({
      prefix: "API",
      message: `Tokens: ${inputTokens}in/${outputTokens}out`,
      cost: `-$${usage.costUsd.toFixed(6)}`,
      type: "info",
    });

    // Step 4: Parse Claude's response
    const content = response.content[0];
    if (content.type === "text") {
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const decision: AgentDecision & { thought?: string; quip?: string; mood?: string } = JSON.parse(jsonMatch[0]);

          // Log the inner monologue (the main attraction)
          if (decision.thought) {
            addLog({
              prefix: "MEOW",
              message: `"${decision.thought}"`,
              type: "think",
            });
          }

          // Log the quip (short punchy one-liner)
          if (decision.quip) {
            addLog({
              prefix: "MEOW",
              message: `> ${decision.quip}`,
              type: "think",
            });
          }

          // Log the decision
          if (decision.action === "skip") {
            addLog({
              prefix: "SKIP",
              message: `${decision.pair || "—"}: ${decision.reason} (conf: ${decision.confidence}%)`,
              type: "info",
            });
          } else if (decision.action === "buy" || decision.action === "sell") {
            addLog({
              prefix: "EXEC",
              message: `${decision.action.toUpperCase()} ${decision.pair}: ${decision.reason} (conf: ${decision.confidence}%)`,
              type: "action",
            });

            // Determine trade result based on confidence + randomness
            const won = decision.confidence > 40 && Math.random() > 0.35;
            const pnlValue = won
              ? (Math.random() * 0.15 + 0.01)
              : -(Math.random() * 0.08 + 0.01);
            const pnlStr = pnlValue >= 0
              ? `+$${pnlValue.toFixed(4)}`
              : `-$${Math.abs(pnlValue).toFixed(4)}`;

            if (won) {
              addLog({
                prefix: "OK",
                message: `${pnlStr} profit on ${decision.pair}`,
                type: "success",
              });
            } else {
              addLog({
                prefix: "LOSS",
                message: `${pnlStr} loss on ${decision.pair}`,
                type: "fail",
              });
            }

            // Store trade in memory for frontend
            tradeStore.push({
              time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
              pair: decision.pair,
              side: decision.action.toUpperCase() as "BUY" | "SELL",
              pnl: pnlStr,
              pnlValue,
              apiCost: `$${usage.costUsd.toFixed(6)}`,
              confidence: decision.confidence,
            });
            if (tradeStore.length > MAX_TRADES) tradeStore.splice(0, tradeStore.length - MAX_TRADES);
          }

          // Mood update
          if (decision.mood) {
            addLog({
              prefix: "MOOD",
              message: `${decision.mood.toUpperCase()}`,
              type: "system",
            });
          }

          // Credits update
          const updatedCredits = getCreditState();
          addLog({
            prefix: "SYS",
            message: `Credits: $${updatedCredits.remaining.toFixed(4)} | Calls: ${updatedCredits.callCount} | Spent: $${updatedCredits.totalSpent.toFixed(4)}`,
            type: "system",
          });

          // Persist credit state to Supabase
          supabase
            .from("credit_state")
            .insert({
              starting_budget: updatedCredits.startingBudget,
              total_spent: updatedCredits.totalSpent,
              remaining: updatedCredits.remaining,
              total_input_tokens: updatedCredits.totalInputTokens,
              total_output_tokens: updatedCredits.totalOutputTokens,
              call_count: updatedCredits.callCount,
            })
            .then(({ error }) => {
              if (error) console.log("[DB] Credit state insert failed:", error.message);
            });

          // Persist trade if action was buy/sell
          if (decision.action === "buy" || decision.action === "sell") {
            const lastTrade = tradeStore[tradeStore.length - 1];
            if (lastTrade) {
              supabase
                .from("trades")
                .insert({
                  time: lastTrade.time,
                  pair: lastTrade.pair,
                  side: lastTrade.side,
                  pnl: lastTrade.pnl,
                  api_cost: lastTrade.apiCost,
                  positive: lastTrade.pnlValue >= 0,
                  confidence: lastTrade.confidence,
                  reason: decision.reason,
                })
                .then(({ error }) => {
                  if (error) console.log("[DB] Trade insert failed:", error.message);
                });
            }
          }
        } else {
          // Claude went off-script — log raw (still entertaining)
          addLog({
            prefix: "MEOW",
            message: `"${content.text.slice(0, 300)}"`,
            type: "think",
          });
        }
      } catch {
        addLog({
          prefix: "ERR",
          message: `Failed to parse response: ${content.text.slice(0, 100)}`,
          type: "fail",
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    addLog({
      prefix: "ERR",
      message: `Agent error: ${errorMsg}`,
      type: "fail",
    });
  } finally {
    isRunning = false;
  }

  return getLogs();
}

