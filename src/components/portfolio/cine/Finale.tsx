import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Linkedin, Mail } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { cine, contactLinks, directorsChair } from "../data";
import { Logo } from "./bits";

// Scroll timeline across the pinned stage (0–1).
const RISE: [number, number] = [0, 0.14]; // camera rises into view, its screen black
const FLICKER: [number, number] = [0.17, 0.27]; // a light flickers on: a stage, an empty chair
const EXPOSE: [number, number] = [0.28, 0.44]; // exposure dial turns, -3 EV up to 0
const ZOOM: [number, number] = [0.46, 0.62]; // the screen zooms in on the chair
const SHOT = 0.65; // the shutter: flash fires and the camera is gone in the same beat
const CONTACT: [number, number] = [0.7, 0.8]; // the closing card comes up beside me

const EV_FROM = -3;
const NOTCH = 40; // degrees of dial per stop
const ZOOM_TO = 2.2;

// Contact: a camera rises into view, screen black. A light flickers on to show a stage
// with an empty director's chair; the exposure dial brings it up, the screen zooms in on
// the chair, and the shutter fires: in the flash the camera is gone and I'm in the chair,
// with how to reach me beside me. Everything is driven by scroll.
export function Finale() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const y = useTransform(p, RISE, ["120svh", "0svh"]);
  const tilt = useTransform(p, RISE, [8, 0]);
  const camera = useTransform(p, [SHOT - 0.004, SHOT + 0.004], [1, 0]);

  const lamp = useTransform(
    p,
    [FLICKER[0], 0.185, 0.195, 0.205, 0.22, 0.235, 0.25, FLICKER[1]],
    [0, 0.9, 0.1, 0.7, 0.05, 1, 0.6, 1],
  );
  const ev = useTransform(p, EXPOSE, [EV_FROM, 0]);
  const dial = useTransform(ev, (v) => (v - EV_FROM) * -NOTCH);
  const zoom = useTransform(p, ZOOM, [1, ZOOM_TO]);

  const flash = useTransform(p, [SHOT - 0.006, SHOT, SHOT + 0.06], [0, 1, 0]);
  const room = useTransform(p, [SHOT - 0.004, SHOT + 0.004], [0, 1]);

  const card = useTransform(p, CONTACT, [0, 1]);
  const cardY = useTransform(p, CONTACT, [30, 0]);
  const hint = useTransform(p, [0, 0.05], [1, 0]);

  return (
    <footer
      // Fills the corners under the projects band's rounded bottom.
      className="bg-night text-white shadow-[0_-1.75rem_0_var(--night)]"
    >
      <section
        ref={ref}
        aria-label="Contact"
        data-header="dark"
        className="relative h-[600vh] [overflow:clip]"
      >
        {/* Nav links land on the finished scene, not the empty start of the run. */}
        <span id="contact" aria-hidden className="absolute inset-x-0 bottom-0 h-svh" />

        <div className="sticky top-0 h-svh overflow-hidden bg-night">
          <motion.div style={{ opacity: room }} className="absolute inset-0">
            <Room card={card} cardY={cardY} />
          </motion.div>

          {/* The camera, centred. */}
          <motion.div
            aria-hidden
            style={{ y, rotate: tilt, opacity: camera }}
            className="pointer-events-none absolute left-1/2 top-[54%] z-20 aspect-[1.45] w-[min(92vw,96svh)] -translate-x-1/2 -translate-y-1/2 md:w-[min(64vw,96svh)]"
          >
            <Camera dial={dial}>
              <motion.div
                style={{ scale: zoom }}
                className="absolute inset-0 origin-[50%_62%] will-change-transform"
              >
                <Stage lamp={lamp} />
              </motion.div>
              <LiveView ev={ev} zoom={zoom} />
            </Camera>
          </motion.div>

          <motion.div
            aria-hidden
            style={{ opacity: flash }}
            className="pointer-events-none absolute inset-0 z-30 bg-white"
          />

          <motion.p
            aria-hidden
            style={{ opacity: hint }}
            className="micro pointer-events-none absolute inset-x-0 bottom-8 z-30 text-center text-mute-dark"
          >
            Scroll to roll camera
          </motion.p>
        </div>
      </section>
    </footer>
  );
}

