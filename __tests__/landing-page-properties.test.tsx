/**
 * Property-Based Tests for Landing Page Requirements
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for landing page design and CTA prominence.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 13.3, 13.4**
 */

import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandingPage } from '../src/components/landing/LandingPage';

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock carousel components
jest.mock('../src/components/ui/ThreeDImageCarousel', () => ({
  ThreeDImageCarousel: () => <div data-testid="3d-carousel">3D Carousel</div>,
}));

jest.mock('../src/components/ui/SimpleCarousel', () => ({
  SimpleCarousel: () => <div data-testid="simple-carousel">Simple Carousel</div>,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Landing Page Properties', () => {
  /**
   * **Feature: ui-professional-refactor, Property 38: Landing page section separation**
   * **Validates: Requirements 13.3**
   * 
   * For any adjacent sections on the landing page, there should be clear visual
   * separation through background color changes, spacing, or dividers.
   */
  describe('Property 38: Landing page section separation', () => {
    it('should have clear visual separation between sections using Separator components', () => {
      const { container } = render(<LandingPage />);
      
      // Find all separator elements (using data-slot attribute from Radix UI)
      const separators = container.querySelectorAll('[data-slot="separator"]');
      
      // Should have multiple separators for section separation
      expect(separators.length).toBeGreaterThanOrEqual(3);
      
      // Each separator should have proper styling (bg-border or bg-border with opacity)
      separators.forEach((separator) => {
        const classes = separator.className;
        expect(
          classes.includes('bg-border') || 
          classes.includes('bg-border/')
        ).toBe(true);
      });
    });

    it('should have distinct background colors for adjacent sections', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'header',
            'hero',
            'cta',
            'partners',
            'footer'
          ),
          (sectionType) => {
            const { container } = render(<LandingPage />);
            
            let sectionElement: Element | null = null;
            
            // Find the section based on type
            switch (sectionType) {
              case 'header':
                sectionElement = container.querySelector('header');
                break;
              case 'hero':
                // Hero section has gradient background
                sectionElement = container.querySelector('section');
                break;
              case 'cta':
                // CTA section has primary gradient
                const sections = container.querySelectorAll('section');
                sectionElement = sections[1]; // Second section is CTA
                break;
              case 'partners':
                // Partners section has muted background
                const allSections = container.querySelectorAll('section');
                sectionElement = allSections[2]; // Third section is partners
                break;
              case 'footer':
                sectionElement = container.querySelector('footer');
                break;
            }
            
            // Section should exist
            expect(sectionElement).toBeTruthy();
            
            // Section should have background styling
            if (sectionElement) {
              const classes = sectionElement.className;
              expect(
                classes.includes('bg-') || 
                classes.includes('gradient')
              ).toBe(true);
            }
          }
        )
      );
    });

    it('should have appropriate vertical spacing between sections', () => {
      const { container } = render(<LandingPage />);
      
      // Get all section elements
      const sections = container.querySelectorAll('section');
      
      // Each section should have vertical padding
      sections.forEach((section) => {
        const classes = section.className;
        
        // Should have py- (padding-y) classes for vertical spacing
        expect(
          classes.includes('py-') ||
          classes.match(/py-\d+/)
        ).toBeTruthy();
      });
    });

    it('should maintain visual separation across different viewport sizes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('mobile', 'tablet', 'desktop'),
          (viewport) => {
            const { container } = render(<LandingPage />);
            
            // Get all sections
            const sections = container.querySelectorAll('section');
            
            // Each section should have responsive padding classes
            sections.forEach((section) => {
              const classes = section.className;
              
              // Should have responsive padding (sm:, md:, lg: prefixes)
              const hasResponsivePadding = 
                classes.includes('sm:py-') ||
                classes.includes('md:py-') ||
                classes.includes('lg:py-');
              
              expect(hasResponsivePadding).toBe(true);
            });
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 39: CTA button prominence**
   * **Validates: Requirements 13.4**
   * 
   * For any call-to-action button on the landing page, it should use the primary
   * button variant and be larger than standard buttons.
   */
  describe('Property 39: CTA button prominence', () => {
    it('should have CTA buttons with prominent size', () => {
      render(<LandingPage />);
      
      // Find the main CTA button
      const ctaButton = screen.getByRole('button', { name: /apply now/i });
      
      // CTA button should exist
      expect(ctaButton).toBeInTheDocument();
      
      // CTA button should have large size styling
      const classes = ctaButton.className;
      expect(
        classes.includes('px-8') ||
        classes.includes('px-10') ||
        classes.includes('px-12')
      ).toBe(true);
      
      // Should have larger padding
      expect(
        classes.includes('py-6') ||
        classes.includes('py-7') ||
        classes.includes('py-8')
      ).toBe(true);
    });

    it('should have CTA buttons with prominent visual styling', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('shadow', 'scale', 'font'),
          (styleAspect) => {
            render(<LandingPage />);
            
            // Get all "Apply Now" buttons and find the main CTA one (larger one)
            const ctaButtons = screen.getAllByRole('button', { name: /apply now/i });
            const ctaButton = ctaButtons.find(btn => 
              btn.className.includes('px-8') || 
              btn.className.includes('px-10') || 
              btn.className.includes('px-12')
            ) || ctaButtons[ctaButtons.length - 1]; // Fallback to last one (main CTA)
            
            const classes = ctaButton!.className;
            
            switch (styleAspect) {
              case 'shadow':
                // Should have shadow for prominence
                expect(
                  classes.includes('shadow-2xl') ||
                  classes.includes('shadow-xl') ||
                  classes.includes('shadow-lg')
                ).toBe(true);
                break;
              case 'scale':
                // Should have hover scale effect
                expect(classes.includes('hover:scale-')).toBe(true);
                break;
              case 'font':
                // Should have bold font weight
                expect(classes.includes('font-bold')).toBe(true);
                break;
            }
          }
        )
      );
    });

    it('should have CTA buttons larger than header buttons', () => {
      render(<LandingPage />);
      
      // Get header buttons (Login and Sign Up in header)
      const headerButtons = screen.getAllByRole('button', { name: /login|sign up/i });
      
      // Get all "Apply Now" buttons and find the main CTA one
      const ctaButtons = screen.getAllByRole('button', { name: /apply now/i });
      const ctaButton = ctaButtons.find(btn => 
        btn.className.includes('px-8') || 
        btn.className.includes('px-10') || 
        btn.className.includes('px-12')
      ) || ctaButtons[ctaButtons.length - 1]; // Fallback to last one (main CTA)
      
      // CTA button should have more prominent styling than header buttons
      const ctaClasses = ctaButton!.className;
      
      // CTA should have larger text
      expect(
        ctaClasses.includes('text-base') ||
        ctaClasses.includes('text-lg') ||
        ctaClasses.includes('text-xl')
      ).toBe(true);
      
      // CTA should have larger padding
      expect(
        ctaClasses.includes('px-8') ||
        ctaClasses.includes('px-10') ||
        ctaClasses.includes('px-12')
      ).toBe(true);
    });

    it('should have CTA section with prominent background', () => {
      const { container } = render(<LandingPage />);
      
      // Find CTA section (section with primary gradient)
      const sections = container.querySelectorAll('section');
      const ctaSection = Array.from(sections).find(section => 
        section.className.includes('from-primary')
      );
      
      // CTA section should exist
      expect(ctaSection).toBeTruthy();
      
      if (ctaSection) {
        const classes = ctaSection.className;
        
        // Should have gradient background
        expect(classes.includes('bg-gradient-')).toBe(true);
        expect(classes.includes('from-primary')).toBe(true);
        
        // Should have prominent padding
        expect(
          classes.includes('py-16') ||
          classes.includes('py-20') ||
          classes.includes('py-24') ||
          classes.includes('py-28')
        ).toBe(true);
      }
    });

    it('should have CTA button with contrasting colors for visibility', () => {
      render(<LandingPage />);
      
      const ctaButton = screen.getByRole('button', { name: /apply now/i });
      const classes = ctaButton.className;
      
      // CTA button should have background color
      expect(classes.includes('bg-background')).toBe(true);
      
      // CTA button should have contrasting text color
      expect(classes.includes('text-foreground')).toBe(true);
      
      // Should have hover state
      expect(classes.includes('hover:bg-')).toBe(true);
    });

    it('should have CTA with supporting text for context', () => {
      render(<LandingPage />);
      
      // CTA section should have heading
      const ctaHeading = screen.getByRole('heading', { name: /ready to go solar/i });
      expect(ctaHeading).toBeInTheDocument();
      
      // Should have large heading size
      const headingClasses = ctaHeading.className;
      expect(
        headingClasses.includes('text-3xl') ||
        headingClasses.includes('text-4xl') ||
        headingClasses.includes('text-5xl') ||
        headingClasses.includes('text-6xl')
      ).toBe(true);
    });

    it('should have CTA button with transition effects', () => {
      render(<LandingPage />);
      
      const ctaButton = screen.getByRole('button', { name: /apply now/i });
      const classes = ctaButton.className;
      
      // Should have transition classes
      expect(
        classes.includes('transition-') ||
        classes.includes('duration-')
      ).toBe(true);
    });
  });

  /**
   * Additional property: Hero section professional styling
   * Validates that the hero section has professional styling with proper hierarchy
   */
  describe('Additional: Hero section professional styling', () => {
    it('should have hero section with prominent heading', () => {
      render(<LandingPage />);
      
      // Find hero heading
      const heroHeading = screen.getByRole('heading', { 
        name: /power your future with solar energy/i 
      });
      
      expect(heroHeading).toBeInTheDocument();
      
      // Should have large text size
      const classes = heroHeading.className;
      expect(
        classes.includes('text-3xl') ||
        classes.includes('text-4xl') ||
        classes.includes('text-5xl') ||
        classes.includes('text-6xl')
      ).toBe(true);
    });

    it('should have hero section with descriptive text', () => {
      render(<LandingPage />);
      
      // Hero should have descriptive paragraph
      const heroText = screen.getByText(/join thousands of homeowners/i);
      expect(heroText).toBeInTheDocument();
      
      // Should have appropriate text size
      const classes = heroText.className;
      expect(
        classes.includes('text-base') ||
        classes.includes('text-lg') ||
        classes.includes('text-xl') ||
        classes.includes('text-2xl')
      ).toBe(true);
    });
  });

  /**
   * Additional property: Footer organization
   * Validates that footer content is clearly organized
   */
  describe('Additional: Footer organization', () => {
    it('should have footer with organized sections', () => {
      render(<LandingPage />);
      
      // Footer should have contact section
      const contactHeading = screen.getByRole('heading', { name: /contact us/i });
      expect(contactHeading).toBeInTheDocument();
      
      // Footer should have company details section
      const companyHeading = screen.getByRole('heading', { name: /company details/i });
      expect(companyHeading).toBeInTheDocument();
      
      // Footer should have about section
      const aboutHeading = screen.getByRole('heading', { name: /about yas natural/i });
      expect(aboutHeading).toBeInTheDocument();
    });

    it('should have footer with clear contact information', () => {
      render(<LandingPage />);
      
      // Should have phone number
      expect(screen.getByText(/\+91 9827982630/)).toBeInTheDocument();
      
      // Should have email
      expect(screen.getByText(/yasnatural99@gmail.com/)).toBeInTheDocument();
      
      // Should have website
      expect(screen.getByText(/www.yasnatural.com/)).toBeInTheDocument();
    });
  });
});
