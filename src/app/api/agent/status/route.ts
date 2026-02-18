import { NextResponse } from "next/server";
import { getAgentStatus, getLogs, getTrades } from "@/lib/agent";
import { waitForReady } from "@/lib/agentLoop";
import { supabase } from "@/lib/supabase";
import "@/lib/agentLoop";

export const dynamic = "force-dynamic";

export async function GET() {
  // Wait for DB restoration to finish before returning any data
  await waitForReady();

  const status = getAgentStatus();
  const logs = getLogs();
  let trades = getTrades();

  // Fallback: if in-memory trades are empty, query Supabase directly
  if (trades.length === 0) {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (!error && data && data.length > 0) {
        trades = data.map((row: Record<string, unknown>) => {
          let pnlValue = 0;
          if (row.pnl_value != null) {
            pnlValue = parseFloat(String(row.pnl_value)) || 0;
          } else if (row.pnl) {
            const cleaned = String(row.pnl).replace(/[$+]/g, "");
            pnlValue = parseFloat(cleaned) || 0;
          }
          if (row.positive === false && pnlValue > 0) pnlValue = -Math.abs(pnlValue);

          return {
            time: String(row.time),
            pair: String(row.pair),
            side: String(row.side) as "BUY" | "SELL",
            pnl: String(row.pnl || (pnlValue >= 0 ? `+$${pnlValue.toFixed(4)}` : `-$${Math.abs(pnlValue).toFixed(4)}`)),
            pnlValue,
            apiCost: String(row.api_cost || "$0.000000"),
            confidence: Number(row.confidence) || 0,
          };
        });
      }
    } catch (err) {
      console.log("[STATUS] Fallback trade fetch failed:", err);
    }
  }

  return NextResponse.json({
    ...status,
    logs,
    trades,
  });
}
