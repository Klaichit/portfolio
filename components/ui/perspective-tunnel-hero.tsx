"use client";

// Adapted from Daiwiik Harihar's Perspective Tunnel Hero (21st.dev, MIT).
// Native page scroll replaces wheel interception so touch/keyboard can exit the hero.
import { motion, useTransform, useReducedMotion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface TunnelImage { src: string; title: string; slug?: string }
const IMAGES: TunnelImage[] = [
  { src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=640&q=80", title: "Landscape study" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&q=80", title: "Mountain study" },
  { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80", title: "Forest study" },
];
interface StageDimensions { width: number; height: number; isMobile: boolean }
interface TunnelCardData {
  item: TunnelImage; angleCos: number; angleSin: number;
  radiusFactorX: number; radiusFactorY: number; rotationZ: number; index: number;
}
const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };
function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG), y = useSpring(rawY, SPRING_CONFIG);
  useEffect(() => {
    if (!enabled) { rawX.set(0); rawY.set(0); return; }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}
function TunnelCard({ card, progress, pointer, total, stage }: {
  card: TunnelCardData; progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> }; total: number; stage: StageDimensions;
}) {
  const start = (card.index / total) * 0.45;
  const localProgress = useTransform(progress, [start, start + 0.55], [0, 1]);
  const z = useTransform(localProgress, [0, 1], [stage.isMobile ? -1200 : -1700, stage.isMobile ? 350 : 500]);
  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);
  const width = stage.isMobile ? Math.max(130, Math.min(180, stage.width * 0.38)) : Math.max(180, Math.min(270, stage.width * 0.18));
  const baseX = card.angleCos * stage.width * card.radiusFactorX;
  const baseY = card.angleSin * stage.height * card.radiusFactorY;
  const strength = stage.isMobile ? 20 : 45;
  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]) =>
    `translate3d(calc(-50% + ${baseX - Number(px) * strength}px), calc(-50% + ${baseY - Number(py) * strength}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`);
  return <motion.div aria-hidden="true" className="tunnel-card absolute left-1/2 top-1/2 aspect-[4/5] select-none" style={{ width, transform, opacity, zIndex: card.index + 1 }}>
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <img src={card.item.src} alt="" draggable={false} className="h-full w-full object-cover" />
      <div className="card-caption absolute inset-0 flex items-end p-4"><span className="text-xs uppercase tracking-widest">{card.item.title}</span></div>
    </div>
  </motion.div>;
}

export interface PerspectiveTunnelHeroProps {
  images?: TunnelImage[];
  onExplore?: () => void;
}
export default function PerspectiveTunnelHero({ images = IMAGES, onExplore }: PerspectiveTunnelHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const preferredReducedMotion = useReducedMotion();
  const [reduce, setReduce] = useState(Boolean(preferredReducedMotion));
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [stage, setStage] = useState<StageDimensions>({ width: 1440, height: 900, isMobile: false });
  const rawProgress = useMotionValue(0.16);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });
  useEffect(() => {
    const el = containerRef.current, viewport = viewportRef.current;
    if (!el || !viewport) return;
    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const travel = el.offsetHeight - viewport.offsetHeight;
        const p = travel > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel)) : 0;
        rawProgress.set(0.16 + p * 0.84);
      });
    };
    const updateDimensions = () => {
      setStage({ width: viewport.clientWidth, height: viewport.clientHeight, isMobile: viewport.clientWidth < 768 });
      updateScroll();
    };
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(viewport); updateDimensions();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", updateScroll); };
  }, [rawProgress, reduce]);
  const pointer = useCameraParallax(!reduce && !stage.isMobile);
  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
  const promptOpacity = useTransform(smoothProgress, [0.16, 0.3], [1, 0]);
  const cards: TunnelCardData[] = images.map((item, index) => ({
    item, index, angleCos: Math.cos(index * 137.5 * Math.PI / 180), angleSin: Math.sin(index * 137.5 * Math.PI / 180),
    radiusFactorX: 0.28 + (index % 3) * 0.08, radiusFactorY: 0.26 + (index % 2) * 0.09,
    rotationZ: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
  }));
  return <div ref={containerRef} className={`tunnel-scroll ${reduce ? "reduced" : ""}`}>
    <div ref={viewportRef} className="tunnel-viewport sticky top-0 w-full overflow-hidden flex items-center justify-center">
      <div className="tunnel-grid pointer-events-none absolute inset-0" />
      <div className="tunnel-meta absolute"><span>MULTIMEDIA DESIGNER<br />KLAICHIT KAEOMAN</span><span>BANGKOK / THAILAND</span></div>
      <div className="tunnel-space pointer-events-none absolute inset-0" style={{ perspective: stage.isMobile ? "900px" : "1200px" }}>
        <div className="tunnel-ring" /><div className="tunnel-ring outer" />
        <motion.div style={reduce ? undefined : { scale: titleScale, opacity: titleOpacity }} className="tunnel-title absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="tunnel-eyebrow">GRAPHIC · MOTION · VIDEO · WEB</p>
          <h1>GRAPHIC &amp;<br /><em>DIGITAL.</em></h1>
          <p className="tunnel-description">I'm Klaichit. I work across graphic design,<br />motion, video and website design.</p>
        </motion.div>
        {!reduce && <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map(card => <TunnelCard key={card.item.src + card.index} card={card} progress={smoothProgress} pointer={pointer} total={cards.length} stage={stage} />)}
        </div>}
      </div>
      {reduce && <div className="still-strip" aria-hidden="true">{images.slice(0, 4).map(item => <img key={item.src} src={item.src} alt="" />)}</div>}
      <div className="tunnel-footer absolute flex items-center justify-between">
        <motion.span style={reduce ? undefined : { opacity: promptOpacity }} className="scroll-hint">{reduce ? "SELECTED WORK / 2026" : "SCROLL TO EXPLORE"}</motion.span>
        <button type="button" onClick={onExplore ?? (() => document.getElementById("graphic-work")?.scrollIntoView({ behavior: reduce ? "instant" : "smooth" }))}>VIEW SELECTED WORK</button>
      </div>
    </div>
  </div>;
}