/**
 * After the shot: me in the chair in a warm glow, and the card. Two columns side by side
 * from md up (photo left, text right), stacked on phones (text, then photo), so the text
 * never sits on the photo. The site footer closes the screen as its bottom row.
 */
function Room({ card, cardY }: { card: MotionValue<number>; cardY: MotionValue<number> }) {
  return (
    <div className="flex h-full flex-col bg-[#1a1a1b]">
      <Scene card={card} cardY={cardY} />
      <motion.div
        style={{ opacity: card }}
        className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/10 px-[clamp(1rem,3.2vw,3rem)] py-3 md:py-4"
      >
        <Logo className="text-lg md:text-xl" />
        <p className="micro text-[0.5rem] text-mute-dark md:text-[0.55rem]">
          © {new Date().getFullYear()} Naman Jain · AI Filmmaker · {cine.finale.place}, India
        </p>
      </motion.div>
    </div>
  );
}

function Scene({ card, cardY }: { card: MotionValue<number>; cardY: MotionValue<number> }) {
  const email = contactLinks.find((l) => l.label === "Email");
  const whatsapp = contactLinks.find((l) => l.label === "WhatsApp");
  const linkedin = contactLinks.find((l) => l.label === "LinkedIn");
  const hit = useTransform(card, (v) => (v > 0.5 ? "auto" : "none"));

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-20 md:grid md:grid-cols-2 md:pt-0">
      <motion.div
        style={{ opacity: card, y: cardY, pointerEvents: hit }}
        className="relative z-10 flex flex-col items-center px-5 text-center md:order-2 md:items-end md:justify-center md:pr-[clamp(1.5rem,6vw,7rem)] md:pl-6 md:text-right"
      >
        <p className="micro flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[0.55rem] tracking-[0.3em] text-white/85 md:px-5 md:py-2.5 md:text-[0.62rem]">
          <span aria-hidden className="size-1.5 rounded-full bg-red" />
          {cine.finale.label}
        </p>
        <h2 className="mt-3 font-serif text-[clamp(2.6rem,6.4vw,7rem)] leading-[0.95] md:mt-7">
          {cine.finale.hello} <em className="text-red">{cine.finale.name}</em>
        </h2>
        <p className="micro mt-2 text-[0.5rem] tracking-[0.3em] text-white/70 md:mt-6 md:text-[0.68rem]">
          {cine.finale.roles.join(" · ")}
        </p>
        <p className="mt-2 max-w-[36ch] text-[0.8rem] leading-relaxed text-white/75 md:mt-7 md:text-[clamp(0.95rem,1.25vw,1.25rem)]">
          {cine.finale.text}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5 md:mt-10 md:justify-end md:gap-3">
          {whatsapp && (
            <CardLink href={whatsapp.href} external tone="red">
              Let’s Talk <ArrowRight aria-hidden className="size-4" />
            </CardLink>
          )}
          {email && (
            <CardLink href={email.href} external>
              <Mail aria-hidden className="size-4" /> Email
            </CardLink>
          )}
          {linkedin && (
            <CardLink href={linkedin.href} external>
              <Linkedin aria-hidden className="size-4" /> LinkedIn
            </CardLink>
          )}
        </div>
      </motion.div>

      <div className="relative min-h-0 flex-1 md:order-1 md:h-full">
        {/* Warm key light behind and above me. */}
        <div className="absolute left-1/2 top-[38%] aspect-square w-[min(110%,80svh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(214_92_44/0.75),rgb(150_40_30/0.35)_55%,transparent)] blur-2xl" />
        <img
          src={directorsChair.src}
          alt={directorsChair.alt}
          width={directorsChair.width}
          height={directorsChair.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-x-0 bottom-0 mx-auto h-[min(92%,78svh)] w-auto max-w-full select-none object-contain object-bottom md:h-[76svh]"
        />
      </div>
    </div>
  );
}

