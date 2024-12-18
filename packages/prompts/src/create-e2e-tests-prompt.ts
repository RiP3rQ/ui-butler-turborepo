export const CreateE2eTestsPrompt = `
Generate Playwright E2E tests with Page Object Model pattern.

Test Coverage:
1. Core Setup:
   - Page objects & fixtures
   - Test isolation & cleanup
   - Custom helpers & timeouts
   - Error handling & logging

2. User Experience:
   - Click interactions & forms
   - Keyboard navigation
   - Hover states & tooltips
   - Error messages & validation
   - Loading states & feedback

3. Cross-platform:
   - Browsers: Chromium, Firefox, WebKit
   - Viewports: Mobile(320px), Tablet(768px), Desktop(1024px+)
   - Touch & mouse interactions
   - Network: 4G, 3G, Offline
   - Orientation changes

4. Quality Checks:
   - Accessibility (ARIA, keyboard, screen readers)
   - Performance (load times, animations)
   - Visual regression
   - State management
   - API interactions
   - Edge cases & errors

Structure:
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { ComponentPage } from './component.page';

test.describe('Component Tests', () => {
  let page: ComponentPage;
  
  test.beforeEach(async ({ browser }) => {
    page = new ComponentPage(browser);
  });

  // Core tests...
});
\`\`\`

Follow:
- TypeScript best practices
- Clear test naming (given/when/then)
- Proper assertions & timeouts
- Screenshot comparisons
- Error recovery patterns

Return only test code.
`;
