"use client";

import { useAgent } from "@/lib/useAgent";
import MenuBar from "./MenuBar";
import TerminalWindow from "../windows/TerminalWindow";
import WalletWindow from "../windows/WalletWindow";
import CreditsWindow from "../windows/CreditsWindow";
import MeowthWindow from "../windows/MeowthWindow";
import EvolutionWindow from "../windows/EvolutionWindow";
import TradeHistoryWindow from "../windows/TradeHistoryWindow";
import ChatWindow from "../windows/ChatWindow";
import LoreWindow from "../windows/LoreWindow";

export default function Desktop() {
  const agent = useAgent();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <MenuBar
        credits={agent.credits.remaining}
        maxCredits={agent.credits.startingBudget}
        viewers={1247}
        isAlive={agent.isAlive}
        callCount={agent.credits.callCount}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Terminal (top) + Trade History (bottom) */}
        <div className="flex w-[42%] flex-col">
          <div className="flex-[3] min-h-0">
            <TerminalWindow logs={agent.logs} isLive={agent.isAlive} />
          </div>
          <div className="flex-[2] min-h-0">
            <TradeHistoryWindow trades={agent.trades} />
          </div>
        </div>

        {/* MIDDLE COLUMN: Wallet + Credits (top), Evolution + Lore (bottom) */}
        <div className="flex w-[30%] flex-col">
          <div className="flex flex-[1] min-h-0">
            <div className="w-1/2">
              <WalletWindow
                trades={agent.trades}
                credits={agent.credits.remaining}
                maxCredits={agent.credits.startingBudget}
              />
            </div>
            <div className="w-1/2">
              <CreditsWindow
                credits={agent.credits.remaining}
                maxCredits={agent.credits.startingBudget}
                totalSpent={agent.credits.totalSpent}
                callCount={agent.credits.callCount}
              />
            </div>
          </div>
          <div className="flex-[1] min-h-0">
            <EvolutionWindow />
          </div>
          <div className="flex-[1] min-h-0">
            <LoreWindow />
          </div>
        </div>

        {/* RIGHT COLUMN: Meowth (top) + Chat (bottom) */}
        <div className="flex w-[28%] flex-col">
          <div className="flex-[2] min-h-0">
            <MeowthWindow />
          </div>
          <div className="flex-[3] min-h-0">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
