import { useEffect, useRef, useState } from "react";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Scene } from "./data";

// Plays the preview only while it is on screen. Not gated on prefers-reduced-motion,
// which Windows reports whenever animation effects are off.
export function useInViewAutoplay() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// Plays the full scene in-page from the site's own files, without a download control.
export function ScenePlayer({ scene }: { scene: Scene }) {
  return (
    <DialogContent className="max-w-[min(1100px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-[1.25rem] border-film-line bg-canvas p-0 sm:rounded-[1.25rem]">
      <div className="flex items-baseline gap-3 px-5 py-4 pr-12 text-white">
        <DialogDescription className="sr-only">Full scene</DialogDescription>
        <DialogTitle className="reel-title text-xl">{scene.title}</DialogTitle>
      </div>
      <FullScene scene={scene} />
    </DialogContent>
  );
}

// Mounted only while the dialog is open. Starts the scene with sound forced on; if the
// browser refuses unmuted playback, a button gives it the direct click it needs.
function FullScene({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  const playWithSound = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play().then(
      () => setBlocked(false),
      () => setBlocked(true),
    );
  };

  useEffect(playWithSound, []);

  return (
    <div className="relative">
      <video
        ref={ref}
        // A media fragment opens shared videos at this scene's first shot.
        src={scene.start ? `${scene.full}#t=${scene.start}` : scene.full}
        poster={scene.poster}
        controls
        playsInline
        preload="auto"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="block max-h-[calc(100svh-8rem)] w-full bg-black object-contain"
      />
      {blocked && (
        <button
          type="button"
          onClick={playWithSound}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 bg-black/50"
        >
          <PlayGlyph />
          <span className="micro text-cinema">Play with sound</span>
        </button>
      )}
    </div>
  );
}

/** The red play triangle used on every watch target. */
export function PlayGlyph({ className = "size-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M6 3.5v17l15-8.5z" fill="var(--cinema-red)" />
    </svg>
  );
}
