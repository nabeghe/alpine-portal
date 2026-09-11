import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Portal from '../src/Portal.js';

/**
 * Helper: creates a mock matchMedia that can be triggered manually.
 */
function createMockMatchMedia() {
    const listeners = new Map();

    const mockMatchMedia = vi.fn((query) => {
        const mql = {
            matches: false,
            media: query,
            addEventListener: vi.fn((event, handler) => {
                if (!listeners.has(query)) {
                    listeners.set(query, []);
                }
                listeners.get(query).push(handler);
            }),
            removeEventListener: vi.fn((event, handler) => {
                if (listeners.has(query)) {
                    const handlers = listeners.get(query);
                    const idx = handlers.indexOf(handler);
                    if (idx !== -1) handlers.splice(idx, 1);
                }
            }),
        };
        return mql;
    });

    mockMatchMedia._listeners = listeners;
    return mockMatchMedia;
}

/**
 * Helper: sets up the DOM and Alpine mock needed for Portal construction.
 * nextTick is deferred by default to avoid the initial onResize(null) crash.
 *
 * Also intercepts document.addEventListener to track livewire:navigating
 * listeners for cleanup between tests.
 */
function setupEnvironment() {
    // Create DOM structure: parent > el, target container
    const parent = document.createElement('div');
    parent.id = 'parent';
    const el = document.createElement('div');
    el.id = 'portal-el';
    el.textContent = 'portal content';
    parent.appendChild(el);

    const target = document.createElement('div');
    target.id = 'target';

    document.body.appendChild(parent);
    document.body.appendChild(target);

    // Store nextTick callbacks for manual flushing
    const nextTickCallbacks = [];

    // Mock Alpine.nextTick — defers by default
    window.Alpine = {
        nextTick: vi.fn((cb) => {
            nextTickCallbacks.push(cb);
        }),
    };

    // Mock matchMedia
    const mockMatchMedia = createMockMatchMedia();
    window.matchMedia = mockMatchMedia;

    // Track livewire:navigating listeners for cleanup
    const livewireListeners = [];
    const originalAddEventListener = document.addEventListener.bind(document);
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation((event, handler, ...args) => {
        if (event === 'livewire:navigating') {
            livewireListeners.push(handler);
        }
        return originalAddEventListener(event, handler, ...args);
    });

    return { parent, el, target, mockMatchMedia, nextTickCallbacks, livewireListeners };
}

function cleanupEnvironment(livewireListeners) {
    // Remove all registered livewire:navigating listeners to prevent cross-test leaks
    if (livewireListeners) {
        livewireListeners.forEach((handler) => {
            document.removeEventListener('livewire:navigating', handler);
        });
    }
    document.body.innerHTML = '';
    delete window.Alpine;
    vi.restoreAllMocks();
}

