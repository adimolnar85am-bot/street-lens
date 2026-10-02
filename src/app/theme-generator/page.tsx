"use client";

import { useEffect, useState } from "react";

type Level = "EASY" | "MEDIUM" | "HARD";

type Theme = {
  title: string;
  challenge: string;
  rule: string;
  time: string;
  level: Level;
};

const themes: Theme[] = [
  { title: "WAIT FOR IT", challenge: "Find a strong frame. Stay there. Let the city enter it.", rule: "One location. One decisive moment.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "ONE COLOR", challenge: "Choose one color and build your walk around it.", rule: "The color must matter to the composition.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "NO CENTER", challenge: "Make the frame work without placing the subject in the center.", rule: "Keep the center empty.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "3 METERS", challenge: "Photograph only what exists within three meters of you.", rule: "No wide establishing shots.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "THE ACCIDENT", challenge: "Look for a visual coincidence you could never stage.", rule: "Wait for alignment, reflection, shadow or gesture.", time: "FULL PHOTOWALK", level: "HARD" },
  { title: "NO PEOPLE", challenge: "Tell a human story without photographing a person.", rule: "Use traces, objects, spaces and signs.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "36 FRAMES", challenge: "Pretend you are shooting one roll of film.", rule: "Exactly 36 frames. No deleting.", time: "FULL PHOTOWALK", level: "HARD" },
  { title: "ONE LENS", challenge: "Choose one focal length and stay with it.", rule: "No lens changes.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "LOOK DOWN", challenge: "Find the story beneath eye level.", rule: "Keep the camera below your waist.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "LOOK UP", challenge: "Ignore the street. Photograph what rises above it.", rule: "No ground in the frame.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "FOUND FRAME", challenge: "Use doors, windows, gaps and architecture as frames.", rule: "The frame must already exist.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "REFLECTION", challenge: "Photograph a scene through a reflective surface.", rule: "Glass, water, metal or mirrors only.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "WAITING", challenge: "Photograph someone or something that is waiting.", rule: "No posed subjects.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "NO POSTCARD", challenge: "Show the city without making a tourist photograph.", rule: "No landmarks or obvious views.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "THE ORDINARY", challenge: "Make something completely ordinary worth looking at.", rule: "Your subject must be something you normally ignore.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "LAYERED", challenge: "Build a photograph with foreground, subject and background.", rule: "Three visual layers minimum.", time: "FULL PHOTOWALK", level: "HARD" },
  { title: "ONE FRAME", challenge: "Create one photograph that sums up the walk.", rule: "Submit only one final frame.", time: "FULL PHOTOWALK", level: "HARD" },
  { title: "SAME PLACE", challenge: "Stay in one small area and find five different photographs.", rule: "Do not leave the zone.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "SHADOW", challenge: "Let shadow become the main subject.", rule: "Light must do most of the storytelling.", time: "FULL PHOTOWALK", level: "EASY" },
  { title: "CLOSE", challenge: "Get closer than your first instinct tells you.", rule: "Fill the frame.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "BACKWARDS", challenge: "Walk a familiar route in reverse and photograph it differently.", rule: "No returning to your usual viewpoint.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "SILENCE", challenge: "Find a photograph that feels quiet inside a busy city.", rule: "Avoid obvious action.", time: "FULL PHOTOWALK", level: "HARD" },
  { title: "LIGHT HUNTER", challenge: "Follow one patch of interesting light through the street.", rule: "Light comes first, subject second.", time: "FULL PHOTOWALK", level: "MEDIUM" },
  { title: "FIVE FRAMES", challenge: "Tell a small story in exactly five photographs.", rule: "Every frame must add something new.", time: "FULL PHOTOWALK", level: "HARD" },
];

export default function StandaloneThemeGenerator() {
  const [current, setCurrent] = useState<Theme>(themes[0]);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [locked, setLocked] = useState<string[]>([]);
  const [storageEnabled, setStorageEnabled] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  function themeId(theme: Theme) {
    return `AF-${String(themes.indexOf(theme) + 1).padStart(2, "0")}`;
  }

  async function refreshLocks() {
    try {
      const response = await fetch("/api/theme-locks", { cache: "no-store" });
      if (!response.ok) throw new Error("storage unavailable");
      const data = (await response.json()) as { enabled?: boolean; locked?: string[] };
      setStorageEnabled(data.enabled !== false);
      setLocked(data.locked ?? []);
    } catch {
      setStorageEnabled(false);
    }
  }

  useEffect(() => {
    void refreshLocks();
    const interval = window.setInterval(() => {
      void refreshLocks();
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!locked.length || claimed) return;
    const currentId = themeId(current);
    if (!locked.includes(currentId)) return;

    const available = themes.filter(
      (theme) =>
        !locked.includes(themeId(theme)) &&
        theme.title !== current.title
    );
    if (available.length) {
      setCurrent(available[Math.floor(Math.random() * available.length)]);
      setCopied(false);
    }
  }, [locked, current, claimed]);

  function generate() {
    const available = themes.filter(
      (theme) =>
        !history.includes(theme.title) &&
        theme.title !== current.title &&
        !locked.includes(themeId(theme))
    );
    const pool = available.length
      ? available
      : themes.filter((theme) => theme.title !== current.title);
    const next = pool[Math.floor(Math.random() * pool.length)];

    if (!next) return;
    setHistory((items) => [...items.slice(-7), current.title]);
    setCurrent(next);
    setCopied(false);
    setClaimed(false);
  }

  async function claimTheme() {
    if (!storageEnabled || claiming || claimed) return;

    setClaiming(true);
    try {
      const response = await fetch("/api/theme-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: themeId(current) }),
      });

      if (response.status === 409) {
        await refreshLocks();
        setClaimed(false);
        return;
      }

      if (!response.ok) throw new Error("claim failed");
      setLocked((items) =>
        items.includes(themeId(current)) ? items : [...items, themeId(current)]
      );
      setClaimed(true);
    } catch {
      setStorageEnabled(false);
    } finally {
      setClaiming(false);
    }
  }

  async function copyTheme() {
    const value = `ALT:FRAME / ${current.title}

${current.challenge}

RULE: ${current.rule}
DURATION: ${current.time}
LEVEL: ${current.level}

SEE OTHERWISE.`;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2efe8] text-[#111]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/15 pb-5">
          <div className="font-display text-xl tracking-[-0.04em]">
            alt<span className="text-[#ff2400]">:</span>frame
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/55">
            START HERE / 03 OCT 2026
          </div>
        </header>

        <div className="grid grid-cols-2 gap-px border-x border-b border-black/15 bg-black/15 sm:grid-cols-5">
          <div className="bg-[#f2efe8] px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">DATE</p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">SAT · 03 OCT</p>
          </div>
          <div className="bg-[#f2efe8] px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">MEET</p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">09:00</p>
          </div>
          <div className="bg-[#f2efe8] px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">START</p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">MERON ROSETTI</p>
          </div>
          <div className="bg-[#f2efe8] px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">ADDRESS</p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">PIATA ROSETTI 6</p>
          </div>          <div className="bg-[#f2efe8] px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">ROUTE</p>
            <a
              href="https://maps.app.goo.gl/1gE22E1NMghvkx5H9?g_st=ic"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] underline decoration-[#ff2400] underline-offset-4 hover:text-[#ff2400]"
            >
              OPEN IN MAPS ↗
            </a>
          </div>
        </div>

        <div className="border-x border-b border-black/15 bg-[#111] px-4 py-4 text-[#f2efe8] sm:flex sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">COMMUNICATION</p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">INSTAGRAM GROUP</p>
          </div>
          <a
            href="https://ig.me/j/JuWMe13s5OJo8rD4/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 border border-[#f2efe8] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-[#ff2400] hover:border-[#ff2400] sm:mt-0"
          >
            JOIN GROUP ↗
          </a>
        </div>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:py-20">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[#ff2400]">
              ALT:FRAME / PHOTOWALK · BUCHAREST
            </p>
            <h1 className="font-display max-w-xl text-[clamp(3.4rem,9vw,7.8rem)] uppercase leading-[0.84] tracking-[-0.065em]">
              YOUR THEME
            </h1>
            <p className="mt-7 max-w-md text-base leading-6 text-black/65 sm:text-lg">
              Start with this challenge. Take it through the entire photowalk.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generate}
                className="bg-[#ff2400] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#ff2400] focus:ring-offset-2 focus:ring-offset-[#f2efe8]"
              >
                NEW THEME
              </button>

              <button
                type="button"
                onClick={claimTheme}
                disabled={claiming || claimed || !storageEnabled}
                className="border border-black px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f2efe8]"
              >
                {claimed ? "THEME TAKEN" : claiming ? "TAKING..." : "TAKE THIS THEME"}
              </button>

              <button
                type="button"
                onClick={copyTheme}
                className="border border-black px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f2efe8]"
              >
                {copied ? "COPIED" : "COPY THEME"}
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">
                3 HOURS · GENERATE AGAIN · SEE OTHERWISE.
              </p>
              {storageEnabled ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                  {themes.length - locked.length} THEMES AVAILABLE · SHARED LIVE
                </p>
              ) : (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#ff2400]">
                  SHARED MODE OFF · LOCAL GENERATOR
                </p>
              )}
            </div>
          </div>

          <article className="relative border border-black bg-[#111] text-[#f2efe8] shadow-[12px_12px_0_#ff2400]">
            <div className="flex items-center justify-between border-b border-white/20 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span>
                THEME / AF-
                {String(
                  themes.findIndex((theme) => theme.title === current.title) + 1
                ).padStart(2, "0")}
              </span>
              <span className="text-[#ff2400]">{current.level}</span>
            </div>

            <div className="p-6 sm:p-10 lg:p-12">
              <div className="mb-12">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff2400]">
                  THEME
                </p>
                <h2 className="font-display text-[clamp(3rem,7vw,6.5rem)] uppercase leading-[0.84] tracking-[-0.06em]">
                  {current.title}
                </h2>
              </div>

              <div className="grid gap-8 border-t border-white/20 pt-7 sm:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    THE CHALLENGE
                  </p>
                  <p className="max-w-lg text-xl leading-7 sm:text-2xl sm:leading-8">
                    {current.challenge}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                      RULE
                    </p>
                    <p className="text-sm leading-5 text-white/80">
                      {current.rule}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
                    <div>
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                        DURATION
                      </p>
                      <p className="font-display text-xl">{current.time}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                        LEVEL
                      </p>
                      <p className="font-display text-xl">{current.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className={claimed ? "text-[#ff2400]" : "text-white/45"}>
                {claimed ? "TAKEN / THIS THEME IS RESERVED" : "TAKE THIS THEME TO RESERVE IT FOR THE GROUP"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/20 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>SEE OTHERWISE.</span>
              <span>altframe</span>
            </div>
          </article>
        </div>


      <section className="border-t border-black/15 pt-10 pb-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff2400]">
              QUICK GUIDE
            </p>
            <h3 className="mt-3 font-display text-4xl uppercase leading-[0.9] tracking-[-0.05em] sm:text-5xl">
              HOW IT
              <br />
              WORKS
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-6 text-black/60">
              Pick one challenge and carry it with you through the whole photowalk.
            </p>
          </div>

          <div className="grid gap-px border border-black/15 bg-black/15 sm:grid-cols-2">
            <div className="bg-[#f2efe8] p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">01 / READ</p>
              <h4 className="mt-3 font-display text-2xl uppercase tracking-[-0.04em]">START WITH THE THEME</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Read the challenge and the rule. The theme is your creative direction for the entire walk.
              </p>
            </div>

            <div className="bg-[#f2efe8] p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">02 / GENERATE</p>
              <h4 className="mt-3 font-display text-2xl uppercase tracking-[-0.04em]">NEED ANOTHER ONE?</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Tap <span className="font-mono font-bold">NEW THEME</span> to move to a different challenge.
              </p>
            </div>

            <div className="bg-[#f2efe8] p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">03 / TAKE</p>
              <h4 className="mt-3 font-display text-2xl uppercase tracking-[-0.04em]">RESERVE YOUR THEME</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Tap <span className="font-mono font-bold">TAKE THIS THEME</span> when you are ready. A claimed theme is marked as taken for the group.
              </p>
            </div>

            <div className="bg-[#f2efe8] p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">04 / SHOOT</p>
              <h4 className="mt-3 font-display text-2xl uppercase tracking-[-0.04em]">TAKE IT OUTSIDE</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Keep the theme in mind while you walk. There is no right photograph. Look for your interpretation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border border-black bg-[#111] px-5 py-4 text-[#f2efe8] sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">IMPORTANT</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/80">
            Generate until something clicks. Reserve only the theme you actually want to shoot.
            Once a theme is taken, it is no longer offered as a new choice to the group.
          </p>
        </div>
      </section>
      </section>
    </main>
  );
}
