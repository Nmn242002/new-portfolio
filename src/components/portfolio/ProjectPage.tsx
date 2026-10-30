import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FilmCursor, GlitchTitle, Pill } from "./film";
import { FadeIn } from "./primitives";
import { PlayGlyph, ScenePlayer, useInViewAutoplay } from "./ScenePlayer";
import { WorkTicket } from "./Projects";
import { contactLinks, heroPortrait, projects, type Project, type Scene } from "./data";
import { TicketNav } from "./TicketNav";

const gutter = "px-[clamp(0.75rem,2vw,2rem)]";

export function ProjectPage({ project }: { project: Project }) {
  const navigate = useNavigate();
  const scenes = project.scenes ?? [];
  const lead = scenes[0];
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length]!;

  return (
    <main className="min-h-screen bg-cream text-paper-ink" style={{ overflowX: "clip" }}>
      <FilmCursor />
      <Link
        to="/"
        className="reel-title fixed left-3 top-4 z-50 text-[1.6rem] text-white mix-blend-difference sm:left-5 sm:top-5"
      >
        <span className="sm:hidden">NJ</span>
        <span className="hidden sm:inline">Naman Jain</span>
      </Link>
      <TicketNav
        items={projects.map((p) => ({
          id: p.slug,
          title: p.short,
          thumb: p.scenes?.[0]?.poster ?? p.cover,
          meta: [p.client, p.year ?? p.format, `${p.scenes?.length ?? 0} scenes`],
        }))}
        activeId={project.slug}
        onSelect={(slug) => void navigate({ to: "/work/$slug", params: { slug } })}
      />

      {/* Opening frame */}
      <header className="relative h-[72svh] overflow-hidden bg-canvas">
        {lead && <LoopVideo scene={lead} className="size-full object-cover opacity-90" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
        <Link
          to="/"
          hash="projects"
          className="absolute left-3 top-16 flex items-center gap-2 text-white sm:left-5 sm:top-20"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-cream text-paper-ink">
            <ArrowLeft className="size-3" aria-hidden />
          </span>
          <span className="micro">All work</span>
        </Link>
      </header>

      <section className="pt-8 text-center">
        <p className="micro">{project.type}</p>
        <div className="mt-3 border-y border-paper-ink py-2">
          <GlitchTitle
            as="h1"
            active
            text={project.short}
            className="text-[clamp(2.75rem,8vw,8rem)]"
          />
        </div>
        <a
          href="#watch"
          aria-label="Skip to the film"
          className="mx-auto -mt-3 flex size-6 items-center justify-center rounded-full bg-paper-ink text-cream"
        >
          <ArrowDown className="size-3.5" aria-hidden />
        </a>
      </section>

      {lead && <Trailer scene={lead} />}

      <Credits project={project} />

      {scenes.length > 0 && <SceneGallery project={project} />}

      <Notes points={project.points} />

      <section className={cn(gutter, "py-16 md:py-24")}>
        <FadeIn className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="micro">Up next</p>
          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-reel text-[0.65rem] font-bold uppercase tracking-[0.16em] hover:underline"
            >
              Full files on Google Drive <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          )}
        </FadeIn>
        <FadeIn>
          <WorkTicket project={next} index={projects.indexOf(next)} label="Next project" />
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}

function LoopVideo({ scene, className }: { scene: Scene; className?: string }) {
  const ref = useInViewAutoplay();
  return (
    <video
      ref={ref}
      src={scene.video}
      poster={scene.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className={className}
    />
  );
}

// Rounded film card that opens out to full width as it scrolls into view.
function Trailer({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.78, 1]);

  return (
    <section id="watch" className={cn(gutter, "scroll-mt-16 pt-12 md:pt-16")}>
      <motion.div ref={ref} style={{ scale }} className="origin-top">
        <Dialog>
          <DialogTrigger
            data-cursor="Play"
            aria-label={`Watch ${scene.title}`}
            className="group relative block aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-[1.25rem] bg-canvas focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema md:aspect-[21/9]"
          >
            <LoopVideo scene={scene} className="size-full object-cover" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 transition-colors duration-500 group-hover:bg-black/0">
              <PlayGlyph className="size-14 transition-transform duration-500 group-hover:scale-110 md:size-20" />
              <span className="micro text-cinema">Watch</span>
              <span className="reel-title text-lg text-cinema md:text-2xl">{scene.title}</span>
            </span>
          </DialogTrigger>
          <ScenePlayer scene={scene} />
        </Dialog>
      </motion.div>
    </section>
  );
}

function Credits({ project }: { project: Project }) {
  return (
    <section
      className={cn(gutter, "grid gap-[3px] py-16 md:grid-cols-[minmax(220px,0.3fr)_1fr] md:py-24")}
    >
      <FadeIn className="relative min-h-[320px] overflow-hidden rounded-[6px] bg-canvas text-white">
        <img
          src={heroPortrait.src}
          alt={heroPortrait.alt}
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-top opacity-85"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
          <p className="micro opacity-80">{project.role}</p>
          <p className="reel-title mt-1.5 text-[clamp(1.75rem,3vw,2.75rem)]">Naman Jain</p>
        </div>
      </FadeIn>
      <FadeIn delay={0.08} className="grid content-start gap-[3px] sm:grid-cols-2">
        <div className="ticket bg-paper-ink py-1.5 text-center text-cream sm:col-span-2">
          <span className="micro">Credits</span>
        </div>
        {project.credits.map((credit) => (
          <div
            key={credit.label}
            className="ticket overflow-hidden border border-dotted border-paper-ink/50"
          >
            <p className="micro bg-paper-ink py-1 text-center text-cream">{credit.label}</p>
            <p className="reel-title px-3 py-5 text-center text-[clamp(1.4rem,2.6vw,2.5rem)]">
              {credit.value}
            </p>
          </div>
        ))}
      </FadeIn>
    </section>
  );
}

