import { NextResponse } from "next/server";
import { getAgentStatus, getLogs, getTrades } from "@/lib/agent";
import "@/lib/agentLoop";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAgentStatus();
  const logs = getLogs();
  const trades = getTrades();

  return NextResponse.json({
    ...status,
    logs,
    trades,
  });
}
