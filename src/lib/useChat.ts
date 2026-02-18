"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://phsawyidxklhefrhmflx.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_qQteWv86HFSHmae5XL9HuA_KEIxrDle";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  color: string;
  created_at: string;
}

const COLORS = [
  "text-accent-blue", "text-accent-green", "text-accent-orange",
  "text-sol-purple", "text-accent-teal", "text-amber-600", "text-accent-red",
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usernameRef = useRef<string>("");

  // Generate random username on mount
  useEffect(() => {
    const adjectives = ["degen", "sol", "crypto", "based", "anon", "moon", "hodl", "gm"];
    const nouns = ["cat", "ape", "trader", "dev", "whale", "intern", "maxi", "chad"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999);
    usernameRef.current = `${adj}_${noun}${num}`;
  }, []);

  // Load recent messages + subscribe to realtime
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Load last 50 messages
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(50);

        if (data && mounted) {
          setMessages(data);
          setIsConnected(true);
        }

        if (error) {
          console.log("Chat table not ready yet:", error.message);
        }
      } catch (err) {
        console.log("Chat load error:", err);
      }

      // Subscribe to new messages via Realtime
      try {
        const channel = supabase
          .channel("chat-realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "chat_messages" },
            (payload) => {
              if (mounted) {
                setMessages((prev) => {
                  // Deduplicate by id
                  const exists = prev.some((m) => m.id === (payload.new as ChatMessage).id);
                  if (exists) return prev;
                  const updated = [...prev, payload.new as ChatMessage];
                  return updated.length > 100 ? updated.slice(-100) : updated;
                });
              }
            }
          )
          .subscribe((status) => {
            if (mounted) {
              setIsConnected(status === "SUBSCRIBED");
            }
          });

        channelRef.current = channel;
      } catch (err) {
        console.log("Realtime subscription error:", err);
        // Still connected for REST, just no realtime
        setIsConnected(true);
      }

      // Fallback polling every 5s if realtime fails
      pollRef.current = setInterval(async () => {
        if (!mounted) return;
        try {
          const { data } = await supabase
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(50);
          if (data && mounted) {
            setMessages(data);
            setIsConnected(true);
          }
        } catch {
          // ignore
        }
      }, 5000);
    }

    init();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  // Send a message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const { error } = await supabase.from("chat_messages").insert({
      username: usernameRef.current,
      message: text.trim(),
      color: randomColor(),
    });

    if (error) {
      console.error("Failed to send message:", error.message);
    }
  }, []);

  return {
    messages,
    isConnected,
    sendMessage,
    username: usernameRef.current,
  };
}

