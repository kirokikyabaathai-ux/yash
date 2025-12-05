'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThreeDImageCarousel } from '@/components/ui/ThreeDImageCarousel';
import { SimpleCarousel } from '@/components/ui/SimpleCarousel';
import { AuthModal } from '@/components/auth/AuthModal';
import { getDashboardPath } from '@/lib/utils/navigation';

const carouselSlides = [
  { id: 1, src: '/carousel (1).jpeg', href: '#' },
  { id: 2, src: '/carousel (2).jpeg', href: '#' },
  { id: 3, src: '/carousel (3).jpeg', href: '#' },
  { id: 4, src: '/carousel (4).jpeg', href: '#' },
];

export function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const goToDashboard = () => {
    if (session?.user) {
      const dashboardPath = getDashboardPath(session.user.role as any);
      router.push(dashboardPath);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header with elevated styling */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <Image 
                src="/yas_logo.jpeg" 
                alt="YAS Natural Logo" 
                width={60} 
                height={60} 
                className="rounded-full object-cover shadow-md" 
                priority
              />
              <div>
                <h1 className="font-bold text-base sm:text-lg md:text-xl text-foreground leading-tight">
                  YAS Natural Production &
                </h1>
                <h1 className="font-bold text-base sm:text-lg md:text-xl text-foreground leading-tight">
                  Management Services Pvt. Ltd.
                </h1>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              {session?.user ? (
                <Button 
                  size="lg"
                  className="flex-1 sm:flex-none text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                  onClick={goToDashboard}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => openAuthModal('login')} 
                    className="flex-1 sm:flex-none text-sm sm:text-base font-medium"
                  >
                    Login
                  </Button>
                  <Button 
                    size="lg"
                    className="flex-1 sm:flex-none text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => openAuthModal('signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with professional styling and high-quality imagery */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Power Your Future with Solar Energy
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of homeowners benefiting from PM Surya Ghar Yojana. 
              Professional installation, quality equipment, and exceptional service.
            </p>
          </div>
          
          {/* High-quality imagery with appropriate spacing */}
          <div className="max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* Clear visual separation with Separator */}
      <Separator className="my-0" />

      {/* Prominent CTA Section with enhanced visual prominence */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-primary/95 via-primary to-primary/90 text-primary-foreground overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Ready to Go Solar?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Apply now for PM Surya Ghar Yojana and start saving on your energy bills today
          </p>
          
          {/* Visually prominent CTA button */}
          <Button 
            size="lg" 
            className="bg-background text-foreground hover:bg-background/95 font-bold text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-6 sm:py-7 md:py-8 h-auto shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 rounded-lg"
            onClick={() => openAuthModal('signup')}
          >
            Apply Now - Get Started
          </Button>
          
          <p className="mt-6 sm:mt-8 text-sm sm:text-base opacity-90">
            ✓ Free consultation  ✓ Government subsidies  ✓ Professional installation
          </p>
        </div>
      </section>

      {/* Clear visual separation */}
      <Separator className="my-0" />

      {/* Trusted Partners Section with clear separation */}
      <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Trusted Partners
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                We work with industry-leading brands to deliver quality solar solutions
              </p>
            </div>
            
            <Card className="overflow-hidden shadow-xl border-2">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="relative w-full max-w-lg mx-auto">
                  <Image 
                    src="/brands.png" 
                    alt="Our Trusted Partners - Leading Solar Equipment Manufacturers" 
                    width={663}
                    height={973}
                    className="object-contain w-full h-auto rounded-lg"
                    sizes="(max-width: 768px) 90vw, 512px"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Clear visual separation */}
      <Separator className="my-0" />

      {/* Organized Footer with clear structure */}
      <footer className="bg-secondary text-secondary-foreground py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            {/* Contact Information - clearly organized */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 text-secondary-foreground">
                Contact Us
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">📍</span>
                  <p className="text-sm sm:text-base leading-relaxed">
                    MIG-09, Housing Board Colony, Near Raigarh Stadium, 
                    Chakradhar Nagar, Raigarh (C.G.) 496001
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">📞</span>
                  <p className="text-sm sm:text-base">
                    +91 9827982630, 9893588109
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">📧</span>
                  <p className="text-sm sm:text-base">
                    yasnatural99@gmail.com
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">🌐</span>
                  <p className="text-sm sm:text-base">
                    www.yasnatural.com
                  </p>
                </div>
              </div>
            </div>

            {/* Company Details - clearly organized */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 text-secondary-foreground">
                Company Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Corporate Identification Number
                  </p>
                  <p className="text-sm sm:text-base font-medium">
                    U78300CT2025PTC018584
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    GST Identification Number
                  </p>
                  <p className="text-sm sm:text-base font-medium">
                    22AACCY0651Q1Z4
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 text-secondary-foreground">
                About YAS Natural
              </h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Leading provider of solar energy solutions in Chhattisgarh. 
                We specialize in residential and commercial solar installations 
                under the PM Surya Ghar Yojana scheme.
              </p>
            </div>
          </div>

          {/* Footer bottom with clear separation */}
          <Separator className="my-8 sm:my-10 bg-border/50" />
          
          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Copyright © 2025 YAS Natural | YAS NATURAL PRODUCTION & MANAGEMENT SERVICES PVT. LTD
            </p>
            <p className="text-xs text-muted-foreground/80">
              All rights reserved
            </p>
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
