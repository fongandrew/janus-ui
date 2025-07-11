# Refactoring Plan: Splitting src/shared into Isomorphic and Web-Specific Code

## Overview

This document outlines the plan to refactor the `src/shared/` directory into two separate directories:
- `src/shared-iso/`: Isomorphic JavaScript components that can run in any JavaScript environment (server or browser)
- `src/shared-web/`: Browser-specific code that handles DOM manipulation, event handlers, and progressive enhancement

## Goals

1. **Enable true isomorphic rendering**: Components in `shared-iso` should be able to render on the server without any DOM dependencies
2. **Maintain type safety**: Use TypeScript declaration files to allow isomorphic components to import web-specific types without breaking in non-browser environments
3. **Support progressive enhancement**: Web-specific code should enhance server-rendered HTML without requiring a full SPA approach
4. **Keep existing functionality**: The refactor should not break any existing behavior

## Current Architecture Analysis

### Component Organization
The current `src/shared/components/` directory contains:
- **Component files (.tsx)**: All components are designed to be isomorphic, handling rendering logic with SolidJS
- **Callback modules**: The `callbacks/` directory contains all browser-specific event handlers and DOM manipulation
- **CSS files**: Styling that works in both SSR and client environments

### Separation Pattern
The codebase already follows a clean separation pattern:
- **Components** (all isomorphic):
  - Handle rendering logic and state management
  - Work in both SSR and browser environments
  - Import callbacks for client-side functionality
  - May reference browser types but don't directly use browser APIs
- **Callbacks** (browser-specific):
  - Handle all DOM manipulation and browser events
  - Register delegated event handlers
  - Use browser APIs like `showModal()`, `hidePopover()`, focus management
  - Are loaded separately for progressive enhancement

## Proposed Directory Structure

```
src/
├── shared-iso/             # Isomorphic components
│   ├── components/         # Pure rendering components
│   ├── styles/            # CSS files (can be used in both environments)
│   ├── utility/           # Isomorphic utilities
│   └── tsconfig.json      # No DOM lib
│
├── shared-web/            # Browser-specific code
│   ├── callbacks/         # Event handlers and DOM manipulation
│   ├── utility/           # Browser-specific utilities
│   └── tsconfig.json      # Includes DOM lib
│
└── tsconfig.base.json     # Base config for demo pages and tests
```

## TypeScript Configuration Strategy

### 1. Base Configuration (`tsconfig.base.json`)
```json
{
  "compilerOptions": {
    // All current compiler options
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    // ... rest of current config
  }
}
```

### 2. Isomorphic Configuration (`src/shared-iso/tsconfig.json`)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext"], // No DOM lib
    "declaration": true,
    "declarationDir": "../../dist/types/shared-iso",
    "paths": {
      "~/shared-web/*": ["../../dist/types/shared-web/*"]
    }
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"]
}
```

### 3. Web Configuration (`src/shared-web/tsconfig.json`)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "../../dist/types/shared-web"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"]
}
```


## Migration Checklist (Gradual Approach)

### Phase 1: Infrastructure Setup (No Breaking Changes)
- [ ] Create `src/shared-iso/` directory structure
- [ ] Create `src/shared-web/` directory structure
- [ ] Copy current `tsconfig.json` to `tsconfig.base.json`
- [ ] Create `src/shared-iso/tsconfig.json` extending base without DOM lib
- [ ] Create `src/shared-web/tsconfig.json` extending base with declaration output
- [ ] Update root `tsconfig.json` to extend `tsconfig.base.json`
- [ ] Add build step to generate declaration files for `shared-web`
- [ ] Add new path aliases to Vite config (keeping old ones):
  - Keep: `~/shared/*` → `src/shared/*`
  - Add: `~/shared-iso/*` → `src/shared-iso/*`
  - Add: `~/shared-web/*` → `src/shared-web/*`
- [ ] Verify build, types, and linting still work with no other changes

