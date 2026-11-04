import { createRoot, type Root } from "react-dom/client";
import PerspectiveTunnelHero, { type TunnelImage } from "@/components/ui/perspective-tunnel-hero";
import styles from "./styles.css?inline";

const panel = document.getElementById("graphic-portfolio");
const host = document.getElementById("perspective-tunnel-root");
if (panel && host) {
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style"); style.textContent = styles;
  const mount = document.createElement("div"); shadow.append(style, mount);
  let root: Root | undefined;
  const projects = (window as unknown as { GRAPHIC_PROJECTS?: { image: string; title: string; slug: string }[] }).GRAPHIC_PROJECTS ?? [];
  const selected = ["bluepulse", "solplanet", "sunwoda", "tcl", "atrix", "website", "bluespark", "solaredge-battery", "tcl-safety"];
  const images: TunnelImage[] = selected.flatMap(slug => {
    const p = projects.find(p => p.slug === slug);
    return p ? [{ src: p.image, title: p.title.split(" / ")[0], slug }] : [];
  });
  const sync = () => {
    if (panel.hidden) { root?.unmount(); root = undefined; return; }
    if (root) return;
    root = createRoot(mount);
    root.render(<PerspectiveTunnelHero images={images.length ? images : undefined} onExplore={() => {
      const work = document.getElementById("graphic-work");
      work?.scrollIntoView({ behavior: "instant", block: "start" });
      const heading = document.getElementById("graphic-work-title");
      heading?.setAttribute("tabindex", "-1"); heading?.focus({ preventScroll: true });
    }} />);
    host.hidden = false;
    document.querySelector<HTMLElement>(".landing-inner")!.hidden = true;
  };
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  sync();
}
