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
- 🔄 **Bidirectional** — elements automatically return to their original parent when the condition is no longer met.
- ⚡ **Performant** — uses `window.matchMedia` with native CSS engine evaluation instead of `resize` event listeners.
- 🪶 **Lightweight** — zero runtime dependencies, under 1KB gzipped.

> Think of it as a two-way portal between two screen sizes, moving elements back and forth as the viewport changes. 🚀

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document, **before** Alpine:

```html
<script src="https://cdn.jsdelivr.net/gh/nabeghe/alpine-portal@v0.2.4/dist/alpine-portal.min.js" defer></script>
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

Alpine.plugin(Portal);

window.Alpine = Alpine;
window.Alpine.start();
```

## Usage

Add `x-portal` to any element to enable responsive teleportation:

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

**Result:** When viewport width ≥ 640px, the inner `<div>` moves to `#target`. When the viewport shrinks below 640px, it returns to its original parent.

### Directive Options

| Directive | Description |
|-----------|-------------|
| `x-portal="#selector"` | Target selector — where the element teleports to |
| `x-portal:screen="640"` | Breakpoint in pixels (supports dynamic expressions) |
| `x-portal:target="expr"` | Alternative: set target via an Alpine expression |

### Breakpoint Syntax

| Value | Media Query | Behavior |
|-------|-------------|----------|
| `640` | `(min-width: 640px)` | Teleport when viewport **≥ 640px** |
| `-640` | `(max-width: 640px)` | Teleport when viewport **≤ 640px** |
| `0` | — | Disable teleportation |

### Dynamic Expressions

`x-portal:screen` supports Alpine expressions, not just static values:

```html
<div x-data="{ bp: 1024 }">
    <div x-portal="#target" x-portal:screen="bp">
        Breakpoint is controlled by a reactive variable!
    </div>
</div>
```

## Examples

The `examples/` directory includes several real-world demos you can open in your browser:

| Example | Description | Breakpoint |
|---------|-------------|-----------|
| [Basic](examples/basic.html) | Simple teleportation between two containers | 640px |
| [Responsive Nav](examples/responsive-nav.html) | Nav links move from mobile hamburger drawer to desktop header | 768px |
| [Blog Layout](examples/blog-layout.html) | Sidebar widgets teleport from below article to right sidebar | 900px |
| [Product Page](examples/product-page.html) | Purchase CTA teleports from below image to sticky sidebar | 900px |
| [Dashboard](examples/dashboard.html) | Stats cards teleport from inline to sidebar summary panel | 1000px |

> Open `examples/index.html` for a hub page linking to all demos.

## Testing

The project includes a comprehensive test suite using [Vitest](https://vitest.dev/) with jsdom:

```bash
npm test            # Run all tests once
npm run test:watch  # Run in watch mode
```

| Test File | Tests | Coverage |
|-----------|-------|---------|
| `tests/Portal.test.js` | 16 | Construction, `update()`, `onResize()`, Livewire cleanup, initial positioning |
| `tests/directive.test.js` | 9 | Directive registration, Portal creation, property setting, expression evaluation |
| `tests/build.test.js` | 2 | `alpine:init` listener, plugin initialization |

## Livewire Support

Alpine Portal is compatible with [Laravel Livewire](https://livewire.laravel.com/)'s `wire:navigate`. The plugin automatically cleans up `matchMedia` event listeners during SPA page transitions to prevent memory leaks.

## Changelog

- **v0.2.4**
    - Fix for Livewire `wire:navigate` [#2](https://github.com/nabeghe/alpine-portal/issues/2)
- **v0.2.0**
    - Switched from `window.onresize` to `window.matchMedia` for better performance. Thanks to [ekvoka](https://github.com/nabeghe/alpine-portal/issues/1)
    - Removed `x-portal:is` — use `x-portal:screen="0"` to disable teleportation instead
- **v0.1.0**
    - Initial release

## 📜 License

Created with ❤️ by [Nabeghe](https://github.com/nabeghe). Licensed under the [MIT License](LICENSE.md).
