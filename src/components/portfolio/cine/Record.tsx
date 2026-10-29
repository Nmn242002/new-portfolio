import { motion, useSpring, useTransform, useScroll, type MotionValue } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

import { cine } from "../data";
import { Label } from "./bits";

const tracks = cine.record;

// Scroll timeline across the pinned stage (0–1). The arm swings in, then each track gets
// a short needle move, one full turn of the disc while its ring is pressed, and a hold so
// its caption can be read before the next one starts. The arm lifts off at the end.
const SWING = [0.03, 0.1] as const;
const PERIOD = 0.2;
const MOVE = 0.025;
const PRESS = 0.11;
const LIFT = [0.9, 0.96] as const;
const starts = tracks.map((_, i) => 0.12 + i * PERIOD);

// Disc angle (degrees) by scroll: a slow creep between tracks, a full turn per track.
const SPIN_IN = [0.08, ...starts.flatMap((a) => [a, a + PRESS]), 1];
const SPIN_OUT = [
  0,
  ...starts.flatMap((_, i) => [20 + i * 400, 380 + i * 400]),
  20 + tracks.length * 400,
];
const angleAt = (i: number) => 20 + i * 400;

const RINGS = [
  { r: 0.86, size: 0.1 },
  { r: 0.72, size: 0.068 },
  { r: 0.6, size: 0.058 },
  { r: 0.465, size: 0.05 },
];

type Stage = { w: number; h: number };

// Black band: a record on the platter, the tonearm parked bottom-left. Scrolling swings
// the arm onto the disc; as the disc turns the needle presses each credit into it, ring
// by ring, while the same credit is captioned large enough to read.
export function Record() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hint = useTransform(scrollYProgress, [0, SWING[0]], [1, 0]);

  return (
    <section
      ref={ref}
      data-header="dark"
      aria-label="Directed by Naman Jain"
      // The shadow fills the corners under the stats band's rounded bottom without
      // pulling this section up underneath it.
      className="relative z-[3] h-[450vh] rounded-b-[1.75rem] border-b-[3px] border-red bg-night text-white shadow-[0_-1.75rem_0_var(--night)] [overflow:clip]"
    >
      <h2 className="sr-only">Directed by Naman Jain</h2>
      <ol className="sr-only">
        {tracks.map((t) => (
          <li key={t.title}>
            {t.kicker} {t.title}. {t.text}
          </li>
        ))}
      </ol>

      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        {stage && <Turntable stage={stage} progress={scrollYProgress} />}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-[clamp(1rem,3.2vw,3rem)] pt-24">
          <Label className="text-white/80">Side A</Label>
          <p className="micro text-mute-dark">33⅓ rpm</p>
        </div>

        <motion.p
          style={{ opacity: hint }}
          className="micro pointer-events-none absolute inset-x-0 bottom-14 text-center text-mute-dark md:bottom-8"
        >
          Scroll to drop the needle
        </motion.p>
      </div>
    </section>
  );
}

