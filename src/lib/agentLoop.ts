import { runAgentCycle, getAgentStatus, restoreLogsFromDB, setCycleCount } from "./agent";
import { isAlive, initCreditsFromDB, getCreditState } from "./credits";

let loopRunning = false;
let loopInterval: ReturnType<typeof setTimeout> | null = null;

export function isLoopRunning() {
  return loopRunning;
}

export async function startAgentLoop() {
  if (loopRunning) return;
  loopRunning = true;

  // Restore state from Supabase before starting
  await initCreditsFromDB();
  await restoreLogsFromDB();

  // Restore cycle count from credit state (callCount tracks total API calls)
  const credits = getCreditState();
  if (credits.callCount > 0) {
    setCycleCount(credits.callCount);
    console.log(`[AGENT] Restored cycleCount to ${credits.callCount}`);
  }

  console.log("[AGENT] Auto-loop started — history restored");

  const tick = async () => {
    if (!isAlive()) {
      console.log("[AGENT] Dead. Loop stopped.");
      loopRunning = false;
      return;
    }

    try {
      await runAgentCycle();
    } catch (err) {
      console.error("[AGENT] Cycle error:", err);
    }

    // Next cycle in 15-25 seconds
    const delay = 15000 + Math.random() * 10000;
    loopInterval = setTimeout(tick, delay);
  };

  // Start first cycle after 3s
  loopInterval = setTimeout(tick, 3000);
}

export function stopAgentLoop() {
  loopRunning = false;
  if (loopInterval) {
    clearTimeout(loopInterval);
    loopInterval = null;
  }
  console.log("[AGENT] Loop stopped");
}

// Auto-start on import
startAgentLoop();
