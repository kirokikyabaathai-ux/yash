/**
 * Accessibility utilities for the Solar CRM application
 */

/**
 * Generate a unique ID for ARIA attributes
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.hasAttribute("disabled")) return false;
  if (element.getAttribute("aria-hidden") === "true") return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return true;
}

/**
 * Trap focus within a container (useful for modals)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Get accessible label for a status
 */
export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    ongoing: "Status: Ongoing",
    interested: "Status: Interested",
    not_interested: "Status: Not Interested",
    closed: "Status: Closed",
    pending: "Status: Pending",
    completed: "Status: Completed",
    upcoming: "Status: Upcoming",
    valid: "Status: Valid",
    corrupted: "Status: Corrupted",
    replaced: "Status: Replaced",
  };

  return statusLabels[status] || `Status: ${status}`;
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get keyboard shortcut description
 */
export function getKeyboardShortcut(key: string, modifiers: string[] = []): string {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierMap: Record<string, string> = {
    ctrl: isMac ? "⌘" : "Ctrl",
    alt: isMac ? "⌥" : "Alt",
    shift: isMac ? "⇧" : "Shift",
  };

  const modifierText = modifiers.map((m) => modifierMap[m] || m).join(" + ");
  return modifierText ? `${modifierText} + ${key}` : key;
}
