# Layout Components

Layout components for the FRAMS design system that provide consistent spacing and structure.

## Components

### Container

A layout component that provides consistent max width and padding for content areas.

**Props:**
- `children`: React.ReactNode - Container content
- `maxWidth`: number (default: 1200) - Maximum width for the container
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md') - Padding size using spacing tokens
- `style`: ViewStyle - Optional custom style
- `testID`: string - Optional test ID

**Example:**
```tsx
import { Container } from '@/components/design-system/layout';

<Container padding="lg" maxWidth={800}>
  <Text>Content goes here</Text>
</Container>
```

### Stack

A layout component that arranges children vertically with consistent spacing.

**Props:**
- `children`: React.ReactNode - Stack content
- `spacing`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md') - Spacing between children
- `style`: ViewStyle - Optional custom style
- `testID`: string - Optional test ID

**Example:**
```tsx
import { Stack } from '@/components/design-system/layout';

<Stack spacing="lg">
  <Text>First item</Text>
  <Text>Second item</Text>
  <Text>Third item</Text>
</Stack>
```

### Row

A layout component that arranges children horizontally with consistent spacing.

**Props:**
- `children`: React.ReactNode - Row content
- `spacing`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md') - Spacing between children
- `align`: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' (default: 'flex-start') - Horizontal alignment
- `verticalAlign`: 'flex-start' | 'center' | 'flex-end' | 'stretch' (default: 'center') - Vertical alignment
- `style`: ViewStyle - Optional custom style
- `testID`: string - Optional test ID

**Example:**
```tsx
import { Row } from '@/components/design-system/layout';

<Row spacing="md" align="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>
```

## Design Tokens

All layout components use design system spacing tokens:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

## Requirements

Validates Requirements:
- 1.2: Spacing using 8pt grid system
- 8.5: Consistent spacing using 24px section gap