// Black gallery of every scene, set on a staggered grid; each tile plays its full scene.
function SceneGallery({ project }: { project: Project }) {
  const scenes = project.scenes ?? [];
  return (
    <section className="bg-canvas py-16 text-white md:py-24">
      <FadeIn className="flex flex-col items-center gap-3 text-center">
        <h2>
          <Pill>Scenes</Pill>
        </h2>
        <p className="micro text-white/60">{scenes.length} scenes · click to watch with sound</p>
      </FadeIn>
      <div className={cn(gutter, "mt-10 grid gap-3 sm:grid-cols-2 md:mt-14 md:gap-4")}>
        {scenes.map((scene, i) => (
          <FadeIn
            key={scene.poster}
            delay={(i % 2) * 0.08}
            className={cn(i % 2 === 1 && "sm:translate-y-[12%]")}
          >
            <Dialog>
              <DialogTrigger
                data-cursor="Play"
                aria-label={`Watch ${scene.title}`}
                className="glitch-host group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinema"
              >
                <span className="block overflow-hidden rounded-[6px] bg-black">
                  <LoopVideo
                    scene={scene}
                    className={cn(
                      project.sceneAspect === "video" ? "aspect-video" : "aspect-[2.39/1]",
                      "w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100",
                    )}
                  />
                </span>
                <span className="mt-2 flex items-baseline justify-between gap-3 border-b border-film-line pb-2">
                  <span
                    className="reel-title glitch text-[clamp(1.1rem,2vw,1.75rem)]"
                    data-text={scene.title}
                  >
                    {scene.title}
                  </span>
                </span>
              </DialogTrigger>
              <ScenePlayer scene={scene} />
            </Dialog>
          </FadeIn>
        ))}
      </div>
      {/* Room for the staggered column's overhang. */}
      <div aria-hidden className="hidden h-16 sm:block" />
    </section>
  );
}

// Arched notes on black, after the reference's review cards; the middle note is in red.
function Notes({ points }: { points: string[] }) {
  return (
    <section className="bg-canvas pb-20 pt-4 text-white md:pb-28">
      <FadeIn className="text-center">
        <h2>
          <Pill>Notes</Pill>
        </h2>
      </FadeIn>
      <div
        className={cn(
          gutter,
          "strip mt-10 flex snap-x snap-mandatory justify-start gap-4 overflow-x-auto md:justify-center",
        )}
      >
        {points.map((point, i) => (
          <FadeIn
            key={point}
            delay={i * 0.08}
            className={cn("w-[min(82vw,340px)] shrink-0 snap-center", i % 2 === 1 && "md:mt-14")}
          >
            <article className="relative flex min-h-[400px] flex-col items-center justify-center border border-dashed border-film-line px-7 pb-10 pt-20 text-center [border-radius:50%_50%_4px_4px/28%_28%_4px_4px]">
              <span
                aria-hidden
                className="absolute inset-3 border border-dashed border-film-line/60 [border-radius:50%_50%_2px_2px/26%_26%_2px_2px]"
              />
              <span aria-hidden className="reel-title text-3xl text-cinema">
                ||
              </span>
              <p className="micro mt-4 text-white/60">Note {String(i + 1).padStart(2, "0")}</p>
              <p
                className={cn(
                  "mt-3 font-reel text-[1.15rem] font-bold uppercase leading-[1.02] tracking-tight [font-stretch:80%]",
                  i === 1 && "text-cinema",
                )}
              >
                {point}
              </p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const email = contactLinks.find((link) => link.label === "Email");
  return (
    <footer className="pb-8 pt-4">
      <div className="text-center">
        <span className="micro inline-block border border-paper-ink px-2 py-1">NJ</span>
        <div className="mt-4">
          {["Script · Shots", "Sound · Edit", "AI Film"].map((word) => (
            <p
              key={word}
              className="reel-title border-b border-paper-ink py-1 text-[clamp(2.5rem,7vw,6.5rem)] first:border-t"
            >
              {word}
            </p>
          ))}
        </div>
      </div>
      <div className={cn(gutter, "mx-auto mt-10 grid max-w-[900px] gap-8 sm:grid-cols-3")}>
        <div>
          <p className="micro">Sitemap</p>
          <ul className="mt-3 space-y-1">
            {(
              [
                ["Projects", "projects"],
                ["About", "about"],
                ["Contact", "contact"],
              ] as const
            ).map(([label, hash]) => (
              <li key={hash}>
                <Link
                  to="/"
                  hash={hash}
                  className="reel-title text-xl opacity-50 transition-opacity hover:opacity-100"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <p className="micro">Contact</p>
          {email && (
            <a
              href={email.href}
              target="_blank"
              rel="noreferrer"
              className="reel-title mt-3 block break-all text-[clamp(1.5rem,3vw,2.5rem)] hover:underline"
            >
              {email.value}
            </a>
          )}
          <ul className="mt-4 space-y-1">
            {contactLinks
              .filter((link) => link !== email)
              .map((link) => (
                <li key={link.label} className="flex items-baseline gap-3">
                  <span className="micro w-20 shrink-0 opacity-60">{link.label}</span>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-reel text-xs font-semibold uppercase hover:underline"
                    >
                      {link.value}
                    </a>
                  ) : (
                    <span className="font-reel text-xs font-semibold uppercase">{link.value}</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <p className="micro mt-12 text-center text-[0.5rem] opacity-60">
        © Naman Jain · AI Filmmaker · Delhi
      </p>
    </footer>
  );
}
