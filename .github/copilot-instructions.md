## Code Style
- **Formatting**: Use tabs and single quotes. See .prettierrc for details.
- **Imports**: Use path aliases (`~/`) instead of relative paths. Sort imports with simple-import-sort.
- **CSS Classes**: Follow BEM with prefixes: `t-` (tools), `o-` (objects), `c-` (components), `p-` (project). CSS modules may need to be imported into an `index.css` file.
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types.
- **Components**: Component library uses SolidJS. Split interactivity into callback modules for SSR support.
- **TypeScript**: Prefer type imports. Use strict type checking.
- **Error Handling**: Avoid throwing errors in components. Use error boundaries.
- **Browser Globals**: Don't use `window`/`document` directly. Use utility functions.
- **Testing**:
    - Use Vitest with `it()` (not `test()`).
    - We are not using Jest. Do not use Jest mocks
    - Colocate tests in same directory as source.
    - `describe`, `it`, `expect`, `vi.fn`, and other test helpers are globals and do not need to be imported. Do not import from `vitest` unnecessarily.
    - When testing Solid JS components, render using the `renderContainer` helper in `~/shared/utility/test-utils/render`, which returns a promise of a container element with the rendered JSX as children.
    - When updating input values, remember to call `fireEvent.change` since we rely heavily on change listeners.
    - Avoid mocking as much as possible in favor of using JSDOM implementations of things. When asked to write tests, do not assume implementation is correct and suggest fixes if appropriate.

Consult README.md for architecture details on SSR and progressive enhancement patterns.

## Commands
- `npm run build`: Build for production
- `npm run test`: Run all tests
- `npm run lint`: Run ESLint and StyleLint
- `npm run eslint:fix` - Fix ESLint issues
- `npm run stylelint:fix` - Fix StyleLint issues
- `npm run format`: Format code with Prettier
- `npm run typecheck`: Run TypeScript type checking