import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { cine, filmFrames } from "../data";
import { usePauseOffscreen } from "../primitives";
import { Avatar, Label, PillLink, Sticker } from "./bits";

/** Copies of the 12-frame roll on the strip; `.film-roll` in styles.css shifts by 1/ROLL_COPIES. */
const ROLL_COPIES = 5;

// The release-page hero: giant title, red disc behind it, the cut-out in front, and a
// film strip that tilts and turns red as the page scrolls away.
export function CineHero() {
  const stage = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const avatarY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const stripRotate = useTransform(scrollYProgress, [0, 0.45], [0, -3]);
  const w1 = cine.credits.slice(0, 2);
  const w2 = cine.credits.slice(2);
  usePauseOffscreen(stage);

  return (
    <section
      ref={stage}
      id="top"
      data-header="dark"
      aria-label="Naman Jain, AI filmmaker"
      // Rounded, red-edged bottom: a clear break before the record section.
      className="guides relative z-[4] flex min-h-[max(640px,100svh)] flex-col overflow-hidden rounded-b-[1.75rem] border-b-[3px] border-red bg-night px-[clamp(1rem,3.2vw,3rem)] pt-24 text-white [--guide:var(--line-dark)] md:pt-28"
    >
      <div className="relative z-30 flex items-start justify-between gap-4">
        <ul className="flex flex-wrap gap-1.5">
          {cine.genres.map((g) => (
            <li
              key={g}
              className="rounded-full border border-white/60 px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.12em]"
            >
              {g}
            </li>
          ))}
        </ul>
        <p className="micro text-right text-[0.52rem]">{cine.release}</p>
      </div>

      <div
        className="relative z-30 mt-6 grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-end font-display text-[clamp(1rem,1.9vw,1.75rem)] leading-none md:mt-8"
      >
        {w1.map((c, i) => (
          <span key={c} className={i === 1 ? "text-center md:text-left" : undefined}>
            {c}
          </span>
        ))}
        <span
          aria-hidden
          className="px-3 text-center text-[clamp(1.75rem,4.4vw,4.5rem)] leading-[0.8] md:px-6"
        >
          {cine.above}
        </span>
        {w2.map((c, i) => (
          <span key={c} className={i === w2.length - 1 ? "text-right" : "text-center"}>
            {c}
          </span>
        ))}
      </div>

      {/* Title stage: disc → title → strip → cut-out, back to front. On wide screens the
          cut-out stands in the gap between the two words, so the whole name stays readable;
          on phones it stands below the title. */}
      <div className="relative mt-2 min-h-[64svh] flex-1 md:min-h-0">
        <div
          aria-hidden
          className="absolute left-1/2 top-[calc(18vw+36px)] aspect-square w-[62vw] -translate-x-1/2 rounded-full bg-red md:top-[-0.5vw] md:w-[26vw]"
        />

        <motion.div style={{ y: titleY }} className="relative will-change-transform">
          <h1
            className="relative z-10 flex justify-center gap-[0.18em] whitespace-nowrap font-display text-[21vw] leading-[0.8] md:grid md:grid-cols-[1fr_20vw_1fr] md:gap-0 md:text-[17vw]"
          >
            <span className="md:text-right">Naman</span>
            <span aria-hidden className="hidden md:block" />
            {/* "Jain" hugs the cut-out like "Naman" does; on wide screens a stacked
                "Film / Maker" fills the rest of the column out to the right guide and
                finishes the "AI" credit above. */}
            <span className="md:flex md:items-end md:justify-between">
              Jain
              <span
                aria-hidden
                className="hidden pb-[0.25em] text-right text-[0.27em] leading-[0.82] text-red md:block"
              >
                Film
                <br />
                Maker
              </span>
            </span>
          </h1>
          <motion.div
            aria-hidden
            style={{ rotate: stripRotate }}
            className="film-strip absolute -inset-x-[10%] top-full z-20 mt-[1vw] h-[44px] origin-center overflow-hidden will-change-transform"
          >
            {/* Five copies of the roll, so one set can scroll off while the strip stays full
                on screens up to ~2700px wide; the loop shifts by exactly one set (20%). */}
            <div className="film-roll flex h-full w-max">
              {Array.from({ length: ROLL_COPIES }, (_, copy) =>
                filmFrames.map((frame) => (
                  <div
                    key={`${copy}-${frame.src}`}
                    className="film-frame relative h-full w-14 shrink-0"
                  >
                    {/* Lazy keeps these tiny frames out of the preload queue, so the
                        cut-out above the fold downloads first. */}
                    <img
                      src={frame.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute left-px top-[10.5px] h-[23px] w-[54px] object-cover"
                    />
                  </div>
                )),
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll parallax only; the cut-out is in place on first paint, in front of the strip. */}
        <motion.div
          style={{ y: avatarY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(18vw+40px)] z-20 will-change-transform md:bottom-auto md:top-[0.5vw] md:h-[44vw]"
        >
          <div className="flex h-full justify-center">
            <Avatar priority className="h-full w-auto max-w-[86vw]" />
          </div>
        </motion.div>
        {/* Lets the cut-out dissolve into the band below instead of ending on a hard edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-night to-transparent"
        />
      </div>

      <div
        className="relative z-30 flex flex-wrap items-end justify-between gap-6 bg-night py-6 md:absolute md:inset-x-[clamp(1rem,3.2vw,3rem)] md:bottom-0 md:bg-transparent md:py-8"
      >
        <div className="max-w-[300px]">
          <Label>{cine.story.label}</Label>
          <p className="mt-3 text-[0.72rem] leading-[1.45] text-white/80">{cine.story.text}</p>
        </div>
        <div className="flex items-center gap-3">
          <PillLink href="#contact">Contact</PillLink>
          <Sticker />
        </div>
      </div>
    </section>
  );
}
