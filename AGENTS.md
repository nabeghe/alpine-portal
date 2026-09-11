# AGENTS.md — Alpine Portal

> This file provides context for AI coding assistants working on this project.

## Project Overview

**alpine-portal** is an Alpine.js v3 plugin that introduces the `x-portal` directive for **screen-size-responsive DOM teleportation**. Unlike Alpine's built-in `x-teleport` which moves elements unconditionally, `x-portal` moves elements to a target selector based on media query breakpoints — and automatically returns them when the condition is no longer met (bidirectional behavior).

- **Author:** Hadi Akbarzadeh
- **Version:** 1.0.0
- **License:** MIT
- **Runtime Dependencies:** None (pure vanilla JS, requires Alpine.js v3 on `window.Alpine`)

## Architecture

```
src/
├── Portal.js    # Core engine — Portal constructor managing state, DOM anchors, media queries, placements, routing
├── index.js     # NPM/ES module entry — registers Alpine directive `portal`, parses modifiers, Alpine cleanup hook
└── build.js     # CDN/browser entry — listens to `alpine:init` and auto-registers plugin on window.AlpinePortal
```

### Entry Points

| Entry        | File           | Purpose                                               |
|--------------|----------------|-------------------------------------------------------|
| CDN/Browser  | `src/build.js` | Auto-registers plugin via `alpine:init` event          |
| NPM/ESM      | `src/index.js` | Exports plugin function for `Alpine.plugin()` usage    |

### Core Flow

1. `index.js` registers the `portal` directive via `Alpine.directive('portal', ...)`.
2. When `x-portal` is used on an element, a `Portal` instance is created and stored on `el._x_portal`.
3. A DOM comment marker (`<!-- x-portal-anchor -->`) is positioned before the element to remember its exact sibling position.
4. Directive modifiers (`.prepend`, `.append`, `.before`, `.after`, `.spacer`, `x-portal:screen.md`) configure placement and behaviors.
5. `Portal.update()` or `Portal.setRoutes()` creates `window.matchMedia(...)` listeners for responsive evaluation.
6. On media query match/unmatch, elements move to target or revert to their exact original anchor position, dispatching `portal:teleport` or `portal:revert` events.
7. Official Alpine v3 `cleanup(() => el._x_portal?.destroy())` handles complete listener and DOM teardown.

### Breakpoint Syntax

| Value    | Media Query Generated     | Behavior                              |
|----------|---------------------------|---------------------------------------|
| `640`    | `(min-width: 640px)`       | Teleport when viewport ≥ 640px        |
| `-640`   | `(max-width: 640px)`       | Teleport when viewport ≤ 640px        |
| `'md'`   | `(min-width: 768px)`       | Tailwind named breakpoint (min-width)  |
| `'-md'`  | `(max-width: 768px)`       | Tailwind named breakpoint (max-width)  |
| `'640-1024'` | `(min-width: 640px) and (max-width: 1024px)` | Range query |
| `0`      | —                          | Disable teleportation                 |

## Build System

- **Bundler:** Rollup (UMD format, global name `AlpinePortal`)
- **Transpilation:** Babel with `@babel/preset-env`
- **Minification:** `@rollup/plugin-terser` (production only)

### Commands

```bash
npm run build   # Production build → dist/alpine-portal.min.js
npm run watch   # Development build with watch → dist/alpine-portal.js + sourcemap
```

> **Note:** Build scripts use Windows `cmd` syntax (`set ROLLUP_ENV=production&&`).

### Output Files

| File                        | Purpose                    |
|-----------------------------|----------------------------|
| `dist/alpine-portal.min.js` | Production minified bundle |
| `dist/alpine-portal.js`     | Development unminified UMD |
| `dist/alpine-portal.js.map` | Source map (dev)           |

The `dist/` directory is tracked in Git intentionally — it enables direct CDN loading via jsDelivr's GitHub integration.

## Coding Conventions

### Style & Patterns

- **Alpine.js Plugin Architecture:** Follow Alpine v3's `Alpine.directive()` API for registering directives.
- **DOM-Bound State (`el._x_portal`):** Plugin state is stored directly on the DOM element using the `_x_` prefix convention (consistent with Alpine internals).
- **Exact Sibling Anchoring:** Use comment nodes (`<!-- x-portal-anchor -->`) rather than `appendChild` on revert to guarantee sibling order is preserved.
- **Constructor Functions:** Core logic uses traditional JS constructor functions (not ES6 classes).
- **Performance:** Use `window.matchMedia` with `change` event listeners instead of `window.onresize` — delegates breakpoint evaluation to the browser's native CSS engine.
- **JSDoc with `@since`:** All methods and properties should include JSDoc annotations with `@since` version tags tracing when they were introduced.

### Framework Interop

- **Livewire Support:** The plugin listens to `livewire:navigating` to clean up event listeners during SPA page transitions, preventing memory leaks.
- **Alpine v3 Teardown:** Connects to Alpine's directive `cleanup` hook for proper unmounting and garbage collection.

### Git & Distribution

- `dist/` is **not** in `.gitignore` (required for CDN distribution).
- `.idea/`, `node_modules/`, `yarn-error.log` are ignored.

## Testing

- **Framework:** Vitest + jsdom
- **Run Tests:** `npm test` (single run) or `npm run test:watch` (watch mode)
- **Manual Testing:** Open `examples/index.html` in a browser and resize the window to verify element teleportation.

### Test Files

| File                    | Tests | Coverage                                                    |
|-------------------------|-------|-------------------------------------------------------------|
| `tests/Portal.test.js`  | 24    | Construction, `update()`, sibling order preservation, breakpoints, ranges, placements, spacer, events, multi-target, destroy, Livewire |
| `tests/directive.test.js`| 17   | Directive registration, Portal creation, property setting, expression evaluation, modifiers, named screens, media, when, routes, cleanup hook |
| `tests/build.test.js`   | 2     | `alpine:init` listener, UMD bundle initialization           |

## Key Design Decisions

1. **Zero runtime dependencies** — The plugin is self-contained vanilla JS.
2. **Order-preserving bidirectional teleportation** — Elements return to their exact original sibling slot via comment anchor nodes.
3. **Multi-Target Responsive Routing** — Elements can dynamically jump between multiple container targets based on media query maps.
4. **Layout Shift Prevention** — Optional `.spacer` prevents Cumulative Layout Shift (CLS).
5. **Expression evaluation & Named Breakpoints** — Supports numeric breakpoints, Tailwind aliases (`sm`/`md`/`lg`), range queries, dynamic Alpine expressions, and arbitrary CSS media queries.
6. **UMD output format** — Ensures compatibility with both `<script>` tag usage and module bundlers.
