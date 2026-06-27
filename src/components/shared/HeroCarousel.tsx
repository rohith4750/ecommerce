"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Premium Designer Wear",
    subtitle: "Handcrafted elegance featuring high-grade silhouettes.",
    bg: "bg-gradient-to-r from-[#310A42] to-[#5E0D82]",
    textColor: "text-white",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
    link: "/products",
  },
  {
    title: "Contemporary Couture",
    subtitle: "Timeless patterns designed for modern luxury.",
    bg: "bg-gradient-to-r from-[#4A0E17] to-[#801322]",
    textColor: "text-white",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80",
    link: "/products",
  },
  {
    title: "Sophisticated Loungewear",
    subtitle: "Refined prints and casual comforts for your everyday needs.",
    bg: "bg-gradient-to-r from-[#202938] to-[#1A1A2E]",
    textColor: "text-white",
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&auto=format&fit=crop&q=80",
    link: "/products",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[320px] md:h-[450px] overflow-hidden rounded-2xl shadow-lg">
      {/* Slides mapping */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between p-8 md:p-16 transition-all duration-700 ease-in-out ${
            slide.bg
          } ${idx === current ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-12 z-0"}`}
        >
          {/* Details Overlay */}
          <div className="flex-1 max-w-lg flex flex-col justify-center text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-2 animate-pulse">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wide text-white leading-tight">
              {slide.title}
            </h2>
            <p className="mt-3 text-xs md:text-sm text-gray-300 font-sans leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="mt-6 md:mt-8">
              <Link
                href={slide.link}
                className="inline-flex items-center gap-2 rounded-full bg-brand-secondary hover:bg-brand-secondary/95 px-6 py-3 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner Image */}
          <div className="hidden md:block w-72 h-80 rounded-lg overflow-hidden border-2 border-brand-secondary shadow-lg">
            <img src={slide.image} alt="" className="h-full w-full object-cover object-center" />
          </div>
        </div>
      ))}

      {/* Control Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              idx === current ? "bg-brand-secondary scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
