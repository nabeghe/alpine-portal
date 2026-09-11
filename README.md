# Alpine Portal

<p align="center">
    <img src="https://github.com/user-attachments/assets/08dfdc8f-a529-4ffe-a486-eba6d21f22a7" width="400"/>
</p>

<p align="center">
    Screen-size-responsive DOM teleportation for <a href="https://alpinejs.dev">Alpine.js</a>
</p>

<p align="center">
    <img src="https://img.shields.io/github/v/tag/nabeghe/alpine-portal?label=version&style=for-the-badge" alt="Version">
    <img src="https://img.badgesize.io/nabeghe/alpine-portal/master/dist/alpine-portal.min.js.svg?compression=gzip&style=for-the-badge&color=green" alt="Size">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License">
</p>

## About

**Alpine Portal** adds the `x-portal` directive to Alpine.js — a **bidirectional, screen-size-aware teleportation** directive.

Unlike Alpine's built-in `x-teleport` which moves elements unconditionally, `x-portal`:

- 📐 **Teleports based on breakpoints** — move elements to a target container only when a media query matches.
- 🔄 **Bidirectional & Order-Preserving** — elements automatically return to their exact original sibling position via DOM anchors.
- 🎯 **Multi-Target Routing** — route elements to different targets across multiple responsive breakpoints.
- 🧩 **Placement Modifiers** — control target insertion (`.prepend`, `.append`, `.before`, `.after`).
- 🛡️ **Prevents Layout Shift** — optional `.spacer` keeps space in the original layout to eliminate Cumulative Layout Shift (CLS).
- ⚡ **Performant** — uses `window.matchMedia` with native CSS engine evaluation instead of resize listeners.
- 🪶 **Lightweight** — zero runtime dependencies, under 2KB gzipped.

> Think of it as a two-way portal between screen sizes, moving elements back and forth as the viewport changes. 🚀

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before** Alpine:

```html
<script src="https://cdn.jsdelivr.net/gh/nabeghe/alpine-portal@v1.0.0/dist/alpine-portal.min.js" defer></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### NPM

```bash
npm install alpine-portal
```

Register the plugin **before** starting Alpine:

```js
import Alpine from 'alpinejs';
import Portal from 'alpine-portal';

// Basic registration
Alpine.plugin(Portal);

// Or with custom screen breakpoints
Alpine.plugin(Portal, {
    screens: {
        tablet: 800,
        desktop: 1200,
    }
});

window.Alpine = Alpine;
window.Alpine.start();
```

## Usage

### 1. Basic Teleportation

Add `x-portal` to any element:

```html
<div x-data id="source" style="background: #E91E63; padding: 1rem;">
    <h2>Source Container</h2>
    <div x-portal="#target" x-portal:screen="640">
        I teleport to #target when viewport ≥ 640px!
    </div>
</div>

<div x-data id="target" style="background: #8BC34A; padding: 1rem;">
    <h2>Target Container</h2>
    <!-- Portal content appears here on wide screens -->
</div>
```

**Result:** When viewport width ≥ 640px, the inner `<div>` moves to `#target`. When viewport shrinks below 640px, it returns to its exact original place among its siblings.

---

### 2. Named Breakpoints (Tailwind Compatible)

Use standard named breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`):

```html
<!-- Min-width breakpoint: viewport ≥ 768px -->
<div x-portal="#target" x-portal:screen="'md'">...</div>
<!-- Or using modifier syntax -->
<div x-portal="#target" x-portal:screen.md>...</div>

<!-- Max-width breakpoint: viewport ≤ 768px -->
<div x-portal="#drawer" x-portal:screen="'-md'">...</div>
```

#### Breakpoint Presets:

| Name | Min-Width | Max-Width (`-name`) |
|------|-----------|----------------------|
| `sm` | `640px` | `≤ 640px` |
| `md` | `768px` | `≤ 768px` |
| `lg` | `1024px` | `≤ 1024px` |
| `xl` | `1280px` | `≤ 1280px` |
| `2xl` | `1536px` | `≤ 1536px` |

---

### 3. Range & Arbitrary Media Queries

Teleport elements within a specific screen range or custom CSS media query:

```html
<!-- Range syntax: between 640px and 1024px -->
<div x-portal="#tablet-menu" x-portal:screen="'640-1024'">...</div>
<div x-portal="#tablet-menu" x-portal:screen="[640, 1024]">...</div>

<!-- Arbitrary CSS media queries -->
<div x-portal="#landscape-banner" x-portal:media="(orientation: landscape)">...</div>
<div x-portal="#touch-controls" x-portal:media="(pointer: coarse)">...</div>
```

---

### 4. Placement Modifiers

Control where the element lands inside or relative to the destination:

```html
<!-- Prepend inside target (first child) -->
<div x-portal.prepend="#target" x-portal:screen="640">...</div>

<!-- Append inside target (default, last child) -->
<div x-portal.append="#target" x-portal:screen="640">...</div>

<!-- Insert immediately before target element -->
<div x-portal.before="#sibling" x-portal:screen="640">...</div>

