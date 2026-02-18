"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Window from "../desktop/Window";

const MeowthScene = dynamic(() => import("./MeowthScene"), { ssr: false });

export default function MeowthWindow() {
  return (
    <Window title="Meowth" noPadding>
      <div className="flex h-full flex-col">
        {/* 3D Model */}
        <div className="relative flex-1 min-h-0">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-xs text-text-muted">
                Loading 3D...
              </div>
            }
          >
            <MeowthScene />
          </Suspense>
        </div>

      </div>
    </Window>
  );
}
