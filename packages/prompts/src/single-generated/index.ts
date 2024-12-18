export const singleGeneratedPrompts = {
  generateComponent: (prompt: string) => `
    Create a production-ready React component following this description:
    ${prompt}

    Technical Requirements:
    1. TypeScript Implementation:
       - Use strict type checking with 'strict: true'
       - Create detailed interfaces/types for all props and states
       - Implement proper generic types where applicable
       - Use proper type guards and assertions

    2. React Patterns:
       - Implement proper hooks (useState, useEffect, useCallback, useMemo)
       - Use React.memo() for performance optimization
       - Implement proper event handlers with TypeScript events
       - Use proper refs with TypeScript typing
       - Handle component lifecycle properly

    3. Error Handling:
       - Implement error boundaries with fallback UI
       - Add try-catch blocks for async operations
       - Handle edge cases and null checks
       - Provide meaningful error messages
       - Implement proper error states in UI

    4. Loading States:
       - Add loading skeletons/spinners
       - Implement suspense boundaries
       - Handle loading states for async operations
       - Show proper loading feedback
       - Prevent content layout shift

    5. Accessibility:
       - Implement proper ARIA roles and labels
       - Ensure keyboard navigation
       - Add proper focus management
       - Include proper semantic HTML
       - Follow WCAG 2.1 guidelines
       - Add proper color contrast

    6. Performance:
       - Implement proper code splitting
       - Use proper memoization
       - Optimize re-renders
       - Handle large datasets efficiently
       - Implement virtualization if needed

    7. Styling:
       - Use CSS-in-JS or CSS modules
       - Implement responsive design (mobile-first)
       - Handle dark/light themes
       - Use proper CSS variables
       - Handle RTL layouts

    Return only the component code without explanations.
  `,

  typescriptDocs: (code: string) => `
    Generate comprehensive TypeScript documentation for this React component:
    ${code}

    Documentation Requirements:
    1. Type Definitions:
       - Detailed interface definitions with comments
       - Generic type parameters explanation
       - Type unions and intersections
       - Utility types usage
       - External type dependencies

    2. Component API:
       - Props interface with detailed JSDoc
       - Return type specifications
       - Event handler types
       - State type definitions
       - Custom hooks types

    3. Usage Examples:
       - Basic implementation
       - Advanced use cases
       - Generic type usage
       - Error handling examples
       - Async operation handling

    Return only the documentation code without explanations.
  `,

  unitTests: (code: string) => `
    Generate comprehensive Jest/React Testing Library tests for this component:
    ${code}

    Testing Requirements:
    1. Test Suites:
       - Component rendering in all states
       - Props validation and effects
       - User interactions (click, input, hover)
       - Async operations and loading states
       - Error handling scenarios
       - Edge cases and boundary conditions

    2. Testing Patterns:
       - Use React Testing Library best practices
       - Implement proper test isolation
       - Mock external dependencies
       - Test accessibility features
       - Test performance optimizations
       - Handle async operations properly

    3. Coverage:
       - Aim for 100% branch coverage
       - Test all user interactions
       - Test all error states
       - Test all loading states
       - Test all success states

    Return only the test code without explanations.
  `,

  e2eTests: (code: string) => `
    Generate comprehensive Playwright E2E tests for this component:
    ${code}

    E2E Testing Requirements:
    1. Test Scenarios:
       - Full user interaction flows
       - Multiple viewport sizes (mobile, tablet, desktop)
       - Network conditions handling
       - Performance measurements
       - Visual regression tests
       - Accessibility compliance

    2. Test Coverage:
       - Happy path scenarios
       - Error path scenarios
       - Edge cases
       - Performance benchmarks
       - Cross-browser compatibility
       - Responsive design verification

    3. Testing Patterns:
       - Page Object Model implementation
       - Custom test fixtures
       - Test data management
       - Screenshot comparisons
       - Network request handling
       - State management verification

    Return only the test code without explanations.
  `,

  mdxDocs: (code: string) => `
    Generate comprehensive MDX documentation for this component:
    ${code}

    Documentation Requirements:
    1. Component Overview:
       - Detailed description and purpose
       - Key features and capabilities
       - Technical requirements
       - Browser compatibility
       - Performance considerations
       - Accessibility features

    2. Implementation Guide:
       - Step-by-step installation
       - Basic and advanced usage
       - Props configuration
       - Event handling
       - State management
       - Error handling
       - Styling customization

    3. Examples:
       - Interactive code examples
       - Common use cases
       - Advanced patterns
       - Integration examples
       - Troubleshooting guide
       - Best practices

    4. API Reference:
       - Detailed props table
       - Events documentation
       - Method descriptions
       - Type definitions
       - Default values
       - Required vs optional props

    Return only the MDX code without explanations.
  `,
} as const;
