# Testing Rules

These rules apply to all test code in the `tests/` directory.

## Framework

- **Vitest** with **jsdom** environment.
- Import test utilities from `vitest`: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`.

## Mocking Conventions

### `window.Alpine`
- Always mock `window.Alpine` before constructing a `Portal`.
- Mock `Alpine.nextTick` as **deferred** (store callbacks, don't execute immediately). The Portal constructor calls `nextTick(() => this.onResize(mediaQuery))` during construction, but `mediaQuery` is `null` until `update()` is called. Executing it immediately causes `Cannot read properties of null` errors.
- Flush `nextTickCallbacks` manually only after the Portal is fully configured (target + screen set, `update()` called).

### `window.matchMedia`
- Mock with `vi.fn()` returning an object with `matches`, `media`, `addEventListener`, and `removeEventListener` — all spied.
- Default `matches` to `false`.
- Use `mockMatchMedia.mock.results` to find specific media query instances for assertions.

### Livewire Listeners
- The Portal constructor registers a `livewire:navigating` listener on `document` unconditionally.
- **Track these listeners** during setup (intercept `document.addEventListener`) and **remove them in `afterEach`** to prevent cross-test leaks.
- If a `livewire:navigating` event fires when `mediaQuery` is `null`, it will throw. This is why cleanup is critical.

## Test Structure

- Use `beforeEach` to set up fresh DOM elements (`parent > el`, `target`) and mocks.
- Use `afterEach` to clean up: clear `document.body`, delete `window.Alpine`, remove livewire listeners, call `vi.restoreAllMocks()`.
- Group related tests in `describe` blocks by feature area (e.g., `update()`, `onResize()`, `Livewire Integration`).

## DOM Setup Pattern

```javascript
const parent = document.createElement('div');
const el = document.createElement('div');
parent.appendChild(el);

const target = document.createElement('div');
target.id = 'target';

document.body.appendChild(parent);
document.body.appendChild(target);
```

This mirrors the real usage: an element inside a parent, with a separate target container elsewhere in the DOM.

## Assertion Patterns

- **Element teleported:** `expect(target.contains(el)).toBe(true)`
- **Element returned:** `expect(parent.contains(el)).toBe(true)`
- **Media query created:** `expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 640px)')`
- **Listener registered:** `expect(mql.addEventListener).toHaveBeenCalledWith('change', portal.onResize)`
- **Listener removed:** `expect(mql.removeEventListener).toHaveBeenCalledWith('change', portal.onResize)`

## Adding New Tests

1. Add tests to the appropriate existing file, or create a new `tests/<feature>.test.js` file.
2. Follow the same setup/teardown pattern with `setupEnvironment()` and `cleanupEnvironment()`.
3. Always defer `Alpine.nextTick` unless specifically testing initial positioning behavior.
4. Run `npm test` to verify all tests pass before committing.
