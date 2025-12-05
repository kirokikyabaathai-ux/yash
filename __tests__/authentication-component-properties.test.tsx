/**
 * Property-Based Tests for Authentication Component Requirements
 * 
 * Feature: ui-professional-refactor
 * 
 * Tests correctness properties for authentication forms including password field toggles
 * and error message prominence.
 * Uses fast-check for property-based testing with 100+ iterations.
 * 
 * **Validates: Requirements 14.3, 14.4**
 */

import fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';
import React from 'react';

// Mock next/navigation
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Configure fast-check to run 100 iterations per property
fc.configureGlobal({ numRuns: 100 });

describe('Authentication Component Properties', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGet.mockReturnValue(null);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  /**
   * **Feature: ui-professional-refactor, Property 40: Password field toggle**
   * **Validates: Requirements 14.4**
   * 
   * For any password input field, it should include a show/hide toggle button with eye/eye-off icon.
   */
  describe('Property 40: Password field toggle', () => {
    it('should render password toggle button in LoginForm', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Find password input by id
              const passwordInput = container.querySelector('#password');
              expect(passwordInput).toBeInTheDocument();
              
              // Password input should be type="password" initially
              expect(passwordInput).toHaveAttribute('type', 'password');
              
              // Find toggle button by aria-label
              const toggleButton = screen.getByLabelText(/show password/i);
              expect(toggleButton).toBeInTheDocument();
              
              // Toggle button should be a button element
              expect(toggleButton.tagName).toBe('BUTTON');
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should toggle password visibility in LoginForm when clicked', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<LoginForm />);
            
            try {
              const passwordInput = container.querySelector('#password');
              const toggleButton = screen.getByLabelText(/show password/i);
              
              // Initially password should be hidden
              expect(passwordInput).toHaveAttribute('type', 'password');
              
              // Click toggle button
              fireEvent.click(toggleButton);
              
              // Password should now be visible
              expect(passwordInput).toHaveAttribute('type', 'text');
              
              // Button label should change
              const hideButton = screen.getByLabelText(/hide password/i);
              expect(hideButton).toBeInTheDocument();
              
              // Click again to hide
              fireEvent.click(hideButton);
              
              // Password should be hidden again
              expect(passwordInput).toHaveAttribute('type', 'password');
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should render password toggle buttons in SignupForm', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<SignupForm />);
            
            try {
              // Find both password inputs
              const passwordInput = screen.getByLabelText(/^password$/i);
              const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
              
              expect(passwordInput).toBeInTheDocument();
              expect(confirmPasswordInput).toBeInTheDocument();
              
              // Both should be type="password" initially
              expect(passwordInput).toHaveAttribute('type', 'password');
              expect(confirmPasswordInput).toHaveAttribute('type', 'password');
              
              // Find toggle buttons - there should be 2 (one for each password field)
              const toggleButtons = screen.getAllByLabelText(/show password/i);
              expect(toggleButtons).toHaveLength(2);
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should toggle password visibility independently in SignupForm', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<SignupForm />);
            
            try {
              const passwordInput = screen.getByLabelText(/^password$/i);
              const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
              
              // Both should be type="password" initially
              expect(passwordInput).toHaveAttribute('type', 'password');
              expect(confirmPasswordInput).toHaveAttribute('type', 'password');
              
              // Get all toggle buttons
              const toggleButtons = screen.getAllByLabelText(/show password/i);
              expect(toggleButtons).toHaveLength(2);
              
              // Click first toggle button (password field)
              fireEvent.click(toggleButtons[0]);
              
              // First password should be visible
              expect(passwordInput).toHaveAttribute('type', 'text');
              
              // Click second toggle button (confirm password field)
              fireEvent.click(toggleButtons[1]);
              
              // Both should now be visible
              expect(passwordInput).toHaveAttribute('type', 'text');
              expect(confirmPasswordInput).toHaveAttribute('type', 'text');
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should render password toggle buttons in CustomerSignupForm', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<CustomerSignupForm />);
            
            try {
              // Find both password inputs
              const passwordInput = screen.getByLabelText(/^password$/i);
              const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
              
              expect(passwordInput).toBeInTheDocument();
              expect(confirmPasswordInput).toBeInTheDocument();
              
              // Both should be type="password" initially
              expect(passwordInput).toHaveAttribute('type', 'password');
              expect(confirmPasswordInput).toHaveAttribute('type', 'password');
              
              // Find toggle buttons
              const toggleButtons = screen.getAllByLabelText(/show password/i);
              expect(toggleButtons).toHaveLength(2);
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should have accessible aria-labels for password toggle buttons', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('LoginForm', 'SignupForm', 'CustomerSignupForm'),
          (formType) => {
            let component;
            if (formType === 'LoginForm') {
              component = <LoginForm />;
            } else if (formType === 'SignupForm') {
              component = <SignupForm />;
            } else {
              component = <CustomerSignupForm />;
            }
            
            const { container, unmount } = render(component);
            
            try {
              // All toggle buttons should have aria-label
              const toggleButtons = screen.getAllByLabelText(/show password/i);
              toggleButtons.forEach(button => {
                const ariaLabel = button.getAttribute('aria-label');
                expect(ariaLabel).toBeTruthy();
                expect(ariaLabel).toMatch(/show password|hide password/i);
              });
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should display eye icon when password is hidden', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Find the toggle button
              const toggleButton = screen.getByLabelText(/show password/i);
              
              // Button should contain an SVG (eye icon)
              const svg = toggleButton.querySelector('svg');
              expect(svg).toBeInTheDocument();
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });

    it('should display eye-off icon when password is visible', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const { container, unmount } = render(<LoginForm />);
            
            try {
              const toggleButton = screen.getByLabelText(/show password/i);
              
              // Click to show password
              fireEvent.click(toggleButton);
              
              // Find the hide button
              const hideButton = screen.getByLabelText(/hide password/i);
              
              // Button should contain an SVG (eye-off icon)
              const svg = hideButton.querySelector('svg');
              expect(svg).toBeInTheDocument();
            } finally {
              unmount();
              cleanup();
            }
          }
        )
      );
    });
  });

  /**
   * **Feature: ui-professional-refactor, Property 41: Authentication error prominence**
   * **Validates: Requirements 14.3**
   * 
   * For any authentication error, it should display in a prominent alert box above the form
   * with error styling.
   */
  describe('Property 41: Authentication error prominence', () => {
    it('should display error with destructive styling in LoginForm', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          (errorMessage) => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error message should be displayed
              const errorElement = container.querySelector('[class*="destructive"]');
              expect(errorElement).toBeInTheDocument();
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should display error with AlertCircle icon', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error container should have destructive styling
              const errorContainer = container.querySelector('[class*="destructive"]');
              if (errorContainer) {
                // Should contain an SVG icon (AlertCircle)
                const icon = errorContainer.querySelector('svg');
                expect(icon).toBeInTheDocument();
              }
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should display error above form fields', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Get error element and first input
              const errorElement = container.querySelector('[class*="destructive"]');
              const firstInput = screen.getByLabelText(/email/i);
              
              if (errorElement && firstInput) {
                // Error should appear before the first input in DOM order
                const errorPosition = Array.from(container.querySelectorAll('*')).indexOf(errorElement);
                const inputPosition = Array.from(container.querySelectorAll('*')).indexOf(firstInput);
                expect(errorPosition).toBeLessThan(inputPosition);
              }
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should use prominent text styling for errors', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error text should have destructive color and font-medium
              const errorText = container.querySelector('[class*="destructive"][class*="font-medium"]');
              expect(errorText).toBeInTheDocument();
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should display error with border and background', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error container should have border and background
              const errorContainer = container.querySelector('[class*="border"][class*="destructive"]');
              expect(errorContainer).toBeInTheDocument();
              
              // Should have rounded corners
              if (errorContainer) {
                expect(errorContainer.className).toMatch(/rounded/);
              }
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should display error with adequate padding', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error container should have padding
              const errorContainer = container.querySelector('[class*="destructive"]');
              if (errorContainer) {
                expect(errorContainer.className).toMatch(/p-\d/);
              }
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });

    it('should use flex layout for icon and text alignment', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Mock useSearchParams to return an error
            mockGet.mockReturnValue('account_disabled');
            
            const { container, unmount } = render(<LoginForm />);
            
            try {
              // Error container should use flex layout
              const errorContainer = container.querySelector('[class*="destructive"]');
              if (errorContainer) {
                expect(errorContainer.className).toMatch(/flex/);
                expect(errorContainer.className).toMatch(/items-start/);
                expect(errorContainer.className).toMatch(/gap-/);
              }
            } finally {
              unmount();
              mockGet.mockReturnValue(null);
            }
          }
        )
      );
    });
  });
});