function CardLink({
  href,
  external,
  tone = "outline",
  children,
}: {
  href: string;
  external?: boolean;
  tone?: "red" | "outline";
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.85rem] font-semibold transition-colors duration-300 md:gap-2.5 md:px-7 md:py-3.5 md:text-base lg:px-8 lg:py-4 lg:text-lg",
        tone === "red"
          ? "bg-red text-white hover:bg-red-deep"
          : "border border-white/20 bg-white/[0.03] text-white hover:border-white/50",
      )}
    >
      {children}
    </a>
  );
}

/**
 * Back of a mirrorless camera: viewfinder hump on top, the screen on the left, the
 * exposure dial, buttons and a thumb grip on the right. `children` fill the screen.
 */
function Camera({ dial, children }: { dial: MotionValue<number>; children: ReactNode }) {
  const metal =
    "bg-[linear-gradient(160deg,#28282b,#141416_55%,#0d0d0e)] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]";
  return (
    <div className="absolute inset-0 drop-shadow-[0_50px_60px_rgb(0_0_0/0.85)]">
      {/* Viewfinder hump and its eyecup. */}
      <div className={cn("absolute left-[22%] top-[-12%] h-[16%] w-[25%] rounded-t-[1.4rem]", metal)}>
        <span className="absolute inset-x-[18%] top-[22%] h-[52%] rounded-lg bg-[#060607] ring-1 ring-white/10" />
      </div>
      <div className={cn("absolute inset-0 rounded-[2.2rem]", metal)} />
      {/* Thumb grip: a raised, textured pad on the right. */}
      <div className="absolute right-[3.5%] top-[34%] h-[52%] w-[15%] rounded-[1.6rem] bg-[repeating-linear-gradient(135deg,#1b1b1e_0_3px,#151517_3px_6px)] ring-1 ring-black/60" />

      <p className="absolute left-[4.5%] top-[4.5%] font-display text-[clamp(0.8rem,1.4vw,1.3rem)] leading-none tracking-wide text-white/70">
        NJ<span className="text-red">·</span>CINEMA
      </p>

      {/* Screen. */}
      <div className="absolute left-[4.5%] top-[13%] h-[74%] w-[67%] overflow-hidden rounded-[0.9rem] bg-black ring-4 ring-[#060607]">
        {children}
      </div>

      <ExposureDial angle={dial} />

      {/* Buttons beside the grip. */}
      <div className="absolute right-[20.5%] top-[40%] flex w-[5.2%] flex-col items-center gap-[0.9vw]">
        {["Menu", "Info", "▶"].map((b) => (
          <span
            key={b}
            className="flex aspect-square w-full items-center justify-center rounded-full bg-[#1c1c1f] text-[clamp(0.35rem,0.5vw,0.55rem)] font-semibold uppercase tracking-wider text-white/55 shadow-[inset_0_-2px_3px_rgb(0_0_0/0.6)] ring-1 ring-white/10"
          >
            {b}
          </span>
        ))}
      </div>
      <span className="absolute right-[7.5%] top-[71%] aspect-square w-[7.5%] rounded-full bg-red shadow-[inset_0_-3px_4px_rgb(0_0_0/0.45)] ring-4 ring-[#1c1c1f]" />
    </div>
  );
}

