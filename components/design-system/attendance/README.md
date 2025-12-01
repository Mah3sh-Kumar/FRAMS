# Attendance Components

Specialized UI components for face recognition attendance workflows in FRAMS.

## Components

### FaceCaptureFrame

An animated frame component for face recognition capture with color-coded border states and real-time feedback messages.

**Features:**
- Animated pulse effect on the border (respects reduced motion)
- Color-coded border states:
  - `recognized` - Green border (success)
  - `unknown` - Red border (error)
  - `lowLight` - Amber border (warning)
  - `idle` - Indigo border (primary)
- Real-time feedback message display
- Accessibility support with live regions
- Design token integration

**Usage:**

```tsx
import { FaceCaptureFrame } from '@/components/design-system/attendance';

function AttendanceScreen() {
  const [state, setState] = useState<FaceCaptureState>('idle');
  const [message, setMessage] = useState('Position your face in the frame');

  return (
    <FaceCaptureFrame 
      state={state} 
      feedbackMessage={message}
    >
      <CameraView />
    </FaceCaptureFrame>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `'recognized' \| 'unknown' \| 'lowLight' \| 'idle'` | Required | Current capture state (determines border color) |
| `feedbackMessage` | `string` | `undefined` | Feedback message to display below the frame |
| `children` | `React.ReactNode` | `undefined` | Frame content (typically camera view) |
| `testID` | `string` | `'face-capture-frame'` | Test identifier |

**Requirements Validated:**
- 7.1: Animated frame around capture zone ✓
- 7.2: Color-coded borders (green, red, amber) ✓
- 7.5: Real-time feedback message display ✓

### AttendanceActionButton

A circular action button for attendance workflows with gradient glow effect and pulse animation.

**Features:**
- Circular 72px button with gradient background
- Animated pulse effect (respects reduced motion)
- Gradient glow effect
- Disabled state support
- Design token integration
- Accessibility support

**Usage:**

```tsx
import { AttendanceActionButton } from '@/components/design-system/attendance';

function AttendanceScreen() {
  const handleCapture = () => {
    // Capture attendance
  };

  return (
    <AttendanceActionButton onPress={handleCapture}>
      <Icon name="camera" size={32} color="white" />
    </AttendanceActionButton>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | Required | Press handler callback |
| `children` | `React.ReactNode` | `undefined` | Button content (typically an icon) |
| `disabled` | `boolean` | `false` | Disabled state |
| `testID` | `string` | `'attendance-action-button'` | Test identifier |

**Requirements Validated:**
- 7.4: Circular 72px button with gradient glow and pulse animation ✓

### StudentProfileCard

A card component for displaying student profile information with avatar, status badge, and attendance statistics micro chart.

**Features:**
- Avatar circle with initials fallback
- Color-coded status badge (present, absent, late, pending)
- Attendance statistics micro chart with percentage
- Responsive to theme mode (light/dark)
- Design token integration
- Comprehensive attendance data display

**Usage:**

```tsx
import { StudentProfileCard } from '@/components/design-system/attendance';

function StudentList() {
  return (
    <StudentProfileCard
      name="John Doe"
      studentId="12345"
      status="present"
      attendanceStats={{
        present: 18,
        absent: 2,
        total: 20
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | Required | Student name |
| `studentId` | `string` | Required | Student ID or roll number |
| `status` | `'present' \| 'absent' \| 'late' \| 'pending'` | Required | Current attendance status |
| `attendanceStats` | `AttendanceStats` | Required | Attendance statistics object |
| `avatar` | `string` | `undefined` | Avatar URL (currently uses initials) |
| `testID` | `string` | `'student-profile-card'` | Test identifier |

**AttendanceStats Interface:**

```typescript
interface AttendanceStats {
  present: number;  // Number of classes attended
  absent: number;   // Number of classes missed
  total: number;    // Total number of classes
}
```

**Status Colors:**
- `present` - Green (success)
- `absent` - Red (error)
- `late` - Amber (warning)
- `pending` - Gray (neutral)

**Requirements Validated:**
- 7.3: Avatar circle, status badge, and attendance stats micro chart ✓

## Design Tokens Used

- **Colors**: `success.main`, `error.main`, `warning.main`, `primary.main`
- **Spacing**: `md` (16px)
- **Borders**: `radius.large` (20px)
- **Motion**: `duration.slow` (350ms)
- **Typography**: `body` scale

## Accessibility

- Feedback messages use `accessibilityLiveRegion="polite"` for screen reader announcements
- Color-coded states are supplemented with text feedback
- Respects system reduced motion preferences
- Proper semantic roles for text elements
