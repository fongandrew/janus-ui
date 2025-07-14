# Janus UI

This repo is a component library + scaffold / starter template with demo pages for personal projects built with SolidJS. It aims to provide some basic utilities and a set of UI components that supports two usage patterns:

* Reactive SPA - How SolidJS was originally meant to be used. A large-ish chunk of JavaScript is dropped onto a blank HTML page and renders a bunch of UI.
* SSR with progressive enhancement - The traditional approach to web apps. HTML is (perhaps dynamically) generated on the server. A static-ish chunk of JS is loaded to provide added functionality but many webapps / websites retain a large amount of functionality even with JS disabled by relying on form-based interactivity.

In addition, Janus UI is built with the following principles in mind:

* Accessible:
    * UI components should be accessible to users of screen readers and other assistive technologies.
    * Text should have high color contrast.
    * Users should be able to apply preferences like reduced motion or dark mode on a per-app basis.
* Modern: As much as possible, rely on newer native HTML functionality (like dialogs and popovers) in lieu of JavaScript.
* Simple: Minimize dependencies to keep bundle size down and keep things maintainable.

## Preview

The build for this generates a set of demo pages available at https://fongandrew.github.io/janus-ui/

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

Visit http://localhost:3000 to view the component demos in your browser.

## SSR and hydration

The SSR model here is _not_ the hydration-based SSR used in "meta frameworks" like Solid Start, Vue's Nux.js, or React's Next.js. In those frameworks, the server pre-renders HTML for what is essentially an SPA, but the client-side JavaScript takes over entirely, rehydrating the app into a fully interactive SPA. This allows writing an app as if it were an SPA while still serving up contentful HTML for search engines. *But* interactivity remains tightly coupled to the framework. While time to first paint may be faster, SSR ultimately involves shipping *more* code to clients than a plain SPA approach -- that is, you ship both fully rendered HTML *and* the entirety of your framework and SPA.

In contrast, Janus UI permits a more "traditional" SSR approach. It uses Solid solely to render components (and because we're mostly using it just for rendering on the server, it shouldn't be difficult to swap Solid out for another rendering library like Preact or whatever the new hotness is if it comes to it). Interactivity is added via script(s) that run after the HTML is rendered and adds things like delegated event handlers. This approach allows for progressive enhancement and for most use cases, results in less code being shipped to end users (certainly less JavaScript).

Janus UI works best if you decide up front whether you're building something that requires a full reactive framework (e.g. something that is more of an "app" with reasonably long sessions) or just HTML + scripts (e.g. something that looks more like a "plain website"). While Janus UI components can be used in both contexts, if you use these components reactively, they can't be automatically switched to the lighter script-based approach without a fair bit of work.

### How it works

UI components are just SolidJS components. Any interactivity meant to work in both SPA and SSR modes needs to be split out into separate callback modules. These callback functions do two things:

1. On the server, they just generate a `data-` attribute that we stick on the rendered element.
2. On the client, we register things like delegated event handlers that look for these `data-` attributes and do whatever it is we want them to do. When bundled for SPA mode, Vite / Rollup's tree shaking generally includes everything we need. But in SSR mode, these handlers must be explicitly included in index files.

To keep delegated event handlers that directly manipulate the DOM from conflicting with Solid, we generally follow these guidelines:

* Callback scripts should, as much as possible, stick with manipulating `aria-` and `data-` attributes (and when working with SolidJS components, we need to be wary about reactively updating these attributes).
* Keep rendering in Solid as much as possible. Callback scripts generally shouldn't be doing much templating. If we find ourselves needing to do a lot of dynamic rendering in client code, that's a good sign we may just want an SPA. For simpler cases, we often rely on Solid SSR code rendering different permutations of a component and then using client-side JS to just hide and show things as needed.
* In cases where we *do* want Solid to reactively update `aria-` or `data-` attributes (or have non-Solid callbacks do rendering), we need to ensure that both reactive framework and non-framework code render to the same thing.

## Styling and naming conventions

We rely on plain CSS. There's no CSS-in-JS or CSS modules or anything like that at the moment. CSS classes are just imported into a giant index file and pruned with PurgeCSS during build.

Things that require unique-ish names (like CSS classes and data attributes for handlers) follow a BEM-like organization scheme (`component__sub-component--modifier`) with special prefixes in front of each name:

* `t-` - e.g. `.t-spin`, a "tool" or utility class
* `o-` - e.g. `.o-box`, an "object" class for very simple, non-stylistic layout or structural components
* `c-` - e.g. `.c-alert`, CSS class for more complex shared UI components
* `p-` - e.g. `.p-chat-box`, something specific to the current project

Handler attributes are also prefixed with `$`, so something like `$c-tooltip__mouseout` indicates a delegated event handler for the `mouseout` event.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint and StyleLint
- `npm run eslint:fix` - Fix ESLint issues
- `npm run stylelint:fix` - Fix StyleLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Directory Structure

* `plugins` - Custom Vite plugins for SSR, PurgeCSS, etc.
* `src/lib` - Shared UI components + utils. The "shared" here reflects things I want to (eventually) reuse with other projects. When using this as a template, stick project-specific code in some directory other than `shared`.
* `src/lib/components` - Basic SolidJS UI components
* `src/lib/components/callbacks` - Interactivity code meant to work in both SPA and SSR modes.
* `src/lib/styles` - CSS and styling helpers
* `src/lib/utility` - A bunch of more-or-less standalone helper JavaScript.
* `src/demos` - Example implementations of all components
