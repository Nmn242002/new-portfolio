import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { contactLinks } from "./data";

export type TicketItem = {
  id: string;
  title: string;
  thumb: string;
  /** Three short facts for the dotted meta row. */
  meta: [string, string, string];
};

const EASE = [0.25, 0.1, 0.25, 1] as const;

const menuLinks = [
  { label: "Projects", hash: "projects" },
  { label: "About", hash: "about" },
  { label: "Contact", hash: "contact" },
];

// Fixed top-right pair of cream tickets: a switcher showing the current item, which
// drops a list of every item, and a square menu ticket that opens the site menu.
export function TicketNav({
  items,
  activeId,
  onSelect,
  visible = true,
}: {
  items: TicketItem[];
  activeId: string;
  onSelect: (id: string) => void;
  visible?: boolean;
}) {
  const [open, setOpen] = useState<"list" | "menu" | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === "Escape"
          : !root.current?.contains(event.target as Node)
      )
        setOpen(null);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!active) return null;

  return (
    <div
      ref={root}
      className={cn(
        "fixed right-3 top-20 z-40 flex items-start gap-[2px] text-paper-ink transition-[opacity,transform] duration-500 sm:right-5 sm:top-24",
        visible || open ? "opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      {open !== "menu" && (
        <div className="ticket w-[min(232px,calc(100vw-5.5rem))] bg-cream">
          <button
            type="button"
            aria-expanded={open === "list"}
            aria-label={`Now showing ${active.title}. Choose another`}
            onClick={() => setOpen(open === "list" ? null : "list")}
            className="flex w-full cursor-pointer items-center gap-2 px-2.5 pb-1.5 pt-2.5 text-left"
          >
            <img src={active.thumb} alt="" className="size-7 shrink-0 rounded-[3px] object-cover" />
            <span className="min-w-0 flex-1 truncate font-reel text-[0.68rem] font-bold uppercase leading-tight">
              {active.title}
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "size-3.5 shrink-0 transition-transform duration-300",
                open === "list" && "rotate-180",
              )}
            />
          </button>
          <div className="mx-2.5 mb-2 grid grid-cols-3 border-t border-dotted border-paper-line">
            {active.meta.map((fact, i) => (
              <span
                key={i}
                className={cn(
                  "micro truncate py-1 text-center text-[0.45rem]",
                  i > 0 && "border-l border-dotted border-paper-line",
                )}
              >
                {fact}
              </span>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {open === "list" && (
              <motion.ul
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="strip max-h-[60svh] overflow-y-auto border-t border-dotted border-paper-line"
              >
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.id);
                        setOpen(null);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 border-b border-dotted border-paper-line px-2.5 py-1.5 text-left transition-colors duration-200 hover:bg-paper-ink/5",
                        item.id === active.id && "bg-paper-ink/5",
                      )}
                    >
                      <img
                        src={item.thumb}
                        alt=""
                        loading="lazy"
                        className="size-5 shrink-0 rounded-[2px] object-cover"
                      />
                      <span className="truncate font-reel text-[0.58rem] font-bold uppercase">
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {open === "menu" ? (
        <MenuPanel onClose={() => setOpen(null)} />
      ) : (
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={false}
          onClick={() => setOpen("menu")}
          className="ticket flex size-[54px] cursor-pointer items-center justify-center bg-cream transition-colors duration-300 hover:bg-white"
        >
          <span aria-hidden className="flex w-5 flex-col gap-[3px]">
            <span className="h-[2px] bg-paper-ink" />
            <span className="h-[2px] bg-paper-ink" />
          </span>
        </button>
      )}
    </div>
  );
}

function MenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-label="Site menu"
      initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.45, ease: EASE }}
      className="ticket w-[min(290px,calc(100vw-1.5rem))] bg-cream"
    >
      <div className="flex items-center justify-between border-b border-dotted border-paper-line px-4 py-3">
        <Link to="/" onClick={onClose} className="reel-title text-lg">
          Naman Jain
        </Link>
        <button
          type="button"
          autoFocus
          aria-label="Close menu"
          onClick={onClose}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-paper-ink/10"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <nav className="px-4 py-4">
        <ol className="space-y-1">
          {menuLinks.map((link, i) => (
            <li key={link.hash} className="flex items-baseline gap-2">
              <span className="micro text-[0.5rem] opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Link
                to="/"
                hash={link.hash}
                onClick={onClose}
                className="reel-title text-2xl transition-opacity duration-200 hover:opacity-60"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <ul className="space-y-1 border-t border-dotted border-paper-line px-4 py-3">
        {contactLinks
          .filter((link) => link.href)
          .map((link) => (
            <li key={link.label} className="flex items-baseline justify-between gap-3">
              <span className="micro text-[0.5rem] opacity-60">{link.label}</span>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="truncate font-reel text-[0.65rem] font-semibold uppercase hover:underline"
              >
                {link.value}
              </a>
            </li>
          ))}
      </ul>
      <p className="micro border-t border-dotted border-paper-line px-4 py-2 text-[0.45rem] opacity-60">
        © {new Date().getFullYear()} Naman Jain · AI Creative Director &amp; Filmmaker
      </p>
    </motion.div>
  );
}
