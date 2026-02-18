"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WindowProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  noPadding?: boolean;
}

export default function Window({
  title,
  icon,
  children,
  className = "",
  headerRight,
  noPadding = false,
}: WindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex h-full flex-col overflow-hidden border-r border-b border-border-window bg-bg-window-solid ${className}`}
    >
      {/* Title bar */}
      <div className="flex h-9 flex-shrink-0 items-center justify-between border-b border-border-subtle bg-bg-desktop/60 px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
            <div className="h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
            <div className="h-[10px] w-[10px] rounded-full bg-[#28c840]" />
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
            {icon && <span className="text-xs">{icon}</span>}
            {title}
          </span>
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${noPadding ? "" : "p-3"}`}>
        {children}
      </div>
    </motion.div>
  );
}
