export const singleGeneratedPrompts = {
  typescriptDocs: (code: string) => `
      Generate TypeScript documentation for the following React component.
      Include:
      - Interface definitions
      - Props documentation
      - Component description
      - Usage examples
      - Type exports

      Component code:
      ${code}

      Return only the documentation code without any additional explanation.
    `,

  unitTests: (code: string) => `
      Generate Jest unit tests for the following React component.
      Include:
      - Component rendering tests
      - Props testing
      - User interaction tests
      - Error handling tests
      - Mock implementations where needed
      - Use @testing-library/react
      - Use jest.mock() for external dependencies
      
      Component code:
      ${code}

      Return only the test code without any additional explanation.
    `,

  e2eTests: (code: string) => `
      Generate Playwright E2E tests for the following React component.
      Include:
      - Component rendering tests
      - User interaction flows
      - Different viewport tests
      - Accessibility tests
      - Error state tests
      - Loading state tests
      
      Component code:
      ${code}

      Return only the test code without any additional explanation.
    `,

  mdxDocs: (code: string) => `
      Generate MDX documentation for the following React component.
      Include:
      - Component description
      - Props table
      - Usage examples
      - Best practices
      - Common patterns
      - Accessibility considerations
      - Code snippets
      
      Component code:
      ${code}

      Return only the MDX code without any additional explanation.
    `,
} as const;