/** Rear exposure-compensation dial: knurled rim, stop numbers, fixed red index. */
function ExposureDial({ angle }: { angle: MotionValue<number> }) {
  const stops = [-3, -2, -1, 0, 1, 2, 3];
  return (
    <div className="absolute right-[3.5%] top-[6%] aspect-square w-[17%]">
      <motion.svg
        viewBox="-100 -100 200 200"
        style={{ rotate: angle }}
        className="size-full drop-shadow-[0_10px_14px_rgb(0_0_0/0.7)]"
      >
        <circle r="98" fill="#1a1a1d" stroke="#2c2c30" strokeWidth="2" />
        {Array.from({ length: 72 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1="-97"
            x2="0"
            y2="-86"
            stroke="#3a3a3f"
            strokeWidth="2.2"
            transform={`rotate(${i * 5})`}
          />
        ))}
        <circle r="82" fill="#141416" stroke="#000" strokeWidth="1" />
        {stops.map((s) => (
          <g key={s} transform={`rotate(${(s - EV_FROM) * NOTCH})`}>
            <line x1="0" y1="-81" x2="0" y2="-71" stroke="#fff" strokeWidth="2.5" />
            <text
              y="-44"
              textAnchor="middle"
              fontSize="24"
              fontWeight="700"
              fill={s === 0 ? "var(--red)" : "#e8e8ea"}
              fontFamily="var(--font-display, inherit)"
            >
              {s > 0 ? `+${s}` : s}
            </text>
          </g>
        ))}
        <circle r="20" fill="#0f0f11" stroke="#26262a" strokeWidth="2" />
        <circle r="6" fill="#26262a" />
      </motion.svg>
      {/* Index mark: fixed, the dial turns under it. */}
      <span className="absolute -top-[9%] left-1/2 size-0 -translate-x-1/2 border-x-[6px] border-t-[10px] border-x-transparent border-t-red" />
    </div>
  );
}

