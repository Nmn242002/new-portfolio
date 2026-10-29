import { createFileRoute } from "@tanstack/react-router";

import { CineHero } from "@/components/portfolio/cine/CineHero";
import { About } from "@/components/portfolio/cine/About";
import { Finale } from "@/components/portfolio/cine/Finale";
import { Record } from "@/components/portfolio/cine/Record";
import { SiteHeader } from "@/components/portfolio/cine/SiteHeader";
import { Projects } from "@/components/portfolio/cine/Projects";
import { FilmCursor } from "@/components/portfolio/film";

const title = "Naman Jain | AI Filmmaker";
const description =
  "AI filmmaker in Delhi. Script, characters, shots, sound and edit for PhysicsWallah’s sci-fi series Project Earth.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SiteHeader />
      <FilmCursor />
      <main className="min-h-screen bg-night" style={{ overflowX: "clip" }}>
        <CineHero />
        <Record />
        <About />
        <Projects />
        <Finale />
      </main>
    </>
  );
}
