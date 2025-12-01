# Navigation Components

Navigation components for the FRAMS design system, including tab bars and other navigation elements.

## Components

### TabBar

A bottom navigation tab bar with floating effect and smooth animations.

**Features:**
- 72px height for comfortable touch targets
- Floating effect with shadow elevation
- Active tab highlight pill with smooth animation
- Smooth tab switching (220ms duration)
- Respects reduced motion preferences
- Full accessibility support

**Usage:**

```tsx
import { TabBar } from '@/components/design-system/navigation';

const tabs = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

function MyScreen() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <TabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabPress={setActiveTab}
    />
  );
}
```

**Props:**

- `tabs` (TabItem[]): Array of tab items with id, label, and optional icon
- `activeTab` (string): Currently active tab ID
- `onTabPress` (function): Callback when tab is pressed
- `style` (ViewStyle, optional): Custom style override
- `testID` (string, optional): Test identifier

**Design Tokens Used:**
- Height: 72px (fixed)
- Shadow: `tokens.shadows.md`
- Border radius: `tokens.borders.radius.full` (for indicator pill)
- Spacing: `tokens.spacing.md` (horizontal padding)
- Animation: `tokens.motion.duration.normal` (220ms)
- Colors: Surface, text, and primary colors from theme

**Accessibility:**
- Minimum 48x48px touch targets
- Proper ARIA roles and states
- Screen reader support
- Keyboard navigation support

**Requirements:**
- Validates: Requirements 3.4, 4.3
