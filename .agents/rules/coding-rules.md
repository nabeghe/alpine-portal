# Coding Rules

These rules apply to all code contributions in this project.

## Language & Runtime

- Write vanilla JavaScript (ES6+). No TypeScript.
- No runtime dependencies allowed. The plugin must remain zero-dependency.
- Alpine.js v3 is the only assumed runtime and is accessed via `window.Alpine`.

## Alpine.js Plugin Conventions

- Register all directives through `Alpine.directive()` API.
- Store per-element plugin state on the DOM element using the `_x_` prefix (e.g., `el._x_portal`).
- For CDN entry points, use `document.addEventListener('alpine:init', ...)` to auto-register.
- For NPM entry points, export a function that accepts `Alpine` and calls `Alpine.directive(...)`.

## Code Style

- Use constructor functions (not ES6 classes) for core logic.
- Use `const` for values that don't change, `let` for values that do. Avoid `var`.
- Add JSDoc comments with `@since` version tags to all public methods and properties.
- Keep functions focused and small. Each function should do one thing well.

## Performance

- Prefer `window.matchMedia` with `change` event listeners over `window.onresize`.
- Always clean up event listeners when they're no longer needed (prevent memory leaks).
- Support Livewire SPA navigation by listening to `livewire:navigating` for cleanup.

## DOM Manipulation

- Always capture `el.parentElement` as `elRealParent` before any teleportation to ensure elements can return.
- Use `appendChild` for moving elements (not `innerHTML` or `cloneNode`).
- Use `Alpine.nextTick()` for initial DOM positioning to ensure Alpine has finished rendering.

## Build & Distribution

- All builds must output UMD format.
- The `dist/` directory must be committed to Git (required for CDN delivery via jsDelivr).
- Production builds must be minified with terser.
- Development builds must include source maps.

## File Organization

- `src/Portal.js` — Core engine only. No Alpine-specific registration code.
- `src/index.js` — NPM/ESM entry point. Handles directive registration.
- `src/build.js` — CDN/browser entry point. Handles auto-registration via `alpine:init`.
- New features should follow this separation of concerns.

## Breakpoint Values

- Positive integers → `(min-width: Npx)` media query.
- Negative integers → `(max-width: Npx)` media query.
- Zero → disable teleportation entirely.
- Support dynamic expressions evaluated via Alpine's `evaluate()`.
