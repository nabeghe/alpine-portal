# AGENTS.md — Alpine Portal

> This file provides context for AI coding assistants working on this project.

## Project Overview

**alpine-portal** is an Alpine.js v3 plugin that introduces the `x-portal` directive for **screen-size-responsive DOM teleportation**. Unlike Alpine's built-in `x-teleport` which moves elements unconditionally, `x-portal` moves elements to a target selector based on media query breakpoints — and automatically returns them when the condition is no longer met (bidirectional behavior).

- **Author:** Hadi Akbarzadeh
- **Version:** 0.2.4
- **License:** MIT
- **Runtime Dependencies:** None (pure vanilla JS, requires Alpine.js v3 on `window.Alpine`)

## Architecture

```
src/
├── Portal.js    # Core engine — Portal constructor managing state, media queries, and DOM movement
├── index.js     # NPM/ES module entry — registers Alpine directive `portal`
└── build.js     # CDN/browser entry — listens to `alpine:init` and auto-registers plugin
```

### Entry Points

| Entry        | File           | Purpose                                               |
|--------------|----------------|-------------------------------------------------------|
| CDN/Browser  | `src/build.js` | Auto-registers plugin via `alpine:init` event          |
| NPM/ESM      | `src/index.js` | Exports plugin function for `Alpine.plugin()` usage    |

### Core Flow

1. `index.js` registers the `portal` directive via `Alpine.directive('portal', ...)`.
2. When `x-portal` is used on an element, a `Portal` instance is created and stored on `el._x_portal`.
3. Directive modifiers (`x-portal:screen`, `x-portal:target`) configure the Portal instance.
4. `Portal.update()` creates a `window.matchMedia(...)` listener based on the breakpoint value.
5. On media query match/unmatch, elements are moved to/from the target container.

### Breakpoint Syntax

| Value    | Media Query Generated     | Behavior                              |
|----------|---------------------------|---------------------------------------|
| `640`    | `(min-width: 640px)`       | Teleport when viewport ≥ 640px        |
| `-640`   | `(max-width: 640px)`       | Teleport when viewport ≤ 640px        |
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
- **Constructor Functions:** Core logic uses traditional JS constructor functions (not ES6 classes).
- **Performance:** Use `window.matchMedia` with `change` event listeners instead of `window.onresize` — delegates breakpoint evaluation to the browser's native CSS engine.
- **JSDoc with `@since`:** All methods and properties should include JSDoc annotations with `@since` version tags tracing when they were introduced.

### Framework Interop

- **Livewire Support:** The plugin listens to `livewire:navigating` to clean up event listeners during SPA page transitions, preventing memory leaks.

### Git & Distribution

- `dist/` is **not** in `.gitignore` (required for CDN distribution).
- `.idea/`, `node_modules/`, `yarn-error.log` are ignored.

## Testing

- **Framework:** Vitest + jsdom
- **Run Tests:** `npm test` (single run) or `npm run test:watch` (watch mode)
- **Manual Testing:** Open `examples/index.html` in a browser and resize the window above/below 640px to verify element teleportation.

### Test Files

| File                    | Tests | Coverage                                                    |
|-------------------------|-------|-------------------------------------------------------------|
| `tests/Portal.test.js`  | 16    | Construction, `update()`, `onResize()`, Livewire, initial positioning |
| `tests/directive.test.js`| 9    | Directive registration, Portal creation, property setting, expression evaluation |
| `tests/build.test.js`   | 2     | `alpine:init` listener, plugin initialization               |

### Testing Conventions

- Mock `window.Alpine.nextTick` as **deferred** (not immediate) to avoid `onResize(null)` during Portal construction.
- Track and clean up `livewire:navigating` listeners in `afterEach` to prevent cross-test leaks.
- Mock `window.matchMedia` with spied `addEventListener`/`removeEventListener` for verifying listener management.

## Key Design Decisions

1. **Zero runtime dependencies** — The plugin is self-contained vanilla JS.
2. **Bidirectional teleportation** — Elements return to their original parent when the breakpoint condition is no longer met (tracked via `elRealParent`).
3. **Expression evaluation** — `x-portal:screen` supports dynamic Alpine expressions (not just static values).
4. **UMD output format** — Ensures compatibility with both `<script>` tag usage and module bundlers.
