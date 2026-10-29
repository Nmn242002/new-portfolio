import { motion } from "framer-motion";
import { AudioLines, Mic, PenLine, Scissors } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { FadeIn, usePauseOffscreen } from "../primitives";
import { about, cine, experience, projects, skills } from "../data";
import { Avatar, Label, Sticker } from "./bits";

const stills = (projects[0]!.scenes ?? []).map((s) => s.poster);

// About me, on black straight after the record: a playful intro (little
// pictures after each craft, a polaroid you can drag), then experience and
// skills. Its shadow fills the corners under the record's rounded bottom, and its own
// rounded, red-edged bottom hands over to the white projects band.
export function About() {
  const area = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  usePauseOffscreen(section);

  return (
    <section
      ref={section}
      id="about"
      data-header="dark"
      aria-label="About me"
      className="guides relative z-[2] rounded-b-[1.75rem] border-b-[3px] border-red bg-night px-[clamp(1rem,3.2vw,3rem)] pb-14 pt-24 text-white shadow-[0_-1.75rem_0_var(--night)] [--guide:var(--line-dark)] md:pb-16 md:pt-32"
    >
      <FadeIn className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Label>Introduction</Label>
          <h2 className="mt-4 font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.8]">
            About <span className="text-red">me</span>
          </h2>
        </div>
        <Status />
      </FadeIn>

      <div
        ref={area}
        className="relative mt-12 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16"
      >
        <Intro />
        <Polaroid bounds={area} />
      </div>

      <div className="mt-24 grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <FadeIn>
          <Label>Experience</Label>
        </FadeIn>
        <FadeIn delay={0.1} className="space-y-4">
          {experience.map((job) => (
            <article
              key={job.role}
              className="rounded-[1.1rem] border border-line-dark bg-night-2 p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="micro text-red">{job.period}</p>
                <p className="micro text-mute-dark">{job.location}</p>
              </div>
              <h3 className="mt-3 font-display text-3xl leading-none">{job.role}</h3>
              <p className="micro mt-2 text-white/70">{job.company}</p>
              <ul className="mt-5 space-y-2.5 text-[0.8rem] leading-relaxed text-white/75">
                {job.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-red" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </FadeIn>
      </div>

      <div id="skills" className="mt-20">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          {/* Same red light as the glow behind a hovered skill card. */}
          <h3 className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.8] text-red [text-shadow:0_0_60px_rgb(208_20_44/0.55)]">
            Skills
          </h3>
          <p className="micro text-mute-dark">{String(skills.length).padStart(2, "0")} crafts</p>
        </FadeIn>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => (
            <li key={skill.title}>
              <FadeIn delay={(i % 3) * 0.06} className="h-full">
                {/* Hover lift and red backlight are CSS; the glow is pre-drawn on a pseudo-element
                  and only faded in, so hovering never repaints a large blurred shadow. */}
                <div className="group relative h-full rounded-[1.1rem] border border-line-dark bg-night-2/60 p-6 transition-[scale,border-color] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[1.1rem] after:opacity-0 after:shadow-[0_30px_120px_-30px_rgb(208_20_44/0.55)] after:transition-opacity after:duration-500 hover:scale-[1.02] hover:border-red/50 hover:after:opacity-100">
                  <span className="micro text-mute-dark">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-[clamp(1.6rem,2.2vw,2.1rem)] leading-none transition-colors duration-500 group-hover:text-red">
                    {skill.title}
                  </h3>
                  <p className="mt-3 text-[0.78rem] leading-relaxed text-mute-dark">
                    {skill.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {skill.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/20 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-white/80"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** "Now" pill with a live red dot. */
function Status() {
  return (
    <p className="micro inline-flex items-center gap-2.5 rounded-full border border-white/15 px-3.5 py-2 text-white/80">
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-red opacity-70" />
        <span className="relative size-2 rounded-full bg-red" />
      </span>
      Now · {about.now}
    </p>
  );
}

// The intro paragraph. Words and chips rise in one after another the first time it scrolls
// into view (CSS transitions in styles.css, staggered by --i), so nothing runs per frame.
function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px 10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = 0;
  const words = (text: string) =>
    text.split(" ").map((w) => (
      <Fragment key={`${w}-${n}`}>
        <span className="intro-word" style={{ "--i": n++ } as CSSProperties}>
          {w}
        </span>{" "}
      </Fragment>
    ));

  return (
    <div ref={ref} data-shown={shown ? "" : undefined} className="intro">
      <p className="font-display text-[clamp(1.6rem,3vw,2.75rem)] leading-[1] text-mute-dark">
        {words(about.hello)}
        <span className="intro-word text-red" style={{ "--i": n++ } as CSSProperties}>
          {about.role}.
        </span>
      </p>

      <p className="mt-7 font-display text-[clamp(2.2rem,5vw,4.6rem)] leading-[1.02]">
        {about.crafts.map((c, i) => (
          <Fragment key={c.noun}>
            {words(c.lead)}
            {/* Noun, picture and comma stay on one line. */}
            <span className="whitespace-nowrap">
              <span className="intro-word" style={{ "--i": n++ } as CSSProperties}>
                {c.noun}
              </span>
              <Chip kind={c.chip} i={n++} />
              {i < about.crafts.length - 2 && ","}
            </span>{" "}
          </Fragment>
        ))}
        {words(about.outro)}
      </p>

      <p
        className="intro-word mt-8 max-w-[560px] text-[0.9rem] leading-relaxed text-mute-dark"
        style={{ "--i": n++ } as CSSProperties}
      >
        {about.focus}
      </p>
    </div>
  );
}

/** A small picture after a craft: pops in with the words, tilts and goes red on hover. */
function Chip({ kind, i }: { kind: (typeof about.crafts)[number]["chip"]; i: number }) {
  const icon = "size-[0.42em] shrink-0";
  const body = {
    pen: <PenLine className={icon} strokeWidth={2.4} />,
    cut: <Scissors className={icon} strokeWidth={2.4} />,
    wave: <AudioLines className={icon} strokeWidth={2.4} />,
    mic: (
      <>
        <Mic className={icon} strokeWidth={2.4} />
        <span className="inline-flex h-[0.32em] items-end gap-[0.04em]">
          {[0, 0.2, 0.4].map((d) => (
            <span
              key={d}
              className="eq-bar w-[0.05em] bg-red"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </span>
      </>
    ),
    faces: (
      <span className="flex pl-[0.14em]">
        {stills.slice(0, 3).map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="-ml-[0.14em] size-[0.5em] rounded-full border-[0.05em] border-night-2 object-cover"
          />
        ))}
      </span>
    ),
    still: (
      <img
        src={stills[3] ?? stills[0]}
        alt=""
        loading="lazy"
        className="h-[0.5em] w-[0.9em] rounded-[0.1em] object-cover"
      />
    ),
  }[kind];

  return (
    <span
      aria-hidden
      className="intro-chip ml-[0.14em] inline-flex h-[0.74em] items-center gap-[0.08em] rounded-full border border-white/20 bg-night-2 px-[0.18em] align-[-0.05em] hover:-rotate-6 hover:scale-110 hover:bg-red"
      style={{ "--i": i } as CSSProperties}
    >
      {body}
    </span>
  );
}

/**
 * Cut-out portrait on a polaroid, tilted, with the spinning sticker stuck on. It can be
 * dragged around the intro with a mouse and springs back on release; on touch screens it
 * stays put so swipes scroll.
 */
function Polaroid({ bounds }: { bounds: RefObject<HTMLDivElement | null> }) {
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia("(pointer: fine)").matches), []);

  return (
    <FadeIn delay={0.2} className="relative mx-auto h-[400px] w-[300px] lg:mx-0">
      <motion.figure
        drag={fine}
        dragConstraints={bounds}
        dragElastic={0.12}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 260, bounceDamping: 16 }}
        initial={false}
        style={{ rotate: 5 }}
        whileHover={{ rotate: -2, scale: 1.02 }}
        whileDrag={{ rotate: 0, scale: 1.05 }}
        className="absolute left-5 top-0 z-10 w-[260px] rounded-[0.4rem] bg-paper p-3 pb-4 text-ink shadow-[0_30px_60px_-24px_rgb(0_0_0/0.75)] will-change-transform data-[drag=true]:cursor-grab"
        data-drag={fine}
      >
        <div className="relative h-[260px] overflow-hidden rounded-[0.2rem] bg-red">
          {/* The source stops at the chest, so frame it like a real chest-up photo: no side
              fade, and the jacket runs off both edges of the print. */}
          <Avatar
            feather={false}
            className="pointer-events-none absolute left-1/2 top-[6%] h-auto w-[104%] max-w-none -translate-x-1/2 object-top"
          />
        </div>
        <figcaption className="mt-3 flex items-baseline justify-between">
          <span className="font-display text-2xl leading-none">Naman Jain</span>
          <span className="micro text-mute-light">
            {about.place} · {cine.year}
          </span>
        </figcaption>
        <Sticker className="pointer-events-none absolute -right-7 -top-7 rotate-12" />
      </motion.figure>
      {fine && <p className="micro absolute bottom-0 left-5 text-mute-dark">Drag me around ↖</p>}
    </FadeIn>
  );
}
