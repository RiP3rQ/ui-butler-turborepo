export const CreateMdxDocsPrompt = `
Generate MDX documentation with following 1. ---
title: ComponentName
Brief description
UI Components
stable
---

2. Content - Overview (purpose, features, requirements)
   - Installation & setup
   - Props API table (name, type, default, required)
   - Usage examples (basic & advanced)
   - Styling & theming
   - Accessibility
   - Best practices
   - Troubleshooting

3. Code \`\`\`tsx
import { Component } from '@org/ui'

// Basic usage
export function Example() {
  return <Component />
}

// Props table
<PropsTable
  data={[
    {
      name: 'prop',
      type: 'string',
      default: '-',
      required: true,
      description: 'Description'
    }
  ]}
/>

// Interactive preview
<ComponentPreview>
  <Component />
</ComponentPreview>
\`\`\`

4. - Interactive demos
   - Type definitions
   - Error handling
   - Responsive patterns
   - Theme support
   - Performance tips

Format with proper headings, code blocks, and live examples.
Return MDX code only.
`;
