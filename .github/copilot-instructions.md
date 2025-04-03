## Code Style
- **Formatting**: Use tabs and single quotes. See .prettierrc for details.
- **Imports**: Use path aliases (`~/`) instead of relative paths. Sort imports with simple-import-sort.
- **CSS Classes**: Follow BEM with prefixes: `t-` (tools), `o-` (objects), `c-` (components), `p-` (project). CSS modules may need to be imported into an `index.css` file.
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types.
- **Components**: Component library uses SolidJS. Split interactivity into callback modules for SSR support.
- **TypeScript**: Prefer type imports. Use strict type checking.
- **Error Handling**: Avoid throwing errors in components. Use error boundaries.
- **Browser Globals**: Don't use `window`/`document` directly. Use utility functions.
- **Unit Testing**:
    - Use unit for simple utilities.
    - Use Vitest with `it()` (not `test()`).
    - Vitest helpers like `describe`, `it`, `expect`, and `vi.fn` must be imported from `vitest`.
    - We are not using Jest. Do not use Jest mocks.
    - Colocate unit tests in same directory as source with `*.test.ts(x)` extension.
- **E2E Testing**:
    - E2E tests are preferred for anything involving actual component rendering. Base components rely heavily on things not implemented in JSDOM.
    - We use Playwright for E2E tests.
    - Import Playwright helpers like `test` and `expect` from `@playwright/test`.
    - Colocate E2E tests in same directory as source with `*.e2e.ts(x)` extension.

Consult README.md for architecture details on SSR and progressive enhancement patterns.

## Commands
- `npm run build`: Build for production
- `npm run test`: Run unit tests
- `npm run test:e2e`: Run E2E tests
- `npm run lint`: Run ESLint and StyleLint
- `npm run eslint:fix` - Fix ESLint issues
- `npm run stylelint:fix` - Fix StyleLint issues
- `npm run format`: Format code with Prettier
- `npm run typecheck`: Run TypeScript type checking