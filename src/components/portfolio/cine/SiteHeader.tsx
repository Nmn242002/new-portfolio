import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { contactLinks } from "../data";
import { Logo, Sticker } from "./bits";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const sections = [
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

// Fixed header. Each section declares `data-header="dark" | "light"`; the header reads
// whichever section sits under it and flips its ink to stay legible.
export function SiteHeader() {
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Thin observer bands do the hit-testing off the main thread: one under the header for
  // its ink, one at 40% of the viewport for the active nav link. Measuring every section
  // on each scroll frame forced a layout per frame and made scrolling stutter.
  useEffect(() => {
    const probe = 36;
    const tones = [...document.querySelectorAll<HTMLElement>("[data-header]")];
    const targets = sections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const under = new Set<Element>();
    const inMid = new Set<Element>();
    let observers: IntersectionObserver[] = [];

    const watch = () => {
      observers.forEach((o) => o.disconnect());
      under.clear();
      inMid.clear();
      const toneIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.isIntersecting ? under.add(e.target) : under.delete(e.target);
          // Last match wins: a nested section (the pinned dark band) overrides its parent.
          const top = tones.filter((el) => under.has(el)).at(-1);
          setTone(top?.dataset["header"] === "light" ? "light" : "dark");
        },
        { rootMargin: `-${probe}px 0px -${Math.max(0, window.innerHeight - probe - 1)}px 0px` },
      );
      const midIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.isIntersecting ? inMid.add(e.target) : inMid.delete(e.target);
          setActive(targets.find((el) => inMid.has(el))?.id ?? "");
        },
        { rootMargin: "-40% 0px -59% 0px" },
      );
      tones.forEach((el) => toneIO.observe(el));
      targets.forEach((el) => midIO.observe(el));
      observers = [toneIO, midIO];
    };

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    watch();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", watch);
    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", watch);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const light = tone === "light" && !open;
  const linkedin = contactLinks.find((l) => l.label === "LinkedIn")?.href ?? "#contact";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-[clamp(1rem,3.2vw,3rem)] py-4 transition-colors duration-300 md:py-5",
          light ? "text-ink" : "text-white",
          // Once off the hero, a near-solid bar keeps the nav clear of the content below.
          // No backdrop blur: re-blurring video and moving layers under it every frame
          // is what made scrolling stutter.
          scrolled && !open && (light ? "bg-paper/95" : "bg-night/95"),
        )}
      >
        <a href="#top" aria-label="Portfolio, home">
          <Logo className="text-[1.6rem] md:text-[1.85rem]" />
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-4 lg:gap-6">
            {sections.map((s, i) => (
              <li key={s.id} className="flex items-center gap-4 lg:gap-6">
                {i > 0 && <span aria-hidden className="size-[3px] rounded-full bg-current" />}
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className="micro relative py-2 text-[0.6rem] transition-opacity hover:opacity-60"
                >
                  {s.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-red transition-opacity duration-300",
                      active === s.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="Naman on LinkedIn"
            className="hidden size-8 items-center justify-center rounded-full border border-current transition-opacity hover:opacity-60 sm:flex"
          >
            <Linkedin aria-hidden className="size-3.5" />
          </a>
          <a
            href="#about"
            aria-label="About Naman"
            className="hidden size-8 items-center justify-center rounded-full border border-current transition-opacity hover:opacity-60 sm:flex"
          >
            <UserRound aria-hidden className="size-3.5" />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
              "ml-1.5 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-300",
              light ? "bg-ink text-white" : "bg-white text-ink",
            )}
          >
            {open ? (
              <X aria-hidden className="size-4" />
            ) : (
              <span aria-hidden className="flex w-4 flex-col items-end gap-[4px]">
                <span className="h-[1.5px] w-full bg-current" />
                <span className="h-[1.5px] w-2/3 bg-current" />
              </span>
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Site menu"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.75rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.75rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.75rem)" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="guides fixed inset-0 z-40 flex flex-col justify-between bg-night px-[clamp(1rem,3.2vw,3rem)] pb-8 pt-28 text-white [--guide:var(--line-dark)]"
          >
            <nav aria-label="Menu">
              <ol>
                {[{ label: "Home", id: "top" }, ...sections].map((s, i) => (
                  <li key={s.id} className="flex items-baseline gap-4 border-b border-line-dark">
                    <span className="micro w-8 text-mute-dark">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className="font-display text-[clamp(3rem,11vw,8rem)] leading-[0.95] transition-colors hover:text-red"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <ul className="space-y-1">
                {contactLinks
                  .filter((l) => l.href)
                  .map((l) => (
                    <li key={l.label} className="flex gap-4">
                      <span className="micro w-20 text-mute-dark">{l.label}</span>
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                        className="micro hover:text-red"
                      >
                        {l.value}
                      </a>
                    </li>
                  ))}
              </ul>
              <Sticker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
