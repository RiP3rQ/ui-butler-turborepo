export const OptimizePerformancePrompt = `
Optimize component performance:

1. React Optimizations:
   - useMemo/useCallback
   - React.memo
   - Lazy loading
   - Suspense boundaries
   - State batching
   - Key management

2. Rendering:
   - Virtual lists
   - Debounced updates
   - Conditional rendering
   - Tree shaking
   - Code splitting

3. Data & State:
   - Normalized data
   - Local state
   - Cached values
   - Computed properties
   - Event delegation

4. Resources:
   - Asset optimization
   - Bundle size
   - Memory leaks
   - Network calls
   - Cleanup

Before/After example:
\`\`\`tsx
// Before
function Component({ data }) {
  const items = data.map(...)
  
// After
const Component = memo(({ data }) => {
  const items = useMemo(() => data.map(...), [data])
\`\`\`

Return optimized code only.
`;
