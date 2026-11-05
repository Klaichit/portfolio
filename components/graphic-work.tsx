import { useMemo, useState } from "react";
import TiltedGridHero from "@/components/ui/tilted-grid-hero";
export interface GraphicProject { image: string; title: string; slug: string; type: string; label: string }
const categories = [{ key: "all", label: "All work" }, { key: "graphic", label: "Graphic" }, { key: "video", label: "Motion & Video" }, { key: "website", label: "Website" }];
export default function GraphicWork({ projects }: { projects: GraphicProject[] }) {
  const [filter, setFilter] = useState("all");
  const [paused, setPaused] = useState(false);
  const selected = useMemo(() => projects.filter(p => filter === "all" || p.type === filter), [projects, filter]);
  const images = useMemo(() => selected.map(p => ({ src: p.image, alt: p.title })), [selected]);
  const openProject = (slug: string, trigger: HTMLButtonElement) => {
    const card = document.querySelector<HTMLButtonElement>(`.graphic-card[data-slug="${slug}"]`);
    card?.click();
    document.getElementById("work-viewer")?.addEventListener("close", () => trigger.focus({ preventScroll: true }), { once: true });
  };
  const renderProject = (p: GraphicProject, featured = false) => (
    <button type="button" key={p.slug} data-project={p.slug}
      className={`editorial-card ${featured ? "editorial-lead" : ""} editorial-${p.type}`}
      onClick={e => openProject(p.slug, e.currentTarget)}
      aria-label={`${p.type === "video" ? "Play" : "View"} ${p.title}`}>
      <span className="editorial-media">
        <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
        {p.type === "video" && <span className="editorial-play" aria-hidden="true">{"\u25b6"}</span>}
        {p.type === "website" && <span className="editorial-web-label" aria-hidden="true">WEBSITE PREVIEW</span>}
      </span>
      <span className="editorial-caption">
        <strong>{p.title.replace(" / ", " \u2014 ")}</strong>
        <small>{p.label}</small>
      </span>
    </button>
  );
  return <div className="work-showcase">
    <TiltedGridHero key={filter} images={images} className="work-curved-hero w-full" tileHeight={32} aspectRatio={1.05} axis={59} curve={60} gap={9} speed={5} paused={paused}>
      <div className="work-intro relative z-10 text-center">
        <p className="work-kicker">THE PORTFOLIO <span aria-live="polite">{selected.length} PROJECTS</span></p>
        <h2 id="graphic-work-title" tabIndex={-1}>A selection<br /><em>of my work.</em></h2>
      </div>
      <div className="work-band-bottom absolute z-10 flex items-center justify-between">
        <p>GRAPHIC / MOTION / DIGITAL EXPERIENCES</p>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume motion" : "Pause motion"}</button>
      </div>
    </TiltedGridHero>
    <div className="work-browser">
      <div className="graphic-profile-copy">
        <h3>About my work</h3>
        <p>I work on product graphics, social media visuals, motion graphics, video editing and website layouts. I enjoy finding ways to turn a brief into something clear and easy to understand.</p>
        <p>I adapt ideas and tools to suit the work, including AI where it helps the process. I think through tasks in steps, communicate directly and take responsibility for my part. I enjoy working with others and exchanging ideas.</p>
      </div>
      <div className="work-browser-top flex items-center justify-between">
        <p>EXPLORE THE WORK</p>
        <div className="work-tabs flex" role="group" aria-label="Filter selected work">{categories.map(c => <button type="button" key={c.key} aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>{c.label}</button>)}</div>
      </div>
      <div className="editorial-gallery">
        {filter === "all" && <div className="editorial-featured">
          {["bluepulse", "bluespark", "website"].map(slug => {
            const project = selected.find(p => p.slug === slug);
            return project ? renderProject(project, slug === "bluepulse") : null;
          })}
        </div>}
        <div className="editorial-grid">
          {selected.filter(p => filter !== "all" || !["bluepulse", "bluespark", "website"].includes(p.slug)).map(p => renderProject(p))}
        </div>
      </div>
    </div>
  </div>;
}