/** Where everything sits for a given stage size. */
function layout({ w, h }: Stage) {
  const wide = w >= 768;
  const gutter = Math.min(48, Math.max(16, w * 0.032));
  const column = 300; // caption column right of the disc on wide screens

  // On wide screens the disc and the parked arm stay clear of the fixed header and the
  // "Side A" row above, and of the scroll hint below.
  const top = 120;
  const bottom = 60;
  const r = wide
    ? Math.min((h - top - bottom) / 2.12, (w - gutter * 2 - column - 180) / 2.12)
    : Math.min(w * 0.4, h * 0.27);
  const rim = r * 1.06;
  const cx = wide ? Math.min(w / 2, w - gutter - column - 40 - rim) : w / 2;
  const cy = wide ? top + (h - top - bottom) / 2 : h * 0.56;

  // Pivot parked in the bottom-left corner: pointing up on wide screens, along the
  // bottom edge on phones where the disc fills the width.
  const py = h - (wide ? 70 : 28);
  // The arm reaches 0.3r past the disc centre and parks straight up, so on short screens
  // the pivot moves in toward the disc until the parked headshell clears the header.
  const reach = py - top + r * 0.3;
  const fit = cx - Math.sqrt(Math.max(0, reach * reach - (py - cy) ** 2));
  const px = wide ? Math.max(gutter + 40, w * 0.06, fit) : w * 0.08;
  const parked = wide ? -92 : 4;

  // A real arm has one length; the stylus traces an arc, so each ring has its own angle.
  const d = Math.hypot(cx - px, cy - py);
  const len = d - r * 0.3;
  const toCentre = Math.atan2(cy - py, cx - px);
  const stylus = RINGS.map(({ r: k }) => {
    const rho = r * k;
    const phi = Math.acos((len * len + d * d - rho * rho) / (2 * len * d));
    const a = toCentre + phi;
    const tx = px + Math.cos(a) * len;
    const ty = py + Math.sin(a) * len;
    return { arm: (a * 180) / Math.PI, at: (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI };
  });

  return { wide, gutter, column, r, rim, cx, cy, px, py, parked, len, stylus };
}

// Everything that moves is its own layer, drawn once: the record turns and the arm swings
// as whole layers on the compositor, so scrolling never redraws the SVG. Only a ring's
// letters repaint, once each, as the needle reaches them.
function Turntable({ stage, progress }: { stage: Stage; progress: MotionValue<number> }) {
  const { w, h } = stage;
  const L = layout(stage);
  const { r, rim, cx, cy, px, py, stylus } = L;
  const s = r / 500;

  const raw = useTransform(progress, SPIN_IN, SPIN_OUT);
  const angle = useSpring(raw, { stiffness: 180, damping: 30 });

  const armAngle = useTransform(
    progress,
    [SWING[0], SWING[1], ...starts.slice(1).flatMap((a) => [a - MOVE, a]), LIFT[0], LIFT[1]],
    [
      L.parked,
      stylus[0]!.arm,
      ...stylus.slice(1).flatMap((st, i) => [stylus[i]!.arm, st.arm]),
      stylus.at(-1)!.arm,
      L.parked,
    ],
  );

  // Disc-local drawing: the record's centre is (r, r).
  const grooves = Array.from({ length: 40 }, (_, i) => r * (0.38 + (i / 39) * 0.58));

  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="absolute inset-0">
        {/* Guide cross-hair through the platter; its rim is the guide ring. */}
        <path d={`M0 ${cy}H${w}M${cx} 0V${h}`} stroke="var(--line-dark)" />
        <circle cx={cx} cy={cy} r={rim} fill="var(--night-2)" stroke="var(--line-dark)" />
        <circle cx={cx} cy={cy} r={r} fill="#050506" />
        {/* Tonearm base plate stays put. */}
        <circle cx={px} cy={py} r={46 * s} fill="var(--night-2)" stroke="var(--line-dark)" />
        <circle cx={px} cy={py} r={34 * s} fill="none" stroke="var(--line-dark)" />
      </svg>

      <motion.div
        aria-hidden
        className="absolute will-change-transform"
        style={{ left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, rotate: angle }}
      >
        <svg
          viewBox={`0 0 ${2 * r} ${2 * r}`}
          className="absolute inset-0 size-full"
          fontFamily="Bebas Neue, sans-serif"
        >
          {grooves.map((gr, i) => (
            <circle
              key={i}
              cx={r}
              cy={r}
              r={gr}
              fill="none"
              stroke="#fff"
              strokeOpacity={i % 6 === 0 ? 0.08 : 0.03}
              strokeWidth={i % 6 === 0 ? 1.1 : 0.6}
            />
          ))}

          {/* Red centre label. */}
          <circle
            cx={r}
            cy={r}
            r={r * 0.36}
            fill="none"
            stroke="var(--red-deep)"
            strokeWidth={r * 0.012}
          />
          <circle cx={r} cy={r} r={r * 0.34} fill="var(--red)" />
          <circle
            cx={r}
            cy={r}
            r={r * 0.325}
            fill="none"
            stroke="#0b0b0c"
            strokeWidth={r * 0.004}
          />
          <text
            x={r}
            y={r - r * 0.17}
            textAnchor="middle"
            fill="#0b0b0c"
            fontSize={r * 0.05}
            letterSpacing={r * 0.008}
          >
            DIRECTED BY
          </text>
          <text x={r} y={r - r * 0.05} textAnchor="middle" fill="#fff" fontSize={r * 0.11}>
            NAMAN JAIN
          </text>
          <text
            x={r}
            y={r + r * 0.14}
            textAnchor="middle"
            fill="#0b0b0c"
            fontSize={r * 0.042}
            letterSpacing={r * 0.006}
          >
            SIDE A · STEREO
          </text>
          <circle cx={r} cy={r} r={r * 0.02} fill="var(--night)" />
        </svg>

        {tracks.map((t, i) => (
          <PressedRing
            key={t.title}
            c={r}
            r={r * RINGS[i]!.r}
            size={r * RINGS[i]!.size}
            text={t.ring}
            // The ring starts where the needle sits on the disc when its track begins.
            from={stylus[i]!.at - angleAt(i)}
            angle={angle}
            begin={angleAt(i)}
            tone={i === 0 ? "#fff" : "rgb(255 255 255 / 0.62)"}
          />
        ))}
      </motion.div>

      {/* Fixed highlights: the light sits still while the record turns under it. */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <path d={wedge(cx, cy, r * 0.98, r * 0.4, -2.25, -1.9)} fill="#fff" opacity={0.045} />
        <path d={wedge(cx, cy, r * 0.98, r * 0.4, 0.9, 1.25)} fill="#fff" opacity={0.03} />
      </svg>

      <Tonearm px={px} py={py} len={L.len} s={s} angle={armAngle} />

      {tracks.map((t, i) => (
        <Caption key={t.title} index={i} track={t} progress={progress} L={L} h={h} />
      ))}
    </>
  );
}

/** Large, readable caption for the track the needle is on. */
function Caption({
  index,
  track,
  progress,
  L,
  h,
}: {
  index: number;
  track: (typeof tracks)[number];
  progress: MotionValue<number>;
  L: ReturnType<typeof layout>;
  h: number;
}) {
  const a = starts[index]!;
  // The last caption stays up to the end (scroll offsets must stay within 0–1).
  const last = index === tracks.length - 1;
  const out = last ? 1 : starts[index + 1]! - MOVE;
  const at = last ? [a - 0.012, a + 0.02] : [a - 0.012, a + 0.02, out - 0.015, out];
  const opacity = useTransform(progress, at, last ? [0, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, at, last ? [28, 0] : [28, 0, 0, -20]);

  const place = L.wide
    ? { left: L.cx + L.rim + 40, width: L.column, top: L.cy, translateY: "-50%" }
    : { left: L.gutter, right: L.gutter, top: 92, height: L.cy - L.rim - 92 - 12 };

  return (
    <motion.div
      aria-hidden
      style={{ ...place, opacity, y }}
      className={
        L.wide
          ? "pointer-events-none absolute will-change-transform"
          : "pointer-events-none absolute flex flex-col items-center justify-end text-center will-change-transform"
      }
    >
      <p className="micro text-mute-dark">
        Track {String(index + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
      </p>
      <Label className={L.wide ? "mt-5 text-white/80" : "mt-3 text-white/80"}>{track.kicker}</Label>
      <p
        className={
          L.wide
            ? "mt-3 font-display text-[clamp(2.6rem,4.4vw,4.75rem)] leading-[0.88]"
            : "mt-2 font-display text-[clamp(2rem,9vw,2.8rem)] leading-[0.9]"
        }
      >
        {track.title}
      </p>
      <p
        className={
          L.wide
            ? "mt-4 max-w-[260px] text-[0.72rem] leading-[1.45] text-mute-dark"
            : "mt-2 text-[0.72rem] leading-[1.45] text-mute-dark"
        }
        style={h < 600 && !L.wide ? { display: "none" } : undefined}
      >
        {track.text}
      </p>
    </motion.div>
  );
}

/**
 * A ring of text pressed into the disc, in disc-local coordinates around (c, c). The text
 * runs anticlockwise from `from` degrees, so as the disc turns clockwise its letters come
 * up under the needle in reading order. Each letter fades in once the disc has turned far
 * enough past `begin` to bring it under the needle.
 */
function PressedRing({
  c,
  r,
  size,
  text,
  from,
  angle,
  begin,
  tone,
}: {
  c: number;
  r: number;
  size: number;
  text: string;
  from: number;
  angle: MotionValue<number>;
  begin: number;
  tone: string;
}) {
  const textRef = useRef<SVGTextElement>(null);
  const id = useId();
  const length = 2 * Math.PI * r;
  // Repeat the phrase to roughly fill the circle (Bebas runs ~0.42em a glyph), then let
  // textLength close the last gap.
  const line = text
    .toUpperCase()
    .repeat(Math.max(1, Math.round(length / (text.length * size * 0.42))));

  const a = (from * Math.PI) / 180;
  const sx = c + Math.cos(a) * r;
  const sy = c + Math.sin(a) * r;
  const ox = c - Math.cos(a) * r;
  const oy = c - Math.sin(a) * r;
  const path = `M${sx},${sy} A${r},${r} 0 1,0 ${ox},${oy} A${r},${r} 0 1,0 ${sx},${sy}`;

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const glyphs = [...el.querySelectorAll("tspan")];
    // How far round (degrees, anticlockwise from `from`) each letter starts.
    let at: number[] = [];
    let shown = -1;

    const apply = (turned: number) => {
      const swept = Math.min(360, Math.max(0, turned - begin));
      let n = 0;
      while (n < at.length && at[n]! <= swept) n++;
      if (n === shown) return;
      const lo = shown < 0 ? 0 : Math.min(n, shown);
      const hi = shown < 0 ? glyphs.length : Math.max(n, shown);
      for (let k = lo; k < hi; k++) glyphs[k]!.style.fillOpacity = k < n ? "1" : "0";
      shown = n;
    };
    const measure = () => {
      let prev = from;
      let total = 0;
      at = glyphs.map((_, k) => {
        try {
          const p = el.getStartPositionOfChar(k);
          const deg = (Math.atan2(p.y - c, p.x - c) * 180) / Math.PI;
          const step = (((prev - deg) % 360) + 360) % 360;
          total += k === 0 && step > 180 ? 0 : step;
          prev = deg;
          return total;
        } catch {
          return (k / glyphs.length) * 360;
        }
      });
      shown = -1;
      apply(angle.get());
    };

    measure();
    void document.fonts?.ready.then(measure);
    return angle.on("change", apply);
  }, [angle, begin, from, c, line]);

  return (
    <svg
      viewBox={`0 0 ${2 * c} ${2 * c}`}
      className="absolute inset-0 size-full will-change-transform"
      fontFamily="Bebas Neue, sans-serif"
    >
      <defs>
        <path id={`${id}-p`} d={path} />
      </defs>
      <text ref={textRef} fill={tone} fontSize={size} dy={size * 0.36}>
        <textPath href={`#${id}-p`} textLength={length * 0.995} lengthAdjust="spacing">
          {[...line].map((ch, k) => (
            <tspan key={k} style={{ fillOpacity: 0, transition: "fill-opacity 0.2s ease-out" }}>
              {ch}
            </tspan>
          ))}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Tonearm drawn along +x from its pivot at (pad, pad) in its own layer, which turns about
 * the pivot to aim it. The shadow is rasterised once with the layer.
 */
function Tonearm({
  px,
  py,
  len,
  s,
  angle,
}: {
  px: number;
  py: number;
  len: number;
  s: number;
  angle: MotionValue<number>;
}) {
  const pad = 90 * s;
  const width = pad + len + 40 * s;
  const bend = len * 0.8;
  const o = pad; // pivot, both axes

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute will-change-transform"
      style={{
        left: px - pad,
        top: py - pad,
        width,
        height: 2 * pad,
        rotate: angle,
        transformOrigin: `${pad}px ${pad}px`,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${2 * pad}`}
        className="size-full overflow-visible"
        style={{ filter: "drop-shadow(0 6px 8px rgb(0 0 0 / 0.55))" }}
      >
        {/* Counterweight behind the pivot. */}
        <rect
          x={o - 72 * s}
          y={o - 16 * s}
          width={40 * s}
          height={32 * s}
          rx={6 * s}
          fill="#d9d9dc"
        />
        <rect x={o - 32 * s} y={o - 5 * s} width={32 * s} height={10 * s} fill="#9a9aa0" />
        {/* Tube: straight run, then a short dog-leg into the headshell. */}
        <path
          d={`M${o},${o} L${o + bend},${o - len * 0.05} L${o + len - 12 * s},${o}`}
          fill="none"
          stroke="#e6e6e8"
          strokeWidth={6 * s}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform={`rotate(22 ${o + len} ${o})`}>
          <rect
            x={o + len - 26 * s}
            y={o - 9 * s}
            width={38 * s}
            height={18 * s}
            rx={3 * s}
            fill="var(--red)"
          />
          <rect
            x={o + len + 12 * s}
            y={o - 3 * s}
            width={12 * s}
            height={6 * s}
            rx={2 * s}
            fill="#e6e6e8"
          />
          <circle cx={o + len} cy={o} r={2.5 * s} fill="#0b0b0c" />
        </g>
        <circle cx={o} cy={o} r={18 * s} fill="#e6e6e8" />
        <circle cx={o} cy={o} r={8 * s} fill="var(--red)" />
      </svg>
    </motion.div>
  );
}

// Annular sector between radii r0 > r1 from angle a0 to a1 (radians).
function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  return `M${p(r0, a0)} A${r0},${r0} 0 0,1 ${p(r0, a1)} L${p(r1, a1)} A${r1},${r1} 0 0,0 ${p(r1, a0)} Z`;
}
