"use client";

import Window from "../desktop/Window";

export default function LoreWindow() {
  return (
    <Window title="The Lore">
      <div className="space-y-3 font-mono text-[11px] leading-relaxed">
        <div>
          <h3 className="text-xs font-bold text-accent-orange">MEOWTH PAYDAY</h3>
          <div className="mt-1 h-px bg-border-window" />
        </div>

        <p className="text-text-secondary">
          In the Pokémon world, Meowth was always known as the coin cat. He loved anything shiny, especially coins. While other Pokémon focused on training and getting stronger, Meowth cared a lot about money. He even had a move called Pay Day — he would throw coins during battle, and after the fight his trainer would receive extra cash. For him, earning was part of fighting.
        </p>

        <p className="text-text-secondary">
          In the anime, one particular Meowth became famous for learning how to talk like a human. He wasn&apos;t the strongest Pokémon, but he was clever. He often came up with plans to make money, usually together with his team. Most of those plans failed, but he never really stopped trying. He liked the idea of hitting it big one day.
        </p>

        <p className="text-text-secondary">
          Meowth PayDay is based on that version of him — not the hero, not the champion, just the smart, slightly greedy cat who is always thinking about the next way to earn.
        </p>

        <p className="text-text-secondary">
          In this project, he runs as a small autonomous agent on a MacBook. He starts with a limited amount of API credits. Every action he takes costs money. If he manages to earn more than he spends, he keeps going. If he runs out, he stops.
        </p>

        <div className="rounded-md bg-bg-input p-2.5 text-text-primary font-semibold text-center">
          earn, pay for your costs, continue.
        </div>
      </div>
    </Window>
  );
}
