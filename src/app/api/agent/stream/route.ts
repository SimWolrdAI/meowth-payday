import { getAgentStatus, getLogs } from "@/lib/agent";
import "@/lib/agentLoop";

export const dynamic = "force-dynamic";

// Simple polling endpoint — same as status
export async function GET() {
  const status = getAgentStatus();
  const logs = getLogs();

  return Response.json({
    ...status,
    logs,
  });
}
