# Accessibility Testing Guide

This guide provides instructions for testing the accessibility features of the application.

## Quick Start

```bash
# Verify color contrast ratios
npm run test:contrast

# Run accessibility linter (if configured)
npm run lint:a11y
```

## Manual Testing Checklist

### 1. Keyboard Navigation Testing

#### Basic Navigation

- [ ] Press `Tab` to move forward through interactive elements
- [ ] Press `Shift+Tab` to move backward
- [ ] Verify focus indicators are visible on all elements
- [ ] Verify focus order is logical (top to bottom, left to right)

#### Form Testing

- [ ] Tab through all form fields
- [ ] Use `Enter` to submit forms
- [ ] Use `Space` to toggle checkboxes
- [ ] Use arrow keys in select dropdowns
- [ ] Verify error messages appear when validation fails

#### Modal Testing

- [ ] Open a modal and verify focus moves to modal
- [ ] Tab through modal elements (focus stays trapped)
- [ ] Press `Escape` to close modal
- [ ] Verify focus returns to trigger element

#### Button Testing

- [ ] Tab to buttons
- [ ] Press `Enter` or `Space` to activate
- [ ] Verify disabled buttons cannot be activated

### 2. Screen Reader Testing

#### Windows (NVDA - Free)

1. Download NVDA from https://www.nvaccess.org/
2. Install and start NVDA
3. Navigate to the application
4. Test the following:
   - [ ] All form labels are announced
   - [ ] Error messages are announced immediately
   - [ ] Button purposes are clear
   - [ ] Headings provide structure
   - [ ] Links are descriptive

#### macOS (VoiceOver - Built-in)

1. Press `Cmd+F5` to enable VoiceOver
2. Navigate to the application
3. Use `Ctrl+Option+Arrow` to navigate
4. Test the same items as above

#### Common Issues to Check

- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Error messages are associated with fields
- [ ] Status messages are announced

### 3. Color Contrast Testing

#### Automated Testing

```bash
# Run the contrast verification script
npm run test:contrast
```

#### Manual Testing with Browser DevTools

**Chrome DevTools:**

1. Open DevTools (F12)
2. Select an element with text
3. Look for the contrast ratio in the Styles panel
4. Verify it meets 4.5:1 for normal text

**Firefox DevTools:**

1. Open DevTools (F12)
2. Go to Accessibility tab
3. Select "Check for issues" > "Contrast"
4. Review flagged elements

#### Color Blindness Simulation

1. Use Chrome extension "Colorblindly"
2. Test with different color blindness types:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
3. Verify information is not conveyed by color alone

### 4. Zoom and Magnification Testing

#### Browser Zoom

- [ ] Zoom to 200% (`Ctrl/Cmd` + `+`)
- [ ] Verify no horizontal scrolling
- [ ] Verify text remains readable
- [ ] Verify interactive elements remain usable
- [ ] Test at 400% zoom for extreme cases

#### Text Resize

- [ ] Increase browser text size (Settings > Appearance)
- [ ] Verify layout doesn't break
- [ ] Verify text doesn't overlap

### 5. Mobile Accessibility Testing

#### Touch Targets

- [ ] All interactive elements are at least 44x44 pixels
- [ ] Adequate spacing between touch targets
- [ ] No accidental activations

#### Screen Reader (iOS VoiceOver)

1. Settings > Accessibility > VoiceOver > On
2. Swipe right to navigate
3. Double-tap to activate
4. Test form fields and buttons

#### Screen Reader (Android TalkBack)

1. Settings > Accessibility > TalkBack > On
2. Swipe right to navigate
3. Double-tap to activate
4. Test form fields and buttons

## Automated Testing Tools

### 1. axe DevTools (Browser Extension)

**Installation:**

- Chrome: https://chrome.google.com/webstore (search "axe DevTools")
- Firefox: https://addons.mozilla.org/firefox/ (search "axe DevTools")

**Usage:**

1. Open DevTools
2. Go to "axe DevTools" tab
3. Click "Scan ALL of my page"
4. Review issues by severity
5. Fix critical and serious issues

### 2. WAVE (Browser Extension)

**Installation:**

- Chrome/Firefox: Search for "WAVE Evaluation Tool"

**Usage:**

1. Click WAVE icon in browser toolbar
2. Review errors (red icons)
3. Review alerts (yellow icons)
4. Check contrast issues
5. Review structure (headings, landmarks)

