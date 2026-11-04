import TiltedGridHero from "@/components/ui/tilted-grid-hero";
const images = [
  { src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=640&q=80", alt: "Lake and mountains" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&q=80", alt: "Mountain peak" },
  { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80", alt: "Forest" },
];
export default function TiltedGridHeroDemo() {
  return <TiltedGridHero images={images} className="h-[560px] w-full bg-background">
    <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
      <h1 className="text-4xl">Every frame,<br />brought into focus.</h1>
      <p>Images curve in from one edge, then fade away round the other.</p>
    </div>
  </TiltedGridHero>;
}
