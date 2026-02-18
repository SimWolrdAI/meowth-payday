-- ================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================

-- Agent logs (terminal feed)
CREATE TABLE IF NOT EXISTS agent_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  time text NOT NULL,
  prefix text NOT NULL,
  message text NOT NULL,
  cost text,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Credit state snapshots
CREATE TABLE IF NOT EXISTS credit_state (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  starting_budget numeric NOT NULL DEFAULT 20.00,
  total_spent numeric NOT NULL DEFAULT 0,
  remaining numeric NOT NULL DEFAULT 20.00,
  total_input_tokens bigint NOT NULL DEFAULT 0,
  total_output_tokens bigint NOT NULL DEFAULT 0,
  call_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Trade history
CREATE TABLE IF NOT EXISTS trades (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  time text NOT NULL,
  pair text NOT NULL,
  side text NOT NULL,
  pnl text,
  api_cost text,
  positive boolean DEFAULT false,
  confidence integer DEFAULT 0,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Real-time chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username text NOT NULL,
  message text NOT NULL,
  color text DEFAULT 'text-text-primary',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public dashboard)
CREATE POLICY "Allow public read agent_logs" ON agent_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read credit_state" ON credit_state FOR SELECT USING (true);
CREATE POLICY "Allow public read trades" ON trades FOR SELECT USING (true);
CREATE POLICY "Allow public read chat_messages" ON chat_messages FOR SELECT USING (true);

-- Allow insert
CREATE POLICY "Allow insert agent_logs" ON agent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert credit_state" ON credit_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert trades" ON trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert chat_messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages (created_at DESC);

-- Insert initial credit state
INSERT INTO credit_state (starting_budget, total_spent, remaining, total_input_tokens, total_output_tokens, call_count)
VALUES (20.00, 0, 20.00, 0, 0, 0);

-- Enable Realtime on chat_messages for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;

-- Migration: add pnl_value numeric column to trades (run if table already exists)
-- ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl_value numeric DEFAULT 0;
