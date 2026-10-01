"use client";

import { useState } from "react";

type Level = "EASY" | "MEDIUM" | "HARD";

type Theme = {
  title: string;
  challenge: string;
  rule: string;
  time: string;
  level: Level;
};

const themes: Theme[] = [
  { title: "WAIT FOR IT", challenge: "Find a strong frame. Stay there. Let the city enter it.", rule: "One location. One decisive moment.", time: "15 MIN", level: "MEDIUM" },
  { title: "ONE COLOR", challenge: "Choose one color and build your walk around it.", rule: "The color must matter to the composition.", time: "30 MIN", level: "EASY" },
  { title: "NO CENTER", challenge: "Make the frame work without placing the subject in the center.", rule: "Keep the center empty.", time: "20 MIN", level: "MEDIUM" },
  { title: "3 METERS", challenge: "Photograph only what exists within three meters of you.", rule: "No wide establishing shots.", time: "20 MIN", level: "EASY" },
  { title: "THE ACCIDENT", challenge: "Look for a visual coincidence you could never stage.", rule: "Wait for alignment, reflection, shadow or gesture.", time: "30 MIN", level: "HARD" },
  { title: "NO PEOPLE", challenge: "Tell a human story without photographing a person.", rule: "Use traces, objects, spaces and signs.", time: "25 MIN", level: "MEDIUM" },
  { title: "36 FRAMES", challenge: "Pretend you are shooting one roll of film.", rule: "Exactly 36 frames. No deleting.", time: "60 MIN", level: "HARD" },
  { title: "ONE LENS", challenge: "Choose one focal length and stay with it.", rule: "No lens changes.", time: "45 MIN", level: "MEDIUM" },
  { title: "LOOK DOWN", challenge: "Find the story beneath eye level.", rule: "Keep the camera below your waist.", time: "20 MIN", level: "EASY" },
  { title: "LOOK UP", challenge: "Ignore the street. Photograph what rises above it.", rule: "No ground in the frame.", time: "20 MIN", level: "EASY" },
  { title: "FOUND FRAME", challenge: "Use doors, windows, gaps and architecture as frames.", rule: "The frame must already exist.", time: "30 MIN", level: "MEDIUM" },
  { title: "REFLECTION", challenge: "Photograph a scene through a reflective surface.", rule: "Glass, water, metal or mirrors only.", time: "30 MIN", level: "MEDIUM" },
  { title: "WAITING", challenge: "Photograph someone or something that is waiting.", rule: "No posed subjects.", time: "30 MIN", level: "EASY" },
  { title: "NO POSTCARD", challenge: "Show the city without making a tourist photograph.", rule: "No landmarks or obvious views.", time: "30 MIN", level: "MEDIUM" },
  { title: "THE ORDINARY", challenge: "Make something completely ordinary worth looking at.", rule: "Your subject must be something you normally ignore.", time: "30 MIN", level: "EASY" },
  { title: "LAYERED", challenge: "Build a photograph with foreground, subject and background.", rule: "Three visual layers minimum.", time: "30 MIN", level: "HARD" },
  { title: "ONE FRAME", challenge: "Create one photograph that sums up the walk.", rule: "Submit only one final frame.", time: "45 MIN", level: "HARD" },
  { title: "SAME PLACE", challenge: "Stay in one small area and find five different photographs.", rule: "Do not leave the zone.", time: "30 MIN", level: "MEDIUM" },
  { title: "SHADOW", challenge: "Let shadow become the main subject.", rule: "Light must do most of the storytelling.", time: "30 MIN", level: "EASY" },
  { title: "CLOSE", challenge: "Get closer than your first instinct tells you.", rule: "Fill the frame.", time: "20 MIN", level: "MEDIUM" },
  { title: "BACKWARDS", challenge: "Walk a familiar route in reverse and photograph it differently.", rule: "No returning to your usual viewpoint.", time: "30 MIN", level: "MEDIUM" },
  { title: "SILENCE", challenge: "Find a photograph that feels quiet inside a busy city.", rule: "Avoid obvious action.", time: "30 MIN", level: "HARD" },
  { title: "LIGHT HUNTER", challenge: "Follow one patch of interesting light through the street.", rule: "Light comes first, subject second.", time: "30 MIN", level: "MEDIUM" },
  { title: "FIVE FRAMES", challenge: "Tell a small story in exactly five photographs.", rule: "Every frame must add something new.", time: "45 MIN", level: "HARD" },
];

export default function StandaloneThemeGenerator() {
  const [current, setCurrent] = useState<Theme>(() => themes[Math.floor(Math.random() * themes.length)]);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  function generate() {
    const available = themes.filter(
      (theme) => !history.includes(theme.title) && theme.title !== current.title
    );
    const pool = available.length
      ? available
      : themes.filter((theme) => theme.title !== current.title);
    const next = pool[Math.floor(Math.random() * pool.length)];

    setHistory((items) => [...items.slice(-7), current.title]);
    setCurrent(next);
    setCopied(false);
  }

  async function copyTheme() {
    const value = `ALT:FRAME / ${current.title}

${current.challenge}

RULE: ${current.rule}
TIME: ${current.time}
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
            THEME GENERATOR
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:py-20">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[#ff2400]">
              ALT:FRAME / TOOL
            </p>
            <h1 className="font-display max-w-xl text-[clamp(3.4rem,9vw,7.8rem)] uppercase leading-[0.84] tracking-[-0.065em]">
              THEME GENERATOR
            </h1>
            <p className="mt-7 max-w-md text-base leading-6 text-black/65 sm:text-lg">
              A random challenge for your next photowalk.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generate}
                className="bg-[#ff2400] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#ff2400] focus:ring-offset-2 focus:ring-offset-[#f2efe8]"
              >
                GENERATE THEME
              </button>

              <button
                type="button"
                onClick={copyTheme}
                className="border border-black px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f2efe8]"
              >
                {copied ? "COPIED" : "COPY THEME"}
              </button>
            </div>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">
              Generate again. See otherwise.
            </p>
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
                        TIME
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

            <div className="flex items-center justify-between border-t border-white/20 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              <span>SEE OTHERWISE.</span>
              <span>altframe</span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