### Phase 2: Move Callbacks First (Easiest)
- [ ] Copy `src/shared/components/callbacks/` to `src/shared-web/callbacks/`
- [ ] Update a single component to import from `~/shared-web/callbacks/*`
- [ ] Verify that component still works
- [ ] Gradually update remaining components to use `~/shared-web/callbacks/*`
- [ ] Once all imports updated, delete `src/shared/components/callbacks/`
- [ ] Verify build, types, and linting still work

### Phase 3: Move Browser-Specific Utilities
- [ ] Create `src/shared-web/utility/` directory
- [ ] Move one browser-specific utility at a time:
  - [ ] Move file to `shared-web/utility/`
  - [ ] Update all imports for that utility
  - [ ] Test that everything still works
  - [ ] Repeat for next utility
- [ ] Browser utilities to move:
  - [ ] `browser.ts`, `os.ts`
  - [ ] `document-setup.ts`, `element-types.ts`, `event-propagation.ts`
  - [ ] `focusables.ts`, `focus-and-select.ts`, `get-scrollable-parent.ts`
  - [ ] `is-focus-visible.ts`, `is-visible.ts`
  - [ ] `storage.ts`, `multi-view.ts`
  - [ ] `unmount-observer.ts`, `use-data-kb-nav.ts`
  - [ ] `attribute.ts`, `create-text-matcher.ts`
  - [ ] `ui-prefs/` directory
  - [ ] `callback-attrs/` directory
  - [ ] DOM-dependent files from `solid/` directory
- [ ] Verify build, types, and linting still work

### Phase 4: Move Isomorphic Utilities
- [ ] Create `src/shared-iso/utility/` directory
- [ ] Move one isomorphic utility at a time:
  - [ ] Move file to `shared-iso/utility/`
  - [ ] Update all imports for that utility
  - [ ] Verify it compiles without DOM types
  - [ ] Test that everything still works
- [ ] Move utility subdirectories:
  - [ ] `memoize/` directory
  - [ ] `datetime/` directory
  - [ ] `text/` directory (except browser-dependent files)
  - [ ] Isomorphic files from `solid/` directory
- [ ] Verify build, types, and linting still work

### Phase 5: Move Components
- [ ] Create `src/shared-iso/components/` directory
- [ ] Move components in small batches:
  - [ ] Start with simplest components (Button, Input, etc.)
  - [ ] Move component file and its CSS to `shared-iso/components/`
  - [ ] Update imports in demo pages and tests
  - [ ] Verify component works and type-checks without DOM lib
  - [ ] Move next batch
- [ ] Component migration order (suggested):
  1. Context providers and simple components
  2. Form components
  3. Layout components
  4. Complex interactive components (Modal, Dropdown, etc.)
- [ ] Verify build, types, and linting still work

### Phase 6: Move Styles
- [ ] Copy `src/shared/styles/` to `src/shared-iso/styles/`
- [ ] Update style imports
- [ ] Delete original `src/shared/styles/` when done

### Phase 7: Final Cleanup
- [ ] Remove `~/shared/*` path alias from Vite config
- [ ] Delete empty `src/shared/` directory
- [ ] Update any documentation references
- [ ] Run full test suite
- [ ] Verify all demo pages work

## Components Classification

### All Components are Isomorphic (`shared-iso/components`)
All `.tsx` component files will be placed in `shared-iso/components/`, including:
- Basic components: Alert, Button, Card, Checkbox, Radio, Input, Textarea, etc.
- Complex components: Modal, Dropdown, Select, Tooltip, CodeBlock, Img
- Layout components: SidebarLayout, TopNavLayout, Tabs
- Context providers: FormContext, ModalContext, TabContext, etc.
- All other component files

These components handle browser-specific functionality by importing callback functions from `shared-web/callbacks/`. The callbacks handle all DOM manipulation, event listeners, and browser API usage.

