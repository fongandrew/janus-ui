# Refactoring Plan: Organizing src/shared as a Composite TypeScript Project

## Overview

This document outlines the plan to reorganize the `src/shared/` directory as a composite TypeScript project with well-defined sub-projects and import constraints. The new structure will enforce clean architecture boundaries through TypeScript configuration.

## Goals

1. **Enforce isomorphic constraints**: `utils-iso` and `components` will contain only isomorphic JavaScript
2. **Clear separation of concerns**: Browser-specific code isolated to `callbacks` and `utils-browser`
3. **Unidirectional dependencies**: Enforce a clear import hierarchy between sub-projects
4. **Type safety**: Use TypeScript project references to enforce constraints at compile time
5. **Maintainability**: Clear boundaries make the codebase easier to understand and modify

## Proposed Directory Structure

```
src/
├── shared/                    # Composite TypeScript project
│   ├── components/           # Isomorphic UI components (ESNext only)
│   │   └── tsconfig.json
│   ├── callbacks/            # Browser event handlers (DOM + ESNext)
│   │   └── tsconfig.json
│   ├── styles/               # CSS files (shared by all)
│   ├── utils-iso/            # Isomorphic utilities (ESNext only)
│   │   └── tsconfig.json
│   ├── utils-browser/        # Browser utilities (DOM + ESNext)
│   │   └── tsconfig.json
│   └── tsconfig.json         # Root config for composite project
├── demos/                    # Demo pages (browser code)
├── tests/                    # Test files (browser code)
└── tsconfig.json             # Config for src code outside shared
```

## Import Hierarchy

The import dependencies flow in one direction:

```
src (demos, tests, etc.) → shared/*
                             ↓
components → callbacks → utils-browser → utils-iso
    ↓            ↓             ↓
    └────────────┴─────────────┴──────────→ utils-iso
```

### Within shared/:
- `components` may import from: `callbacks`, `utils-browser`, `utils-iso`
- `callbacks` may import from: `utils-browser`, `utils-iso`
- `utils-browser` may import from: `utils-iso`
- `utils-iso` may NOT import from any other sub-project

### Between src/ and shared/:
- Code outside `shared/` (demos, tests, etc.) may import from any `shared/` sub-project
- Code inside `shared/` may NOT import from outside `shared/`

## TypeScript Configuration Strategy

**Note**: TypeScript is used only for type checking and generating declaration files. The actual build is handled by Vite. The `noEmit` option should be set to `true` in most configs, with declaration generation enabled only where needed.

