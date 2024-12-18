export const CreateUnitTestsPrompt = `
Generate Jest/RTL tests:

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Component', () => {
  const defaultProps = {}
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders and behaves correctly')
})
\`\`\`

Test:
1. Core
   - Rendering states
   - Props validation
   - User interactions
   - Error handling

2. Async
   - Data loading
   - API calls
   - Error states
   - Retries

3. Events
   - Click/input
   - Keyboard
   - Focus
   - Forms

4. Edge Cases
   - Empty states
   - Invalid inputs
   - Boundaries
   - Errors

Use:
- RTL best practices
- User-centric testing
- Proper mocking
- Clear assertions

Return tests only.
`;
