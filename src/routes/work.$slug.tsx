import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProjectPage } from "@/components/portfolio/ProjectPage";
import { projects } from "@/components/portfolio/data";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { slug: project.slug };
  },
  head: ({ loaderData }) => {
    const project = projects.find((p) => p.slug === loaderData?.slug);
    const title = project ? `${project.short} | Naman Jain` : "Naman Jain | AI Creative Director & Filmmaker";
    const description = project?.points[0] ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(project ? [{ property: "og:image", content: project.cover }] : []),
      ],
    };
  },
  component: Work,
});

function Work() {
  const { slug } = Route.useLoaderData();
  const project = projects.find((p) => p.slug === slug)!;
  // Keyed so switching projects remounts the page and replays its entrance.
  return <ProjectPage key={project.slug} project={project} />;
}
