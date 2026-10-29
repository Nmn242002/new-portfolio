import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/utils";

const EASE_CSS = "cubic-bezier(0.25, 0.1, 0.25, 1)";

/**
 * Marks the element `data-offscreen` while it is out of view, which pauses its looping
 * CSS decoration (see styles.css) so it stops costing frames elsewhere on the page.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete el.dataset["offscreen"];
      else el.dataset["offscreen"] = "";
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

// Reveals once on entering the viewport with a CSS transition, which the browser runs
// off the main thread. The reveal writes styles directly, so it never re-renders React.
// It starts a little before the block scrolls into view, so nobody waits on it.
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.35,
  x = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const timing = `${duration}s ${EASE_CSS} ${Math.min(delay, 0.1)}s`;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: `opacity ${timing}, transform ${timing}`,
      }}
    >
      {children}
    </div>
  );
}

// Moves the child toward the cursor by writing the transform directly, so mouse
// movement never re-renders React; the frame loop only runs while the cursor is near.
export function Magnet({
  children,
  className,
  strength = 6,
  padding = 120,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  padding?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let active = false;
    let pointer = { x: 0, y: 0 };

    const apply = () => {
      frame = 0;
      const el = ref.current;
      const child = inner.current;
      if (!el || !child) return;
      const rect = el.getBoundingClientRect();
      const inside =
        pointer.x > rect.left - padding &&
        pointer.x < rect.right + padding &&
        pointer.y > rect.top - padding &&
        pointer.y < rect.bottom + padding;
      if (inside) {
        const x = (pointer.x - (rect.left + rect.width / 2)) / strength;
        const y = (pointer.y - (rect.top + rect.height / 2)) / strength;
        child.style.transition = "transform 0.3s ease-out";
        child.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      } else if (active) {
        child.style.transition = "transform 0.6s ease-in-out";
        child.style.transform = "translate3d(0, 0, 0)";
      }
      active = inside;
    };

    const onMove = (e: MouseEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [padding, strength]);

  return (
    <div ref={ref} className={className}>
      <div ref={inner} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

// Words brighten as the paragraph scrolls through view. Scroll progress is written to one
// CSS variable on the paragraph and each word derives its opacity from it, instead of
// animating every word separately.
export function AnimatedText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 1", "end 0.65"],
  });
  const words = text.split(" ");
  const setReveal = (progress: number) =>
    ref.current?.style.setProperty("--reveal", String(progress * words.length));

  useEffect(() => {
    setReveal(scrollYProgress.get());
  });
  useMotionValueEvent(scrollYProgress, "change", setReveal);

  return (
    <p ref={ref} className={className} style={{ "--reveal": 0 } as CSSProperties}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="relative mr-[0.28em] inline-block"
          style={{ opacity: `clamp(0.2, calc(0.2 + 0.8 * (var(--reveal) - ${i})), 1)` }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}

export function ContactButton({
  className,
  label = "Contact Me",
  href = "#contact",
}: {
  className?: string;
  label?: string;
  href?: string;
}) {
  return (
    <Magnet padding={60} strength={8} className={cn("inline-block", className)}>
      <a
        href={href}
        className="contact-pill inline-flex rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-transform duration-300 hover:scale-[1.04] sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4"
        style={{ color: "oklch(0.99 0 0)" }}
      >
        {label}
      </a>
    </Magnet>
  );
}

export function ProjectButton({
  label = "View Project",
  href,
  className,
}: {
  label?: string;
  href: string;
  className?: string;
}) {
  return (
    <Magnet padding={40} strength={10} className={cn("inline-block", className)}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border-2 border-film px-6 py-2.5 text-[0.7rem] font-medium uppercase tracking-widest text-film transition-colors duration-300 hover:bg-film/10 sm:px-8 sm:py-3 sm:text-xs"
      >
        {label} <span aria-hidden>→</span>
      </a>
    </Magnet>
  );
}
