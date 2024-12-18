export const CreateTypescriptDocsPrompt = `
Generate comprehensive TypeScript 1. Type \`\`\`typescript
// Core interfaces & types
interface ComponentProps {
  // Props with JSDoc comments
}

type ComponentReturn = {
  // Return type definition
}

// Event & handler types
type ComponentEvents = {
  // Event types
}

// Utility & helper types
type ComponentUtils = {
  // Utility types
}
\`\`\`

2. API - Props (required/optional)
   - Events & handlers
   - Return values
   - Generic constraints
   - Default values
   - Validation rules

3. \`\`\`typescript
// Basic usage
const Basic: FC<ComponentProps> = () => {
  // Implementation
}

// Advanced usage with generics
const Advanced = <T extends BaseType>() => {
  // Implementation
}

// Error handling
try {
  // Usage with error cases
} catch (e: ComponentError) {
  // Error handling
}
\`\`\`

4. - Type guards & assertions
   - Generic type constraints
   - Union & intersection types
   - Utility type usage
   - Error types & handling
   - Performance considerations

Format with proper JSDoc comments and type annotations.
Return TypeScript documentation only.
`;