<!-- Insert immediately after target element -->
<div x-portal.after="#sibling" x-portal:screen="640">...</div>
```

---

### 5. Multi-Target Responsive Routing

Move an element to different destinations across different screen sizes:

```html
<div x-portal="{
    '-640': '#mobile-drawer',
    '641-1024': '#tablet-header',
    '1025': '#desktop-sidebar'
}">
    Responsive navigation that travels across 3 different containers!
</div>
```

---

### 6. Preventing Layout Shift (`.spacer`)

Leave an invisible placeholder in the element's original position while it is teleported away to eliminate Cumulative Layout Shift (CLS):

```html
<div x-portal.spacer="#target" x-portal:screen="768">
    I leave an invisible spacer behind so page content doesn't jump!
</div>
```

---

### 7. Conditional Teleportation (`x-portal:when`)

Combine media queries with dynamic Alpine state variables:

```html
<div x-data="{ isSearchOpen: false }">
    <button @click="isSearchOpen = !isSearchOpen">Toggle</button>

    <!-- Only teleports if on mobile AND search is open -->
    <div x-portal="#overlay" x-portal:screen="-768" x-portal:when="isSearchOpen">
        Search bar content
    </div>
</div>
```

---

### 8. Custom Lifecycle Events

Alpine Portal dispatches custom DOM events when elements teleport or revert:

```html
<div x-portal="#target" 
     x-portal:screen="640"
     @portal:teleport="console.log('Moved to', $event.detail.target)"
     @portal:revert="console.log('Returned to original parent')">
    ...
</div>
```

#### Event Details:
- **`portal:teleport`**: `{ target, targetElement, placement, portal }`
- **`portal:revert`**: `{ originalParent, portal }`

---

## Directive Reference

| Directive / Modifier | Description |
|----------------------|-------------|
| `x-portal="#selector"` | Target selector — where the element teleports to |
| `x-portal="{ routes }"` | Multi-target routing dictionary |
| `x-portal.prepend` | Prepends inside destination container |
| `x-portal.append` | Appends inside destination container (default) |
| `x-portal.before` | Inserts immediately before target element |
| `x-portal.after` | Inserts immediately after target element |
| `x-portal.spacer` | Inserts invisible layout spacer when teleported |
| `x-portal:screen="val"` | Breakpoint (number, `'md'`, `'-md'`, `'640-1024'`, or expression) |
| `x-portal:screen.md` | Named breakpoint modifier shortcut |
| `x-portal:media="query"` | Arbitrary media query string |
| `x-portal:when="expr"` | Conditional boolean expression |

---

## Examples

The `examples/` directory includes several interactive demos you can open in your browser:

| Example | Description | Features |
|---------|-------------|----------|
| [Basic](examples/basic.html) | Simple teleportation between two containers | 640px, events |
| [Multi-Target Routing](examples/multi-target.html) | Route an element dynamically across 3 containers | `x-portal="{ routes }"` |
| [Advanced v1.0.0](examples/advanced.html) | Sibling order preservation, `.prepend`, `.spacer`, `when` | Modifiers, CLS, state |
| [Responsive Nav](examples/responsive-nav.html) | Nav links move from mobile drawer to desktop header | 768px (`md`) |
| [Blog Layout](examples/blog-layout.html) | Sidebar widgets teleport from below article to right sidebar | 900px |
| [Product Page](examples/product-page.html) | Purchase CTA teleports from below image to sticky sidebar | 900px |
| [Dashboard](examples/dashboard.html) | Stats cards reorganize from inline cards to sidebar summary | 1000px |

> Open `examples/index.html` for a hub page linking to all demos.

---

## Testing

The project includes a comprehensive test suite using [Vitest](https://vitest.dev/) with jsdom:

```bash
npm test            # Run all tests once
npm run test:watch  # Run in watch mode
```

| Test File | Tests | Coverage |
|-----------|-------|---------|
| `tests/Portal.test.js` | 24 | Sibling order preservation, breakpoints, ranges, placements, spacer, events, multi-target, destroy, Livewire |
| `tests/directive.test.js` | 17 | Directive registration, modifiers, named screen, media, when, routes, cleanup hook |
| `tests/build.test.js` | 2 | `alpine:init` listener, UMD bundle initialization |

---

## Livewire Support

Alpine Portal is fully compatible with [Laravel Livewire](https://livewire.laravel.com/)'s `wire:navigate`. The plugin automatically cleans up `matchMedia` event listeners during SPA page transitions to prevent memory leaks.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

- **v1.0.0** — Stable Release: DOM position preservation via comment anchors, named breakpoints (`sm`/`md`/`lg`), placement modifiers (`.prepend`/`.before`/`.after`), multi-target routing, `.spacer` CLS prevention, `portal:teleport`/`portal:revert` events, `x-portal:when`, and Alpine v3 `cleanup()` hook.
- **v0.2.4** — Laravel Livewire `wire:navigate` fix.
- **v0.2.0** — Switched to `window.matchMedia`.
- **v0.1.0** — Initial release.

---

## 📜 License

Created with ❤️ by [Nabeghe](https://github.com/nabeghe). Licensed under the [MIT License](LICENSE.md).
