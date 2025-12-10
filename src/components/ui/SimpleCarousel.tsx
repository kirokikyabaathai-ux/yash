'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  id: number;
  src: string;
  href: string;
}

interface SimpleCarouselProps {
  slides: Slide[];
  autoplay?: boolean;
  delay?: number;
  className?: string;
}

export function SimpleCarousel({ 
  slides, 
  autoplay = true, 
  delay = 4,
  className = '' 
}: SimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  useEffect(() => {
    if (autoplay && slides.length > 1) {
      autoplayRef.current = setInterval(goToNext, delay * 1000);
      return () => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
      };
    }
  }, [autoplay, delay, goToNext, slides.length]);

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const resumeAutoplay = () => {
    if (autoplay && slides.length > 1) {
      autoplayRef.current = setInterval(goToNext, delay * 1000);
    }
  };

  return (
    <div 
      className={`relative w-full max-w-md mx-auto ${className}`}
      onMouseEnter={stopAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
        <Image
          src={slides[currentIndex].src}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 640px) 100vw, 448px"
          priority={currentIndex === 0}
        />
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </Button>
        </>
      )}
    </div>
  );
}
