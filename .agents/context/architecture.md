# Project Context — Architecture & Design

## What is Alpine Portal?

Alpine Portal is an Alpine.js v3 plugin that enables **responsive DOM teleportation** via the `x-portal` directive. It allows elements to be moved between different locations in the DOM based on viewport breakpoints — and to move back when the breakpoint no longer applies.

## Why It Exists

Alpine.js provides `x-teleport` for moving elements to a different DOM location, but it's unconditional. There is no built-in way to conditionally teleport based on screen size, which is a common responsive design need (e.g., moving a sidebar to a modal on mobile). Alpine Portal fills this gap.

## Core Concept: Bidirectional Portal

The key differentiator from `x-teleport`:

```
Viewport ≥ breakpoint → element moves to target container
Viewport < breakpoint → element returns to original parent
```

This is achieved by:
1. Capturing the element's original parent (`elRealParent`) at initialization.
2. Using `window.matchMedia()` with a `change` listener to detect viewport transitions.
3. Moving the element via `appendChild` in either direction based on match state.

## Component Responsibilities

### `Portal.js` — The Engine
- Manages a single portal instance's state.
- Creates and manages `MediaQueryList` objects.
- Handles `change` events for bidirectional DOM movement.
- Cleans up listeners on Livewire navigation events.

### `index.js` — The Registrar
- Connects Portal to Alpine's directive system.
- Parses directive values and modifiers (`x-portal`, `x-portal:screen`, `x-portal:target`).
- Creates Portal instances and stores them on elements.
- Maintains internal `portals` array for tracking.

### `build.js` — The Auto-Loader
- CDN/browser-specific entry point.
- Waits for `alpine:init` event to ensure Alpine is available.
- Calls the plugin registrar with `window.Alpine`.

## Data Flow

```
User HTML: <div x-portal="#target" x-portal:screen="640">
                    │
                    ▼
          index.js: Alpine.directive('portal')
                    │
                    ▼
          Portal.js: new Portal(el)
                    │
                    ├── el._x_portal.target = "#target"
                    ├── el._x_portal.screen = 640
                    │
                    ▼
          Portal.update()
                    │
                    ▼
          window.matchMedia("(min-width: 640px)")
                    │
              ┌─────┴─────┐
              │            │
         matches=true  matches=false
              │            │
              ▼            ▼
      target.appendChild  elRealParent.appendChild
```

## Livewire Integration

When used with Laravel Livewire's `wire:navigate`, the plugin listens to `livewire:navigating` to remove `change` event listeners before page transition. This prevents:
- Memory leaks from orphaned listeners.
- Errors from accessing stale DOM references.
- Duplicate handlers on re-initialization.