### Web-Specific Code (`shared-web`)
- **All callback modules**: The entire `callbacks/` directory containing DOM event handlers and browser API usage
- **Browser-specific utilities**: Focus management, DOM queries, storage, window/document utilities
- **Type declarations**: Generated `.d.ts` files for isomorphic code to reference

## Utilities Classification

### Isomorphic Utilities (`shared-iso/utility`)
- **Pure algorithms/data structures**: hash, random, normalize-text, priority-queue, lru-cache
- **String/array utilities**: camel-to-kebab, compact, find-last-index, sort-by, list
- **Async utilities**: deferred, debounce-async, throttle, sync-or-promise
- **Memoization utilities**: All files in `memoize/` directory
- **Date/time utilities**: All files in `datetime/` directory
- **Text formatting**: Most files in `text/` directory (using Intl API)
- **General utilities**: circuit-breaker, debug, error-code, iterators, logger, magic-prop, map-values, parse, step, type-helpers
- **Some Solid utilities**: auto-prop, create-incr-signal, keyed-resource, locale-context, memoized-resource, resolve, resource-context

### Web-Specific Utilities (`shared-web/utility`)
- **Browser detection**: browser.ts, os.ts
- **DOM utilities**: document-setup, element-types, event-propagation, focusables, focus-and-select, get-scrollable-parent, is-focus-visible, is-visible, unmount-observer, use-data-kb-nav
- **Storage utilities**: storage.ts (localStorage/sessionStorage)
- **Window/document utilities**: multi-view.ts
- **UI preferences**: All files in `ui-prefs/` directory
- **Callback attributes**: All files in `callback-attrs/` directory
- **DOM-dependent Solid utilities**: window-context, mount-root, combine-refs, handle-event, spanify, prop-mod-context
- **Test utilities**: Most files in `test-utils/` directory (DOM-related)

### Additional Classifications (After Investigation)
**Isomorphic utilities** to add to `shared-iso/utility`:
- **color-contrast.ts**: Pure color math calculations
- **create-query-effect.ts**: Pure async utility using standard JS APIs
- **attribute-list.ts**: Re-exports classix library (isomorphic)
- **bound-callbacks.ts**: Pure callback management utility

**Web-specific utilities** to add to `shared-web/utility`:
- **attribute.ts**: Uses DOM APIs (Element, getAttribute, setAttribute)
- **create-text-matcher.ts**: Uses DOM APIs (HTMLElement, Node, textContent)

## Build Process Updates

### 1. Declaration File Generation
- Add build step to generate `.d.ts` files for `shared-web`
- Configure TypeScript to emit declarations to `dist/types/`

### 2. Path Resolution
- Update Vite config to resolve `~/shared-iso` and `~/shared-web`
- For isomorphic builds, alias `~/shared-web` to declaration files

### 3. CSS Processing
- Keep CSS in `shared-iso` since it's needed for both environments
- Ensure PurgeCSS processes both directories

## Testing Strategy

1. **Unit Tests**: Run tests against both directories
2. **Type Tests**: Ensure isomorphic code compiles without DOM types
3. **Integration Tests**: Test that components work in both SPA and SSR modes
4. **Build Tests**: Verify declaration files are generated correctly

## Rollback Plan

If issues arise:
1. The original `src/shared/` structure can be restored from git
2. Import aliases can be reverted in Vite config
3. TypeScript configs can be consolidated back

## Success Criteria

1. ✅ All components in `shared-iso` compile without DOM library
2. ✅ Components can import callbacks from `shared-web` via declaration files
3. ✅ Type checking passes for isomorphic code without DOM globals
4. ✅ Build process generates correct declaration files for `shared-web`
5. ✅ All existing functionality continues to work
6. ✅ Demo pages and tests continue to pass
7. ✅ Clear separation: components in iso, callbacks/DOM utilities in web

## Next Steps

1. Review and approve this plan
2. Create feature branch for refactoring
3. Execute phases 1-5 in order
4. Run comprehensive tests
5. Update documentation
6. Merge when all tests pass