### 3. Lighthouse (Chrome DevTools)

**Usage:**

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review score and issues
6. Aim for 90+ score

### 4. Pa11y (Command Line)

**Installation:**

```bash
npm install -g pa11y
```

**Usage:**

```bash
# Test a single page
pa11y http://localhost:3000/dashboard/users

# Test with specific standard
pa11y --standard WCAG2AA http://localhost:3000

# Test multiple pages
pa11y http://localhost:3000/dashboard/users \
      http://localhost:3000/dashboard/roles \
      http://localhost:3000/dashboard/profiles
```

## Common Accessibility Issues and Fixes

### Issue: Missing Form Labels

**Problem:** Screen readers can't identify form fields
**Fix:**

```tsx
// ❌ Bad
<input type="text" />

// ✅ Good
<label htmlFor="username">Username</label>
<input id="username" type="text" />
```

### Issue: Missing Alt Text

**Problem:** Screen readers can't describe images
**Fix:**

```tsx
// ❌ Bad
<img src="profile.jpg" />

// ✅ Good
<img src="profile.jpg" alt="User profile photo" />

// ✅ Decorative images
<img src="decoration.jpg" alt="" />
```

### Issue: Poor Color Contrast

**Problem:** Text is hard to read
**Fix:**

```tsx
// ❌ Bad - gray-400 on white (2.54:1)
<p className="text-gray-400">Important text</p>

// ✅ Good - gray-700 on white (10.31:1)
<p className="text-gray-700">Important text</p>
```

### Issue: No Focus Indicators

**Problem:** Keyboard users can't see where they are
**Fix:**

```css
/* ❌ Bad */
button:focus {
  outline: none;
}

/* ✅ Good */
button:focus-visible {
  outline: 2px solid #2b6a8e;
  outline-offset: 2px;
}
```

### Issue: Inaccessible Error Messages

**Problem:** Screen readers don't announce errors
**Fix:**

```tsx
// ❌ Bad
{
  error && <p className="text-red-600">{error}</p>;
}

// ✅ Good
{
  error && (
    <p id="field-error" className="text-red-600" role="alert">
      {error}
    </p>
  );
}

<input
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? 'field-error' : undefined}
/>;
```

## Accessibility Checklist for New Features

When adding new features, verify:

### Forms

- [ ] All fields have visible labels
- [ ] Required fields are marked with `*` and `required` attribute
- [ ] Error messages have `role="alert"`
- [ ] Fields have `aria-invalid` when errors present
- [ ] Fields have `aria-describedby` linking to errors
- [ ] Submit button is disabled during submission

### Buttons

- [ ] Button text is descriptive (not just "Click here")
- [ ] Icon-only buttons have `aria-label`
- [ ] Disabled state is clear (visual + `disabled` attribute)
- [ ] Loading state shows spinner and disables button

### Modals

- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger when closed
- [ ] Modal has `role="dialog"` and `aria-modal="true"`

### Tables

- [ ] Table has `<caption>` or `aria-label`
- [ ] Headers use `<th>` with `scope` attribute
- [ ] Sortable columns indicate sort direction
- [ ] Pagination controls are keyboard accessible

### Images

- [ ] All images have `alt` attribute
- [ ] Decorative images have `alt=""`
- [ ] Complex images have detailed descriptions

### Links

- [ ] Link text is descriptive (not "click here")
- [ ] Links to external sites indicate this
- [ ] Links that open new windows warn users

## Testing Schedule

### During Development

- Run contrast verification script before committing
- Test keyboard navigation for new components
- Use axe DevTools on new pages

### Before Pull Request

- Run full accessibility audit with Lighthouse
- Test with screen reader (basic navigation)
- Verify all form fields have labels

### Before Release

- Complete manual testing checklist
- Run automated tests (Pa11y, axe)
- Test with real assistive technologies
- Get feedback from users with disabilities (if possible)

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Articles](https://webaim.org/articles/)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers

- [NVDA (Windows - Free)](https://www.nvaccess.org/)
- [JAWS (Windows - Paid)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS - Built-in)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Android - Built-in)](https://support.google.com/accessibility/android/answer/6283677)

## Support

If you encounter accessibility issues or have questions:

1. Check this guide first
2. Review the [Accessibility Audit Report](./ACCESSIBILITY_AUDIT.md)
3. Consult the WCAG 2.1 guidelines
4. Ask the team for help

Remember: Accessibility is not optional. It's a requirement for all features.
