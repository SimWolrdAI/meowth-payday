import { NextResponse } from "next/server";
import { getAgentStatus, getLogs } from "@/lib/agent";
import "@/lib/agentLoop"; // Auto-starts the loop on first import

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAgentStatus();
  const logs = getLogs();

  return NextResponse.json({
    ...status,
    logs,
  });
}
