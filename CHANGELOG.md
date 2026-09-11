# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-11

### Added
- **Exact DOM Sibling Restoration:** Automatically preserves the element's original position relative to siblings using a comment anchor node (`<!-- x-portal-anchor -->`), fixing ordering issues on revert.
- **Named Breakpoints (Tailwind Compatible):** Support for `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), and `2xl` (1536px), e.g., `x-portal:screen="'md'"` or `x-portal:screen.md`, with negative variants (e.g., `x-portal:screen="'-md'"`).
- **Custom Screen Breakpoints:** Configurable via plugin initialization: `Alpine.plugin(AlpinePortal, { screens: { tablet: 800 } })`.
- **Range & Arbitrary Media Queries:**
  - Range support: `x-portal:screen="'640-1024'"` or `x-portal:screen="[640, 1024]"`.
  - Direct media queries via `x-portal:media="(orientation: landscape)"` or compound queries.
- **Placement Modifiers:**
  - `x-portal.prepend="#target"` (prepends inside target).
  - `x-portal.append="#target"` (appends inside target, default).
  - `x-portal.before="#target"` (inserts before target).
  - `x-portal.after="#target"` (inserts after target).
- **Layout Shift Prevention:**
  - `x-portal.spacer="#target"` or `x-portal.placeholder="#target"` inserts an invisible placeholder spacer to prevent Cumulative Layout Shift (CLS).
- **Multi-Target Routing:**
  - Teleport across multiple target containers based on breakpoints using object syntax:
    `x-portal="{ '-640': '#mobile', '641-1024': '#tablet', '1025': '#desktop' }"`.
- **State-Driven Teleportation:**
  - `x-portal:when="condition"` conditionally controls teleportation in tandem with media queries or standalone.
- **Custom Lifecycle Events:**
  - `portal:teleport` dispatched when element is moved to target (detail: `{ target, targetElement, placement, portal }`).
  - `portal:revert` dispatched when element returns to original position (detail: `{ originalParent, portal }`).
- **Official Alpine v3 Teardown Integration:**
  - Automatically cleans up listeners and restored nodes via Alpine v3's `cleanup()` hook and `destroy()` method.

### Changed
- Promoted to stable 1.0.0 release.
- 100% backward-compatible with all `0.x` syntax and behaviors.

---

## [0.2.4]

### Fixed
- Fixed memory leak and re-run on Laravel Livewire `wire:navigate` by listening to `livewire:navigating`.

---

## [0.2.0]

### Changed
- Switched from `window.onresize` to `window.matchMedia` for native CSS engine performance.
- Removed `x-portal:is` in favor of `x-portal:screen="0"`.

---

## [0.1.0]

### Added
- Initial release with `x-portal` and `x-portal:screen` responsive DOM teleportation.