/** Live-view overlay: underexposed at -3 EV, clearing as the dial turns, plus the HUD. */
function LiveView({ ev, zoom }: { ev: MotionValue<number>; zoom: MotionValue<number> }) {
  const dark = useTransform(ev, [EV_FROM, 0], [0.7, 0]);
  const meter = useTransform(ev, [-3, 3], ["0%", "100%"]);
  const readout = useTransform(ev, (v) => `${v <= -0.05 ? "−" : "±"}${Math.abs(v).toFixed(1)}`);
  const times = useTransform(zoom, (z) => `${z.toFixed(1)}×`);

  return (
    <div className="absolute inset-0">
      <motion.div style={{ opacity: dark }} className="absolute inset-0 bg-black" />
      {/* Rule-of-thirds grid and a centre focus box. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_33.2%,rgb(255_255_255/0.12)_33.3%,transparent_33.4%,transparent_66.6%,rgb(255_255_255/0.12)_66.7%,transparent_66.8%),linear-gradient(to_bottom,transparent_33.2%,rgb(255_255_255/0.12)_33.3%,transparent_33.4%,transparent_66.6%,rgb(255_255_255/0.12)_66.7%,transparent_66.8%)]" />
      <span className="absolute left-1/2 top-[56%] h-[22%] w-[16%] -translate-x-1/2 -translate-y-1/2 border border-white/60" />
      <div className="micro absolute inset-x-[4%] top-[5%] flex justify-between gap-3 text-[0.45rem] text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0/0.8)] md:text-[0.6rem]">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-red" /> Live
        </span>
        <span>
          <motion.span>{times}</motion.span> · 1/50 · F2.0 · ISO 800
        </span>
      </div>
      <div className="absolute inset-x-[4%] bottom-[5%] flex items-end justify-between gap-3 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.8)]">
        <div className="w-[min(260px,55%)]">
          <div className="micro flex justify-between text-[0.4rem] text-white/80 md:text-[0.55rem]">
            {["−3", "−2", "−1", "0", "+1", "+2", "+3"].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="relative mt-1 h-px bg-white/50">
            <motion.span
              style={{ left: meter }}
              className="absolute -top-1 h-2.5 w-0.5 -translate-x-1/2 bg-red"
            />
          </div>
        </div>
        <p className="font-display text-[clamp(1rem,2.2vw,2rem)] leading-none">
          <span className="micro mr-1.5 align-middle text-[0.45rem] text-white/70">EV</span>
          <motion.span>{readout}</motion.span>
        </p>
      </div>
    </div>
  );
}

/**
 * The stage seen through the screen: an empty director's chair under a spotlight. It is
 * lit only by that light, so it stays black until `lamp` flickers it on.
 */
function Stage({ lamp }: { lamp: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 bg-black">
      <motion.div style={{ opacity: lamp }} className="absolute inset-0 bg-[#0a0a0b]">
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_bottom,#0d0d0f,#1d1d20)]" />
        <div className="absolute inset-x-0 bottom-[30%] h-px bg-white/[0.07]" />
        <div className="absolute left-1/2 top-[-4%] h-full w-[110%] -translate-x-1/2 bg-[linear-gradient(to_bottom,rgb(255_236_205/0.36),rgb(255_236_205/0.1)_72%,transparent)] blur-xl [clip-path:polygon(45%_0,55%_0,82%_100%,18%_100%)]" />
        <div className="absolute bottom-[4%] left-1/2 h-[20%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_236_205/0.5),transparent)]" />
        <div className="absolute left-1/2 top-0 h-[5%] w-[12%] -translate-x-1/2 rounded-b-lg bg-[#1d1d20] shadow-[0_4px_24px_6px_rgb(255_236_205/0.4)] ring-1 ring-white/10" />
        <EmptyChair className="absolute bottom-[8%] left-1/2 h-[56%] w-auto -translate-x-1/2" />
      </motion.div>
    </div>
  );
}

/** Empty director's chair, front on: the same wood and black canvas as mine. */
function EmptyChair({ className }: { className?: string }) {
  const wood = "#e0973f";
  const lit = "#f4b765";
  const shade = "#a9652a";
  return (
    <svg viewBox="0 0 400 520" className={className} aria-hidden>
      <ellipse cx="200" cy="510" rx="190" ry="10" fill="#000" opacity="0.55" />
      {/* Back posts and backrest canvas. */}
      <rect x="62" y="40" width="22" height="300" rx="5" fill={shade} />
      <rect x="316" y="40" width="22" height="300" rx="5" fill={shade} />
      <rect x="60" y="34" width="26" height="14" rx="5" fill={lit} />
      <rect x="314" y="34" width="26" height="14" rx="5" fill={lit} />
      <path d="M84 70 Q200 62 316 70 L316 170 Q200 162 84 170 Z" fill="#111113" />
      <path d="M84 70 Q200 62 316 70" stroke="#2a2a2e" strokeWidth="3" fill="none" />
      {/* Seat canvas, sagging a little. */}
      <path d="M78 300 L322 300 L310 336 Q200 350 90 336 Z" fill="#111113" />
      {/* Armrests and front posts. */}
      <rect x="30" y="236" width="128" height="20" rx="6" fill={lit} />
      <rect x="242" y="236" width="128" height="20" rx="6" fill={lit} />
      <rect x="30" y="252" width="128" height="6" rx="3" fill={shade} />
      <rect x="242" y="252" width="128" height="6" rx="3" fill={shade} />
      <rect x="42" y="254" width="22" height="100" rx="5" fill={wood} />
      <rect x="336" y="254" width="22" height="100" rx="5" fill={wood} />
      <rect x="40" y="290" width="320" height="18" rx="5" fill={wood} />
      <rect x="40" y="304" width="320" height="5" rx="2" fill={shade} />
      {/* Crossed legs and the footrest. */}
      <path d="M66 340 L334 505" stroke={wood} strokeWidth="20" strokeLinecap="round" />
      <path d="M334 340 L66 505" stroke={shade} strokeWidth="20" strokeLinecap="round" />
      <circle cx="200" cy="422" r="8" fill="#3a2a18" />
      <rect x="120" y="440" width="160" height="10" rx="4" fill="#2a2a2e" />
    </svg>
  );
}
