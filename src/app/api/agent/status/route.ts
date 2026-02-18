import { NextResponse } from "next/server";
import { getAgentStatus, getLogs, getTrades } from "@/lib/agent";
import { waitForReady } from "@/lib/agentLoop";
import "@/lib/agentLoop";

export const dynamic = "force-dynamic";

export async function GET() {
  // Wait for DB restoration to finish before returning any data
  await waitForReady();

  const status = getAgentStatus();
  const logs = getLogs();
  const trades = getTrades();

  return NextResponse.json({
    ...status,
    logs,
    trades,
  });
}
