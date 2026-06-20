"use client";

import { useState, useEffect, useRef } from "react";

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const slides = [
  {
    id: 1,
    tag: "Spring – Summer 2025",
    heading: ["Flash Sale", "of 70%"],
    sub: "Discover handpicked styles designed for modern living. Limited time offer on premium collections.",
    cta: "Shop Now",
    ctaSecondary: "Explore Collection",
    bg: "from-slate-50 to-stone-100",
    accent: "#1a1a1a",
    badge: "bg-amber-100 text-amber-700",
    image: "👗",
    imageBg: "bg-amber-50",
    dark: false,
  },
  {
    id: 2,
    tag: "New Arrivals 2025",
    heading: ["Elevate Your", "Everyday Style"],
    sub: "Premium accessories curated for those who appreciate the finer details in fashion and lifestyle.",
    cta: "View Collection",
    ctaSecondary: "Trending Now",
    bg: "from-zinc-900 to-slate-800",
    accent: "#ffffff",
    badge: "bg-white/10 text-white",
    image: "⌚",
    imageBg: "bg-white/5",
    dark: true,
  },
  {
    id: 3,
    tag: "Exclusive Members",
    heading: ["Up to 50% Off", "Summer Picks"],
    sub: "Join over 50,000 happy customers enjoying free shipping, easy returns, and exclusive member deals.",
    cta: "Shop the Sale",
    ctaSecondary: "Join for Free",
    bg: "from-rose-50 to-pink-50",
    accent: "#1a1a1a",
    badge: "bg-rose-100 text-rose-600",
    image: "🛍️",
    imageBg: "bg-rose-100",
    dark: false,
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((index + slides.length) % slides.length);
      setAnimating(false);
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go(current + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
      <div
        className={`bg-linear-to-br ${slide.bg} w-full transition-all`}
        style={{ minHeight: "520px", opacity: animating ? 0 : 1, transition: "opacity 0.35s ease" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center" style={{ minHeight: "520px" }}>
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 py-16">

            {/* Text */}
            <div className="flex-1 max-w-lg">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${slide.badge} mb-5`}>
                {slide.tag}
              </span>
              <h1 style={{ color: slide.accent }}
                className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-5">
                {slide.heading[0]}<br />
                <span style={{ color: slide.dark ? "#a1a1aa" : "#6b7280" }}>{slide.heading[1]}</span>
              </h1>
              <p style={{ color: slide.dark ? "#a1a1aa" : "#6b7280" }}
                className="text-base leading-relaxed mb-8 max-w-sm">
                {slide.sub}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-7 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: slide.dark ? "#fff" : "#111", color: slide.dark ? "#111" : "#fff" }}>
                  {slide.cta}
                </button>
                <button
                  className="px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 border"
                  style={{
                    borderColor: slide.dark ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                    color: slide.dark ? "#fff" : "#374151",
                    background: slide.dark ? "rgba(255,255,255,0.05)" : "transparent",
                  }}>
                  {slide.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="shrink-0">
              <div
                className={`${slide.imageBg} rounded-3xl flex items-center justify-center`}
                style={{
                  width: "280px", height: "320px", fontSize: "140px",
                  boxShadow: slide.dark ? "0 32px 64px rgba(0,0,0,0.4)" : "0 32px 64px rgba(0,0,0,0.10)",
                }}>
                {slide.image}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 text-gray-700 z-10">
        <ChevronLeft />
      </button>
      <button onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 text-gray-700 z-10">
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? "28px" : "8px",
              height: "8px",
              background: i === current
                ? (slide.dark ? "#fff" : "#111")
                : (slide.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"),
            }} />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-6 right-6 z-10">
        <span className="text-xs font-bold"
          style={{ color: slide.dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }}>
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}