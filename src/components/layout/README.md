# Layout Components

## Sidebar Component

A mobile-optimized sidebar navigation with role-based menu items.

### Features

- **Mobile-Optimized**: Slides in/out on mobile with overlay, always visible on desktop
- **Role-Based Navigation**: Shows only relevant menu items based on user role
- **Active State**: Highlights current route
- **Responsive Icons**: Uses lucide-react icons for visual clarity
- **Hamburger Menu**: Mobile menu button in TopBar for easy access
- **Auto-Close**: Automatically closes on mobile after navigation
- **User Info Display**: Shows user avatar, name, email, and role at bottom of sidebar
- **Loading State**: Shows skeleton loader while session is loading
- **Authentication State**: Only renders when user is authenticated

### Navigation Items by Role

- **Admin**: Dashboard, Leads, Users, Steps, Activity Log
- **Office**: Dashboard, Leads, Reports
- **Agent**: Dashboard, Leads, Performance
- **Installer**: Dashboard
- **Customer**: Dashboard

### Mobile Behavior

- **< 1024px (lg breakpoint)**: Sidebar hidden by default, opens via hamburger menu
- **≥ 1024px**: Sidebar always visible, sticky positioned
- **Overlay**: Dark overlay appears on mobile when sidebar is open
- **Gestures**: Tap overlay or close button to dismiss

### Usage

The Sidebar is automatically included in all protected routes via the `(protected)` layout.

## TopBar Component

A responsive top navigation bar that displays across all protected routes.

### Features

- **Logo**: YAS Naturals branding with logo image
- **User Information**: Displays user name and role/ID (hidden on mobile)
- **Notification Bell**: Real-time notifications with unread count badge
- **Profile Button**: Quick access to user profile page
- **Logout Button**: Sign out functionality
- **Responsive Design**: Adapts to mobile and desktop screens
- **Loading State**: Shows skeleton loader while fetching user data
- **Authentication State**: Shows/hides elements based on session state

### Usage

The TopBar is automatically included in all protected routes via the `(protected)` layout:

```tsx
import { TopBar } from '@/components/layout';

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

### Profile Routes

Each role has a dedicated profile page:

- `/admin/profile` - Admin profile
- `/office/profile` - Office staff profile
- `/agent/profile` - Agent profile
- `/installer/profile` - Installer profile
- `/customer/profile` - Customer profile

### Accessibility

- All buttons have proper `aria-label` and `title` attributes
- Keyboard navigation supported
- Screen reader friendly
- Proper focus states

### Styling

Uses Tailwind CSS with:
- Sticky positioning at top of viewport
- Backdrop blur effect
- Responsive container
- Theme-aware colors (light/dark mode support)
