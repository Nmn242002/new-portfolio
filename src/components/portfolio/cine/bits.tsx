import { ArrowUpRight } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { heroPortrait } from "../data";

/** Tiny tracked caps label with the red dotted disc in front of it. */
export function Label({
  children,
  className,
  dot = true,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <p className={cn("micro flex items-center gap-2", className)}>
      {dot && (
        <span aria-hidden className="relative inline-block size-2.5 shrink-0 rounded-full bg-red">
          <span className="absolute inset-[3px] rounded-full bg-current opacity-60" />
        </span>
      )}
      {children}
    </p>
  );
}

/** Small paragraph with an uppercase lead-in, like "PART A … text". */
export function Blurb({
  lead,
  text,
  className,
}: {
  lead: string;
  text: string;
  className?: string;
}) {
  return (
    <p className={cn("text-[0.72rem] leading-[1.45]", className)}>
      <span className="mr-3 font-semibold uppercase">{lead}</span>
      {text}
    </p>
  );
}

/** Outlined pill CTA with an up-right arrow ("BOOK NOW ↗"). */
export function PillLink({
  children,
  tone = "light",
  className,
  ...props
}: ComponentProps<"a"> & { tone?: "light" | "dark" | "red" }) {
  return (
    <a
      {...props}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-display text-lg leading-none tracking-wide transition-colors duration-300",
        tone === "light" && "border-white/80 text-white hover:bg-white hover:text-night",
        tone === "dark" && "border-ink text-ink hover:bg-ink hover:text-white",
        tone === "red" && "border-red bg-red text-white hover:bg-red-deep",
        className,
      )}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}

/** Spinning circular sticker: red disc, ringed text, initials in the middle. */
export function Sticker({
  className,
  text = "AI Filmmaker • Naman Jain • ",
}: {
  className?: string;
  text?: string;
}) {
  const ring = useId();
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-16 items-center justify-center md:size-20",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 size-full">
        <defs>
          <path id={ring} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="var(--red)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#0b0b0c" strokeWidth="1.5" />
        <text fill="#fff" fontSize="10.5" fontFamily="Bebas Neue, sans-serif" letterSpacing="1.5">
          <textPath href={`#${ring}`}>{text}</textPath>
        </text>
      </svg>
      <span className="relative flex size-[46%] -rotate-12 items-center justify-center rounded-full bg-night font-display text-lg leading-none text-white md:text-xl">
        NJ
      </span>
    </span>
  );
}

// Six aperture blades: each hexagon edge carried past its vertex to the rim.
const HEX = Array.from({ length: 6 }, (_, k) => {
  const a = ((k * 60 + 30) * Math.PI) / 180;
  return [10 + 3.6 * Math.cos(a), 10 + 3.6 * Math.sin(a)] as const;
});
const BLADES = HEX.map(([x0, y0], k) => {
  const [x1, y1] = HEX[(k + 1) % 6]!;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len];
  const b = (x1 - 10) * ux + (y1 - 10) * uy;
  const t = -b + Math.sqrt(b * b - ((x1 - 10) ** 2 + (y1 - 10) ** 2 - 64));
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${(x1 + ux * t).toFixed(2)} ${(y1 + uy * t).toFixed(2)}`;
}).join("");

/** Red camera aperture, sized to sit in a line of display type as a letter "O". */
export function Aperture({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn("size-[0.74em]", className)}>
      <circle cx="10" cy="10" r="9.5" fill="var(--red)" />
      <circle cx="10" cy="10" r="8" fill="none" stroke="#0b0b0c" strokeWidth="0.8" />
      <path d={BLADES} stroke="#0b0b0c" strokeWidth="0.9" />
      <polygon points={HEX.map((p) => p.join(",")).join(" ")} fill="#0b0b0c" />
    </svg>
  );
}

/** Logo: PORTFOLIO, its first "O" a camera aperture. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center font-display text-2xl leading-none", className)}
      aria-label="Portfolio"
    >
      <span aria-hidden>P</span>
      <Aperture className="mx-[0.03em] -translate-y-[0.02em] animate-[spin_9s_linear_infinite]" />
      <span aria-hidden>RTFOLIO</span>
    </span>
  );
}

/** The cut-out portrait. Sides are feathered where the source crops the shoulders. */
export function Avatar({
  className,
  priority,
  fade,
  feather = true,
}: {
  className?: string;
  priority?: boolean;
  /** Also fade out the bottom edge, where the source crops the chest. */
  fade?: boolean;
  /** Feather the sides. Off when a frame crops the shoulders instead. */
  feather?: boolean;
}) {
  const mask =
    [
      ...(feather
        ? ["linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)"]
        : []),
      ...(fade ? ["linear-gradient(to top, transparent, #000 22%)"] : []),
    ].join(", ") || "none";
  return (
    <img
      src={heroPortrait.src}
      alt={heroPortrait.alt}
      width={heroPortrait.width}
      height={heroPortrait.height}
      draggable={false}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? undefined : "lazy"}
      className={cn("select-none object-contain object-bottom", className)}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    />
  );
}
