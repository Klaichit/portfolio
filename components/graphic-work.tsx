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
  return <div className="work-showcase">
    <TiltedGridHero key={filter} images={images} className="work-curved-hero w-full" tileHeight={32} aspectRatio={1.05} axis={59} curve={72} gap={9} speed={5} paused={paused}>
      <div className="work-intro relative z-10 text-center">
        <p className="work-kicker">THE PORTFOLIO <span aria-live="polite">{selected.length} PROJECTS</span></p>
        <h2 id="graphic-work-title" tabIndex={-1}>Good ideas.<br /><em>Real work.</em></h2>
      </div>
      <div className="work-band-bottom absolute z-10 flex items-center justify-between">
        <p>GRAPHIC / MOTION / DIGITAL EXPERIENCES</p>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume motion" : "Pause motion"}</button>
      </div>
    </TiltedGridHero>
    <div className="work-browser">
      <div className="work-browser-top flex items-center justify-between">
        <p>EXPLORE THE WORK</p>
        <div className="work-tabs flex" role="group" aria-label="Filter selected work">{categories.map(c => <button type="button" key={c.key} aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>{c.label}</button>)}</div>
      </div>
      <div className="work-index">{selected.map((p, i) => <button type="button" className="work-index-item" key={p.slug} onClick={e => openProject(p.slug, e.currentTarget)} aria-label={`${p.type === "video" ? "Play" : "View"} ${p.title}`}>
        <span className="work-number">{String(i + 1).padStart(2, "0")}</span>
        <img src={p.image} alt="" loading="lazy" />
        <span className="work-item-copy"><strong>{p.title.replace(" / ", " — ")}</strong><small>{p.label}</small></span>
        <span className="work-action">{p.type === "video" ? "PLAY" : "VIEW"}</span>
      </button>)}</div>
    </div>
  </div>;
}
