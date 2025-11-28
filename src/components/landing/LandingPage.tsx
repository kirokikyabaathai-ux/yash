'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThreeDImageCarousel } from '@/components/ui/ThreeDImageCarousel';
import { SimpleCarousel } from '@/components/ui/SimpleCarousel';
import { AuthModal } from '@/components/auth/AuthModal';

const carouselSlides = [
  { id: 1, src: '/carousel (1).jpeg', href: '#' },
  { id: 2, src: '/carousel (2).jpeg', href: '#' },
  { id: 3, src: '/carousel (3).jpeg', href: '#' },
  { id: 4, src: '/carousel (4).jpeg', href: '#' },
];

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/yas_logo.jpeg" alt="YAS Natural" width={50} height={50} className="rounded-full object-cover sm:w-[60px] sm:h-[60px]" />
            <div>
              <div className="font-bold text-sm sm:text-base md:text-lg text-foreground">YAS Natural Production &</div>
              <div className="font-bold text-sm sm:text-base md:text-lg text-foreground">Management Services Pvt. Ltd.</div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            <Button variant="outline" onClick={() => openAuthModal('login')} className="flex-1 sm:flex-none text-sm sm:text-base">
              Login
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none text-sm sm:text-base"
              onClick={() => openAuthModal('signup')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile: Simple single-image carousel */}
          <div className="block md:hidden">
            <SimpleCarousel 
              slides={carouselSlides}
              autoplay={true}
              delay={4}
            />
          </div>
          {/* Desktop: 3D carousel */}
          <div className="hidden md:block">
            <ThreeDImageCarousel 
              slides={carouselSlides}
              itemCount={3}
              autoplay={true}
              delay={4}
              pauseOnHover={true}
              className="mx-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-black">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Go Solar?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">Apply now for PM Surya Ghar Yojana and start saving</p>
          <Button 
            size="lg" 
            className="bg-background text-foreground hover:bg-background/90 font-semibold text-sm sm:text-base px-8 shadow-lg"
            onClick={() => openAuthModal('signup')}
          >
            Apply Now
          </Button>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="py-8 sm:py-10 md:py-12 bg-muted/50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">Trusted Partners</h2>
            <div className="relative w-full max-w-md mx-auto overflow-hidden shadow-lg rounded-2xl">
              <Image 
                src="/brands.png" 
                alt="Our Trusted Partners" 
                width={663}
                height={973}
                className="object-contain w-full h-auto rounded-2xl"
                sizes="(max-width: 768px) 90vw, 448px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg">Contact Us</h4>
              <p className="text-xs sm:text-sm mb-2 opacity-90">📍 Location: MIG-09, Housing Board Colony, Near Raigarh Stadium, Chakradhar Nagar, Raigarh (C.G.) 496001</p>
              <p className="text-xs sm:text-sm mb-2 opacity-90">📞 Phone: +91 9827982630, 9893588109</p>
              <p className="text-xs sm:text-sm mb-2 opacity-90">📧 Email: yasnatural99@gmail.com</p>
              <p className="text-xs sm:text-sm mb-4 opacity-90">🌐 Website: www.yasnatural.com</p>
            </div>
            <div>
              <h4 className="font-bold mb-2 sm:mb-3 text-base sm:text-lg">Company Details</h4>
              <p className="text-xs sm:text-sm mb-2 opacity-90">C.I.N.: U78300CT2025PTC018584</p>
              <p className="text-xs sm:text-sm opacity-90">GSTIN: 22AACCY0651Q1Z4</p>
            </div>
          </div>
          <div className="border-t border-border mt-4 sm:mt-6 pt-4 sm:pt-6 text-center text-xs sm:text-sm">
           
            <p className="mt-2 opacity-90">Copyright © 2025 yasnatural | YAS NATURAL PRODUCTION & MANAGMENT SERVICES PVT. LTD</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