### 1. Root Composite Project (`src/shared/tsconfig.json`)
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": false,  // We need to emit declarations for this composite root
    "emitDeclarationOnly": true,
    "rootDir": "."
  },
  "files": [],
  "references": [
    { "path": "./utils-iso" },
    { "path": "./utils-browser" },
    { "path": "./callbacks" },
    { "path": "./components" }
  ]
}
```

### 2. Isomorphic Utils (`src/shared/utils-iso/tsconfig.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ESNext"],  // No DOM library
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declarationDir": "../../../dist/types/shared/utils-iso"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"]
}
```

### 3. Browser Utils (`src/shared/utils-browser/tsconfig.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declarationDir": "../../../dist/types/shared/utils-browser"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"],
  "references": [
    { "path": "../utils-iso" }
  ]
}
```

### 4. Callbacks (`src/shared/callbacks/tsconfig.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declarationDir": "../../../dist/types/shared/callbacks"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"],
  "references": [
    { "path": "../utils-iso" },
    { "path": "../utils-browser" }
  ]
}
```

### 5. Components (`src/shared/components/tsconfig.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ESNext"],  // No DOM library
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declarationDir": "../../../dist/types/shared/components",
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"],
  "references": [
    { "path": "../utils-iso" },
    { "path": "../utils-browser" },
    { "path": "../callbacks" }
  ]
}
```

### 6. External Source Code (`src/tsconfig.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "noEmit": true,  // Vite handles the build
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  },
  "include": [
    "./demos/**/*",
    "./tests/**/*",
    "./app/**/*"
    // Add other directories outside shared/ as needed
  ],
  "exclude": ["node_modules", "./shared"],
  "references": [
    { "path": "./shared" }
  ]
}
```

## Migration Plan

### Phase 1: Setup Composite Project Structure
- [ ] Create directory structure: `components`, `callbacks`, `utils-iso`, `utils-browser`
- [ ] Create tsconfig.json files for each sub-project within shared/
- [ ] Create root `src/shared/tsconfig.json` with project references
- [ ] Create `src/tsconfig.json` for external code (demos, tests, etc.)
- [ ] Update root tsconfig.json to reference both src/ and shared/ projects
- [ ] Update build scripts to use `tsc --build` for declaration generation
- [ ] Ensure Vite continues to handle the actual build process
- [ ] Update path aliases in root tsconfig.json:
  ```json
  "paths": {
    "~/shared/components/*": ["src/shared/components/*"],
    "~/shared/callbacks/*": ["src/shared/callbacks/*"],
    "~/shared/utils-iso/*": ["src/shared/utils-iso/*"],
    "~/shared/utils-browser/*": ["src/shared/utils-browser/*"],
    "~/shared/styles/*": ["src/shared/styles/*"]
  }
  ```

### Phase 2: Move Utilities
- [ ] Identify and classify all utilities as isomorphic or browser-specific
- [ ] Move isomorphic utilities to `utils-iso/`:
  - Pure algorithms, data structures
  - String/array utilities
  - Date/time utilities
  - Async utilities
  - Memoization utilities
- [ ] Move browser-specific utilities to `utils-browser/`:
  - DOM utilities
  - Browser detection
  - Storage utilities
  - Window/document utilities
  - Focus management
- [ ] Update imports throughout the codebase

### Phase 3: Move Callbacks
- [ ] Move entire `components/callbacks/` directory to `shared/callbacks/`
- [ ] Update all component imports from `~/shared/components/callbacks/*` to `~/shared/callbacks/*`
- [ ] Verify callbacks only import from `utils-browser` and `utils-iso`

### Phase 4: Clean Up Components
- [ ] Verify components directory only contains `.tsx` component files
- [ ] Ensure components compile with ESNext lib only (no DOM)
- [ ] Update any component imports that reference moved utilities

### Phase 5: Validation
- [ ] Run `tsc --build src/shared` to verify composite project builds
- [ ] Run full test suite
- [ ] Verify all demo pages work
- [ ] Check that import constraints are enforced by TypeScript

## File Classification

### Components (`components/`)
All `.tsx` component files, including:
- Basic components: Alert, Button, Card, Checkbox, etc.
- Complex components: Modal, Dropdown, Select, Tooltip, etc.
- Layout components: SidebarLayout, TopNavLayout, Tabs
- Context providers: FormContext, ModalContext, etc.

### Callbacks (`callbacks/`)
All browser event handlers and DOM manipulation code currently in `components/callbacks/`

### Isomorphic Utilities (`utils-iso/`)
- **Algorithms**: hash, random, normalize-text, priority-queue, lru-cache
- **String/Array**: camel-to-kebab, compact, find-last-index, sort-by, list
- **Async**: deferred, debounce-async, throttle, sync-or-promise
- **Memoization**: All files in `memoize/`
- **Date/Time**: All files in `datetime/`
- **Text**: Text formatting utilities using Intl API
- **Solid helpers**: auto-prop, create-incr-signal, keyed-resource, etc.
- **Other**: circuit-breaker, debug, error-code, iterators, logger, etc.

### Browser Utilities (`utils-browser/`)
- **Browser/OS detection**: browser.ts, os.ts
- **DOM**: document-setup, element-types, event-propagation, focusables, etc.
- **Storage**: storage.ts (localStorage/sessionStorage)
- **Window**: multi-view.ts
- **UI preferences**: All files in `ui-prefs/`
- **Callback attributes**: All files in `callback-attrs/`
- **DOM-dependent Solid utilities**: window-context, mount-root, etc.

### Styles (`styles/`)
All CSS files remain in the shared styles directory, accessible to all sub-projects

## Build Process Updates

1. **TypeScript for Type Checking and Declarations**:
   - Run `tsc --build` to generate declaration files for shared/ modules
   - Type checking enforces import constraints at compile time
   - Only shared/ sub-projects emit declaration files
   - External code uses `noEmit: true` since Vite handles the build

2. **Vite for Actual Building**:
   - Vite handles all bundling and transpilation
   - No TypeScript compilation output except declarations
   - Development server and production builds all use Vite

3. **Update Root tsconfig.json**:
   ```json
   {
     "files": [],
     "references": [
       { "path": "./src" },
       { "path": "./src/shared" }
     ]
   }
   ```

4. **Update Vite Configuration**:
   - Ensure path aliases work with new structure
   - CSS imports from `styles/` directory work correctly
   - Handle imports from demos/tests to shared sub-projects

5. **CI/CD Updates**:
   - Run `tsc --build` for type checking and declaration generation
   - Use `vite build` for actual production builds
   - Ensure all sub-projects pass type checking before build

## Success Criteria

1. ✅ Components and utils-iso compile without DOM types
2. ✅ Import hierarchy is enforced by TypeScript
3. ✅ All existing functionality continues to work
4. ✅ Clear separation between isomorphic and browser-specific code
5. ✅ Build process works with composite project structure
6. ✅ All tests pass
7. ✅ Demo pages continue to work correctly
8. ✅ External code (demos, tests) can import from shared sub-projects
9. ✅ Shared code cannot import from external directories
