# Keyboard Navigation Guide

This document describes the keyboard navigation implementation across the application, ensuring WCAG 2.1 AA compliance.

## Overview

All interactive elements in the application support keyboard navigation with visible focus indicators. The implementation follows these principles:

- **Tab**: Navigate between interactive elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals, dropdowns, and overlays
- **Arrow Keys**: Navigate within dropdowns and menus

## Global Styles

Global keyboard navigation styles are defined in `src/styles/keyboard-navigation.css` and imported in `globals.css`.

### Focus Indicators

All interactive elements have a consistent focus indicator:

- **Color**: Primary brand color (#2B6A8E)
- **Style**: 2px solid outline with 2px offset
- **Visibility**: Only visible when using keyboard (`:focus-visible`)

## Component-Specific Navigation

### Modals

**File**: `src/components/ui/Modal/Modal.tsx`

- **Escape**: Closes the modal
- **Tab**: Cycles through focusable elements within the modal
- **Focus Trap**: Focus is trapped within the modal when open
- **Auto-focus**: First focusable element receives focus on open
- **Focus Restore**: Previous focus is restored on close

**ARIA Attributes**:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="modal-title"`

### Buttons

**File**: `src/components/ui/Button/Button.tsx`

- **Enter/Space**: Activates the button
- **Tab**: Navigates to next focusable element
- **Focus Ring**: Visible 2px ring in primary color

**States**:

- Disabled buttons are not focusable
- Loading state maintains focus but prevents activation

### Form Fields

**Files**:

- `src/components/ui/Form/FormField.tsx`
- `src/components/ui/Form/FormSelect.tsx`
- `src/components/ui/Form/FormTextarea.tsx`
- `src/components/ui/Form/FormDatePicker.tsx`

- **Tab**: Navigate between fields
- **Arrow Keys**: Navigate select options (native behavior)
- **Enter**: Submit form (when in text input)
- **Escape**: Clear field (custom implementation)

**ARIA Attributes**:

- `aria-invalid`: Set to "true" when field has error
- `aria-describedby`: Links to error or helper text
- `aria-required`: Set when field is required

### File Upload

**File**: `src/components/ui/Form/FormFileUpload.tsx`

- **Tab**: Focus the upload button
- **Enter/Space**: Open file picker
- **Tab**: Navigate to remove button when file is selected

### Dropdowns (Header)

**File**: `src/components/Layout/DashboardHeader.tsx`

#### Language Selector

- **Tab**: Focus the language button
- **Enter/Space**: Open language menu
- **Escape**: Close language menu
- **Arrow Down/Up**: Navigate language options (future enhancement)
- **Enter**: Select language

**ARIA Attributes**:

- `aria-expanded`: Indicates menu state
- `aria-haspopup="true"`: Indicates dropdown behavior
- `role="menu"`: On dropdown container
- `role="menuitem"`: On each option

#### User Menu

- **Tab**: Focus the user avatar button
- **Enter/Space**: Open user menu
- **Escape**: Close user menu
- **Tab**: Navigate menu items
- **Enter**: Activate menu item

### Sidebar Navigation

**File**: `src/components/Layout/Sidebar.tsx`

- **Tab**: Navigate between menu items
- **Enter**: Navigate to selected page
- **Arrow Down/Up**: Navigate menu items (future enhancement)
- **Focus Ring**: White ring on dark background

**ARIA Attributes**:

- `aria-current="page"`: Indicates active page
- `aria-label`: Descriptive labels for each link

### DataTable

**File**: `src/components/ui/DataTable/DataTable.tsx`

- **Tab**: Navigate between table controls (filters, pagination, action buttons)
- **Enter**: Activate buttons and links
- **Arrow Keys**: Navigate table cells (future enhancement)

## Hooks

### useKeyboardNavigation

**File**: `src/hooks/useKeyboardNavigation.ts`

Provides utilities for handling keyboard events in custom components.

```typescript
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const { handleKeyDown } = useKeyboardNavigation({
  onEscape: () => setIsOpen(false),
  onEnter: () => handleSubmit(),
  enabled: isOpen,
});
```

### useFocusTrap

Traps focus within a container (useful for modals and dropdowns).

```typescript
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

const containerRef = useRef<HTMLDivElement>(null);
useFocusTrap(isOpen, containerRef);
```

### useDropdownNavigation

Manages keyboard navigation for dropdown menus.

```typescript
import { useDropdownNavigation } from '@/hooks/useKeyboardNavigation';

const { selectedIndex } = useDropdownNavigation(
  isOpen,
  items.length,
  index => handleSelect(items[index]),
  () => setIsOpen(false)
);
```

## Testing Keyboard Navigation

### Manual Testing Checklist

1. **Tab Navigation**
   - [ ] Can navigate to all interactive elements
   - [ ] Tab order is logical and follows visual flow
   - [ ] Focus indicators are clearly visible
   - [ ] No keyboard traps (except intentional in modals)

2. **Modal Dialogs**
   - [ ] Escape closes the modal
   - [ ] Focus is trapped within modal
   - [ ] First element receives focus on open
   - [ ] Focus returns to trigger on close

3. **Dropdowns**
   - [ ] Enter/Space opens dropdown
   - [ ] Escape closes dropdown
   - [ ] Can navigate items with Tab
   - [ ] Enter selects item

4. **Forms**
   - [ ] Can navigate all fields with Tab
   - [ ] Error messages are announced
   - [ ] Required fields are indicated
   - [ ] Submit works with Enter

5. **Navigation**
   - [ ] Can access all menu items
   - [ ] Active page is indicated
   - [ ] Links work with Enter

### Automated Testing

Use the following tools for automated accessibility testing:

- **axe DevTools**: Browser extension for accessibility auditing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Jest + Testing Library**: Unit tests for keyboard interactions

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal/Modal';

test('modal closes on Escape key', async () => {
  const onClose = jest.fn();
  render(
    <Modal isOpen={true} onClose={onClose} title="Test">
      Content
    </Modal>
  );

  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});
```

## WCAG 2.1 AA Compliance

### Success Criteria Met

- **2.1.1 Keyboard (Level A)**: All functionality is available via keyboard
- **2.1.2 No Keyboard Trap (Level A)**: Users can navigate away from all components
- **2.4.3 Focus Order (Level A)**: Focus order is logical and meaningful
- **2.4.7 Focus Visible (Level AA)**: Focus indicator is clearly visible
- **3.2.1 On Focus (Level A)**: No unexpected context changes on focus
- **4.1.2 Name, Role, Value (Level A)**: All components have proper ARIA attributes

### Focus Indicator Requirements

- **Contrast Ratio**: Minimum 3:1 against background
- **Thickness**: 2px solid outline
- **Offset**: 2px from element edge
- **Color**: Primary brand color (#2B6A8E)

## Future Enhancements

1. **Arrow Key Navigation**: Add arrow key support for menu navigation
2. **Skip Links**: Add "Skip to main content" link for screen readers
3. **Keyboard Shortcuts**: Add global keyboard shortcuts (e.g., Ctrl+K for search)
4. **Focus Management**: Improve focus management in complex components
5. **Roving Tabindex**: Implement roving tabindex for better menu navigation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
