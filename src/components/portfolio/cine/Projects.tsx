import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { GlitchTitle } from "../film";
import { FadeIn } from "../primitives";
import { PlayGlyph, ScenePlayer } from "../ScenePlayer";
import { projects, type Project, type Scene } from "../data";
import { Label, PillLink } from "./bits";

const ROTATE_MS = 4500;

// Two wide tiles on top, three below on large screens; a last odd tile fills its row on
// tablets. Same grid as the original portfolio.
const sceneSpan = (i: number, total: number) =>
  cn(
    i < 2 ? "lg:col-span-3" : "lg:col-span-2",
    i === total - 1 && total % 2 === 1 && "sm:col-span-2",
  );

// Projects on black: one contained card per project with every scene in a tidy grid.
// One muted preview plays at a time; clicking a tile plays the full scene with sound.
export function Projects() {
  return (
    <section
      id="projects"
      data-header="dark"
      aria-label="Projects"
      // The shadow fills the corners under the About band's rounded bottom; this band's own
      // rounded, red-edged bottom hands over to the contact page.
      className="guides relative z-[1] rounded-b-[1.75rem] border-b-[3px] border-red bg-night px-[clamp(1rem,3.2vw,3rem)] pb-24 pt-14 text-white shadow-[0_-1.75rem_0_var(--night)] [--guide:var(--line-dark)] md:pb-32 md:pt-16"
    >
      <FadeIn className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Label>Selected work</Label>
          <h2 className="mt-4 font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.8]">
            Projects
          </h2>
        </div>
        <p className="micro text-mute-dark">
          {String(projects.length).padStart(2, "0")} productions
        </p>
      </FadeIn>

      <div className="mt-12 space-y-6 md:mt-16">
        {projects.map((project, i) => (
          <FadeIn key={project.slug}>
            <ProjectCard project={project} index={i} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  // One preview plays at a time: the hovered tile, else the next scene every few
  // seconds. Decoding every scene at once is what made this section stutter.
  const [playing, setPlaying] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const scenes = project.scenes ?? [];

  // The title glitches in the first time the card comes into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = Boolean(entry?.isIntersecting);
        setInView(on);
        if (on) setSeen(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovered !== null || scenes.length < 2) return;
    const t = window.setInterval(() => setPlaying((k) => (k + 1) % scenes.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [inView, hovered, scenes.length]);

  const live = hovered ?? playing;

  return (
    <article
      ref={ref}
      className="rounded-[1.75rem] border border-line-dark bg-night-2 p-5 text-white sm:p-7 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="micro text-mute-dark">
          {String(index + 1).padStart(2, "0")} · {project.type}
        </p>
        <p className="micro text-mute-dark">{project.client}</p>
      </div>
      {/* Hovering the title replays its glitch; hovering a tile glitches only that tile. */}
      <div className="glitch-host mt-4">
        <GlitchTitle
          text={project.title}
          active={seen}
          className="text-[clamp(2.25rem,5vw,4.5rem)]"
        />
      </div>

      {scenes.length > 0 && (
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          {scenes.map((scene, s) => (
            <SceneTile
              key={scene.video}
              scene={scene}
              aspect={project.sceneAspect}
              className={sceneSpan(s, scenes.length)}
              playing={inView && live === s}
              onHover={(on) => {
                setHovered(on ? s : null);
                if (on) setPlaying(s);
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <ul className="max-w-[760px] space-y-2.5 text-[0.8rem] leading-relaxed text-white/75">
          {project.points.map((point) => (
            <li key={point} className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-red" />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/work/$slug"
            params={{ slug: project.slug }}
            className="group inline-flex items-center gap-2 rounded-full bg-red px-5 py-2.5 font-display text-lg leading-none tracking-wide text-white transition-colors hover:bg-red-deep"
          >
            Explore project
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          {project.href && (
            <PillLink href={project.href} target="_blank" rel="noreferrer">
              {new Set(scenes.map((sc) => sc.href)).size > 1 ? "All scenes" : "Full video"}
            </PillLink>
          )}
        </div>
      </div>
    </article>
  );
}

function SceneTile({
  scene,
  aspect = "wide",
  className,
  playing,
  onHover,
}: {
  scene: Scene;
  aspect?: Project["sceneAspect"];
  className?: string;
  playing: boolean;
  onHover: (on: boolean) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing) void video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  return (
    <Dialog>
      <DialogTrigger
        data-cursor="Play"
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onHover(false)}
        aria-label={`Watch ${scene.title}`}
        className={cn(
          "glitch-host group relative block w-full cursor-pointer overflow-hidden rounded-[1.1rem] bg-black text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red",
          className,
        )}
      >
        <video
          ref={ref}
          src={scene.video}
          poster={scene.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className={cn(
            aspect === "video" ? "aspect-video" : "aspect-[2.39/1]",
            "w-full object-cover opacity-90 transition-[opacity,scale] duration-700 group-hover:scale-[1.03] group-hover:opacity-100",
          )}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-10">
          <GlitchTitle
            as="span"
            text={scene.title}
            className="block text-[clamp(1.1rem,1.6vw,1.5rem)]"
          />
        </span>
        {/* Bars on the tile that is playing; the play mark on hover. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-4 top-4 inline-flex h-3 items-end gap-[2px] transition-opacity duration-300",
            playing ? "opacity-100" : "opacity-0",
          )}
        >
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} className="eq-bar w-[3px] bg-red" style={{ animationDelay: `${d}s` }} />
          ))}
        </span>
        <PlayGlyph className="pointer-events-none absolute right-4 top-4 size-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </DialogTrigger>
      <ScenePlayer scene={scene} />
    </Dialog>
  );
}
