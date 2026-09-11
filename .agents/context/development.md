# Development Workflow

## Prerequisites

- Node.js (with npm)
- A modern browser for testing

## Setup

```bash
npm install
```

## Build Commands

```bash
# Production build (minified, no sourcemap)
npm run build
# Output: dist/alpine-portal.min.js

# Development build with watch mode (unminified, with sourcemap)
npm run watch
# Output: dist/alpine-portal.js + dist/alpine-portal.js.map
```

> **Platform Note:** Build scripts use Windows `cmd` syntax (`set ROLLUP_ENV=production&&`).
> For cross-platform compatibility, consider using `cross-env` package.

## Testing

### Automated Tests

```bash
npm test            # Run all tests once
npm run test:watch  # Run in watch mode (re-run on file changes)
```

Tests use **Vitest** with **jsdom** environment. Test files are in `tests/`:

| File                     | What it tests                          |
|--------------------------|----------------------------------------|
| `tests/Portal.test.js`   | Portal constructor, update, onResize, Livewire cleanup |
| `tests/directive.test.js`| Alpine directive registration and property setting |
| `tests/build.test.js`    | CDN entry point auto-registration      |

### Manual Testing

For visual/browser verification:

1. Run `npm run watch` to build in development mode.
2. Open `examples/index.html` in a browser.
3. Resize the browser window above and below 640px.
4. Verify the text content moves between the magenta (`#div1`) and green (`#div2`) containers.

### Test Scenarios to Verify

| Scenario                          | Expected Behavior                              |
|-----------------------------------|-------------------------------------------------|
| Window width ≥ 640px              | Content teleports to `#div2`                    |
| Window width < 640px              | Content returns to `#div1`                      |
| Rapid resizing across breakpoint  | Content settles in correct container             |
| Page load at wide viewport        | Content starts in `#div2`                        |
| Page load at narrow viewport      | Content stays in `#div1`                         |
| Negative breakpoint (e.g., -640)  | Teleports when viewport ≤ 640px                  |
| Screen value of 0                 | No teleportation occurs                          |

## Releasing

1. Update `version` in `package.json`.
2. Update `@since` tags in JSDoc for any new/changed methods.
3. Run `npm run build` to generate production bundle.
4. Commit `dist/` changes (required for CDN delivery).
5. Tag the release in Git.

## CDN Distribution

The `dist/` directory is committed to Git, enabling direct CDN usage:

```
https://cdn.jsdelivr.net/gh/nabeghe/alpine-portal@<version>/dist/alpine-portal.min.js
```
