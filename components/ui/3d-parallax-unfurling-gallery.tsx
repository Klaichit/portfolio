"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export interface UnfurlingImage { src: string; alt: string }

/** Unfurling four-column gallery, linked to the page's native scroll. */
export default function UnfurlingGalleryFooter({ images }: { images: UnfurlingImage[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 25, mass: 0.5 });
  const width = useTransform(progress, [0, 0.4], ["92%", "100%"]);
  const radius = useTransform(progress, [0, 0.4], [40, 0]);
  const rotateY = useTransform(progress, [0.1, 1], [-45, -8]);
  const rotateX = useTransform(progress, [0.1, 1], [25, 4]);
  const rotateZ = useTransform(progress, [0.1, 1], [15, 2]);
  const z = useTransform(progress, [0.1, 1], [-700, 0]);
  const y1 = useTransform(progress, [0, 1], ["0%", "-35%"]);
  const y2 = useTransform(progress, [0, 1], ["-35%", "5%"]);
  const y3 = useTransform(progress, [0, 1], ["5%", "-30%"]);
  const y4 = useTransform(progress, [0, 1], ["-30%", "10%"]);
  const columns = useMemo(() => Array.from({ length: 4 }, (_, col) => {
    const items = images.filter((_, i) => i % 4 === col);
    return [...items, ...items];
  }), [images]);
  return <section ref={containerRef} className={`unfurl-footer ${reduce ? "unfurl-reduced" : ""}`} aria-labelledby="unfurl-title">
    <div className="unfurl-sticky">
      <motion.div className="unfurl-banner" style={{ width: reduce ? "100%" : width, borderRadius: reduce ? 0 : radius }}>
        <div className="unfurl-camera" aria-hidden="true">
          <motion.div className="unfurl-matrix" style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, rotateZ: reduce ? -6 : rotateZ, z: reduce ? 0 : z, transformStyle: "preserve-3d" }}>
            {columns.map((items, col) => <motion.div key={col} className="unfurl-column" style={{ y: reduce ? "-15%" : [y1, y2, y3, y4][col] }}>
              {items.map((img, i) => <div className="unfurl-image" key={`${img.src}-${i}`}><img src={img.src} alt="" loading="lazy" decoding="async" /></div>)}
            </motion.div>)}
          </motion.div>
        </div>
        <div className="unfurl-shade" />
        <div className="unfurl-content">
          <div className="unfurl-top"><p>CONTACT KLAICHIT</p><p>BASED IN BANGKOK, THAILAND</p></div>
          <div className="unfurl-contact"><h2 id="unfurl-title">GET IN<br /><em>TOUCH.</em></h2><div className="unfurl-contact-links"><a href="mailto:dkayfx.studio@gmail.com">dkayfx.studio@gmail.com</a><a href="tel:+66945579251">094-557-9251</a></div></div>
          <p className="unfurl-bottom">For work enquiries or a conversation about a project, email me.</p>
        </div>
      </motion.div>
    </div>
  </section>;
}
