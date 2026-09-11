# Source Files Reference

## File Map

### `src/Portal.js`
**Role:** Core engine — the Portal constructor.

**Key exports:** `Portal` (constructor function)

**Internal state:**
- `this.target` — CSS selector for destination element
- `this.screen` — Breakpoint value (positive: min-width, negative: max-width, 0: disabled)
- `elRealParent` (closure) — Original parent element reference for return trips
- `mediaQuery` (closure) — Active `MediaQueryList` instance

**Key methods:**
- `this.update()` — Reconfigures media query listener based on current `screen` value
- `this.onResize(e)` — Handles media query `change` events; moves element to target or back

**Event listeners:**
- `mediaQuery.addEventListener('change', this.onResize)` — Viewport change detection
- `document.addEventListener('livewire:navigating', ...)` — Cleanup for Livewire SPA

---

### `src/index.js`
**Role:** Alpine.js plugin entry point for NPM/ESM usage.

**Key exports:** Default function accepting `Alpine` parameter.

**Directive registration:** `Alpine.directive('portal', callback)`

**Directive modifiers handled:**
- `x-portal="<selector>"` — Sets target (no modifier value)
- `x-portal:screen="<breakpoint>"` — Sets breakpoint, supports dynamic expressions
- `x-portal:target="<expression>"` — Alternative way to set target via expression

**Internal tracking:** `portals` array holding all Portal instances.

---

### `src/build.js`
**Role:** CDN/browser auto-registration entry point.

**Behavior:** Listens to `alpine:init` DOM event, then calls the plugin function from `index.js` with `window.Alpine`.

---

### `rollup.config.js`
**Role:** Build configuration.

**Key details:**
- Input: `src/build.js`
- Output format: UMD (global name: `AlpinePortal`)
- Environment-driven: `ROLLUP_ENV` env var controls dev vs. production mode
- Production: minified, no sourcemap → `dist/alpine-portal.min.js`
- Development: unminified, sourcemap → `dist/alpine-portal.js`

---

### `examples/index.html`
**Role:** Manual test page.

**Setup:** Two colored divs (`#div1` magenta, `#div2` green) with an `x-portal` element inside `#div1` targeting `#div2` at 640px breakpoint.