describe('Portal', () => {
    let parent, el, target, mockMatchMedia, nextTickCallbacks, livewireListeners;

    beforeEach(() => {
        ({ parent, el, target, mockMatchMedia, nextTickCallbacks, livewireListeners } = setupEnvironment());
    });

    afterEach(() => {
        cleanupEnvironment(livewireListeners);
    });

    describe('Construction & Default State', () => {
        it('should have target=null and screen=0 after construction', () => {
            const portal = new Portal(el);

            expect(portal.target).toBeNull();
            expect(portal.screen).toBe(0);
        });

        it('should call Alpine.nextTick on construction', () => {
            new Portal(el);

            expect(window.Alpine.nextTick).toHaveBeenCalledOnce();
        });

        it('should have update and onResize methods', () => {
            const portal = new Portal(el);

            expect(typeof portal.update).toBe('function');
            expect(typeof portal.onResize).toBe('function');
        });
    });

    describe('update()', () => {
        it('should not create matchMedia when screen is 0', () => {
            const portal = new Portal(el);
            portal.screen = 0;

            const callsBefore = mockMatchMedia.mock.calls.length;
            portal.update();
            const callsAfter = mockMatchMedia.mock.calls.length;

            // No new matchMedia call should have been made
            expect(callsAfter).toBe(callsBefore);
        });

        it('should create min-width media query for positive screen value', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;

            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 640px)');
        });

        it('should create max-width media query for negative screen value', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = -768;

            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        });

        it('should register change event listener on media query', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;

            portal.update();

            // Find the matchMedia call for our specific query
            const mqlCall = mockMatchMedia.mock.results.find(
                (r) => r.value.media === '(min-width: 640px)'
            );
            expect(mqlCall).toBeDefined();
            expect(mqlCall.value.addEventListener).toHaveBeenCalledWith(
                'change',
                portal.onResize
            );
        });

        it('should remove previous listener when update() is called again', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();

            // Get the first media query
            const firstMql = mockMatchMedia.mock.results.find(
                (r) => r.value.media === '(min-width: 640px)'
            );

            // Update with a new screen value
            portal.screen = 1024;
            portal.update();

            // The first media query should have had removeEventListener called
            expect(firstMql.value.removeEventListener).toHaveBeenCalledWith(
                'change',
                portal.onResize
            );
        });

        it('should create new media query when screen value changes', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();

            portal.screen = 1024;
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
        });
    });

    describe('onResize()', () => {
        it('should move element to target when matches is true', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            portal.onResize({ matches: true });

            expect(target.contains(el)).toBe(true);
            expect(parent.contains(el)).toBe(false);
        });

        it('should return element to original parent when matches is false', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            // First move to target
            portal.onResize({ matches: true });
            expect(target.contains(el)).toBe(true);

            // Then return
            portal.onResize({ matches: false });
            expect(parent.contains(el)).toBe(true);
            expect(target.contains(el)).toBe(false);
        });

        it('should keep element in parent when matches is false and element was never moved', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            portal.onResize({ matches: false });

            expect(parent.contains(el)).toBe(true);
        });

        it('should handle multiple teleportation cycles', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            // Cycle 1
            portal.onResize({ matches: true });
            expect(target.contains(el)).toBe(true);

            portal.onResize({ matches: false });
            expect(parent.contains(el)).toBe(true);

            // Cycle 2
            portal.onResize({ matches: true });
            expect(target.contains(el)).toBe(true);

            portal.onResize({ matches: false });
            expect(parent.contains(el)).toBe(true);
        });
    });

    describe('Livewire Integration', () => {
        it('should register livewire:navigating listener on construction', () => {
            new Portal(el);

            expect(livewireListeners.length).toBeGreaterThan(0);
        });

        it('should clean up media query listener on livewire:navigating', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();

            // Find the media query for our screen value
            const mql = mockMatchMedia.mock.results.find(
                (r) => r.value.media === '(min-width: 640px)'
            );

            // Dispatch livewire:navigating event
            document.dispatchEvent(new Event('livewire:navigating'));

            expect(mql.value.removeEventListener).toHaveBeenCalledWith(
                'change',
                portal.onResize
            );
        });
    });

    describe('Initial Positioning', () => {
        it('should schedule onResize via nextTick on construction', () => {
            const portal = new Portal(el);

            expect(window.Alpine.nextTick).toHaveBeenCalled();
            expect(nextTickCallbacks.length).toBe(1);
        });

        it('should position element correctly when nextTick fires after update', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();

            // The matchMedia mock returns matches=false by default,
            // so flushing nextTick should keep element in parent
            nextTickCallbacks.forEach((cb) => cb());

            expect(parent.contains(el)).toBe(true);
        });
    });

    describe('v1.0.0 Features: DOM Position Preservation', () => {
        it('should restore element to its exact original sibling position on revert', () => {
            // Setup siblings: prevEl, el, nextEl
            const prevEl = document.createElement('span');
            prevEl.textContent = 'prev';
            const nextEl = document.createElement('span');
            nextEl.textContent = 'next';

            parent.innerHTML = '';
            parent.appendChild(prevEl);
            parent.appendChild(el);
            parent.appendChild(nextEl);

            const portal = new Portal(el);
            portal.target = '#target';

            // Initial sibling order: prevEl, el, nextEl
            expect(Array.from(parent.children)).toEqual([prevEl, el, nextEl]);

            // Teleport to target
            portal.onResize({ matches: true });
            expect(target.contains(el)).toBe(true);
            expect(Array.from(parent.children)).toEqual([prevEl, nextEl]);

            // Revert back
            portal.onResize({ matches: false });
            expect(target.contains(el)).toBe(false);
            expect(Array.from(parent.children)).toEqual([prevEl, el, nextEl]);
        });
    });

    describe('v1.0.0 Features: Named Breakpoints & Ranges', () => {
        it('should resolve named breakpoint "md" to min-width', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 'md';
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');
        });

        it('should resolve negative named breakpoint "-lg" to max-width', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = '-lg';
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 1024px)');
        });

        it('should resolve range string "640-1024" to compound query', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = '640-1024';
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 640px) and (max-width: 1024px)');
        });

        it('should resolve range array [768, 1280] to compound query', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = [768, 1280];
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px) and (max-width: 1280px)');
        });

        it('should support arbitrary media query string directly', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.media = '(orientation: landscape)';
            portal.update();

            expect(mockMatchMedia).toHaveBeenCalledWith('(orientation: landscape)');
        });
    });

    describe('v1.0.0 Features: Placement Modifiers', () => {
        it('should prepend element into target when placement is "prepend"', () => {
            const existingChild = document.createElement('div');
            existingChild.id = 'existing';
            target.appendChild(existingChild);

            const portal = new Portal(el);
            portal.target = '#target';
            portal.placement = 'prepend';

            portal.onResize({ matches: true });

            expect(target.firstChild).toBe(el);
        });

        it('should insert before target when placement is "before"', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.placement = 'before';

            portal.onResize({ matches: true });

            expect(target.previousElementSibling).toBe(el);
        });

        it('should insert after target when placement is "after"', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.placement = 'after';

            portal.onResize({ matches: true });

            expect(target.nextElementSibling).toBe(el);
        });
    });

    describe('v1.0.0 Features: Layout Shift Spacer (.spacer)', () => {
        it('should insert a spacer when teleported and remove it on revert', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.spacer = true;

            portal.onResize({ matches: true });
            expect(parent.querySelector('.x-portal-spacer')).not.toBeNull();

            portal.onResize({ matches: false });
            expect(parent.querySelector('.x-portal-spacer')).toBeNull();
        });
    });

    describe('v1.0.0 Features: Lifecycle Custom Events', () => {
        it('should dispatch "portal:teleport" when teleporting to target', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            const teleportListener = vi.fn();
            el.addEventListener('portal:teleport', teleportListener);

            portal.onResize({ matches: true });

            expect(teleportListener).toHaveBeenCalledOnce();
            expect(teleportListener.mock.calls[0][0].detail.target).toBe('#target');
        });

        it('should dispatch "portal:revert" when returning to parent', () => {
            const portal = new Portal(el);
            portal.target = '#target';

            const revertListener = vi.fn();
            el.addEventListener('portal:revert', revertListener);

            portal.onResize({ matches: true });
            portal.onResize({ matches: false });

            expect(revertListener).toHaveBeenCalledOnce();
            expect(revertListener.mock.calls[0][0].detail.originalParent).toBe(parent);
        });
    });

    describe('v1.0.0 Features: State-Driven Condition (when)', () => {
        it('should not teleport when "when" is false even if media query matches', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.when = false;

            portal.onResize({ matches: true });

            expect(parent.contains(el)).toBe(true);
            expect(target.contains(el)).toBe(false);
        });

        it('should teleport when "when" is updated to true and check() is called', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();
            portal.when = false;

            // Media query matches
            const mql = mockMatchMedia.mock.results.find((r) => r.value.media === '(min-width: 640px)');
            mql.value.matches = true;

            portal.check();
            expect(parent.contains(el)).toBe(true);

            portal.when = true;
            portal.check();
            expect(target.contains(el)).toBe(true);
        });
    });

    describe('v1.0.0 Features: Multi-Target Routing', () => {
        it('should route element to active target from route table', () => {
            const mobileTarget = document.createElement('div');
            mobileTarget.id = 'mobile-target';
            const desktopTarget = document.createElement('div');
            desktopTarget.id = 'desktop-target';
            document.body.appendChild(mobileTarget);
            document.body.appendChild(desktopTarget);

            const portal = new Portal(el);
            portal.setRoutes({
                '-640': '#mobile-target',
                '641': '#desktop-target',
            });

            const mobileMql = mockMatchMedia.mock.results.find((r) => r.value.media === '(max-width: 640px)');
            const desktopMql = mockMatchMedia.mock.results.find((r) => r.value.media === '(min-width: 641px)');

            // Mobile matches
            mobileMql.value.matches = true;
            desktopMql.value.matches = false;
            portal.evaluateRoutes();

            expect(mobileTarget.contains(el)).toBe(true);

            // Switch to desktop
            mobileMql.value.matches = false;
            desktopMql.value.matches = true;
            portal.evaluateRoutes();

            expect(desktopTarget.contains(el)).toBe(true);
            expect(mobileTarget.contains(el)).toBe(false);

            // Neither matches -> return to origin
            mobileMql.value.matches = false;
            desktopMql.value.matches = false;
            portal.evaluateRoutes();

            expect(parent.contains(el)).toBe(true);
        });
    });

    describe('v1.0.0 Features: destroy()', () => {
        it('should clean up all listeners and return element to origin', () => {
            const portal = new Portal(el);
            portal.target = '#target';
            portal.screen = 640;
            portal.update();

            const mql = mockMatchMedia.mock.results.find((r) => r.value.media === '(min-width: 640px)');

            // Teleport element
            portal.onResize({ matches: true });
            expect(target.contains(el)).toBe(true);

            // Destroy
            portal.destroy();

            expect(mql.value.removeEventListener).toHaveBeenCalledWith('change', portal.onResize);
            expect(parent.contains(el)).toBe(true);
        });
    });
});
