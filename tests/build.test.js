import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CDN Build Entry (build.js)', () => {
    let addEventListenerSpy;
    let originalAddEventListener;

    beforeEach(() => {
        // Set up Alpine mock on window
        window.Alpine = {
            directive: vi.fn(),
            nextTick: vi.fn((cb) => cb()),
        };

        // Mock matchMedia
        window.matchMedia = vi.fn(() => ({
            matches: false,
            media: '',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));

        // Spy on document.addEventListener before importing build.js
        originalAddEventListener = document.addEventListener;
        addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    });

    afterEach(() => {
        document.addEventListener = originalAddEventListener;
        delete window.Alpine;
        vi.restoreAllMocks();
        vi.resetModules();
    });

    it('should register an alpine:init event listener', async () => {
        await import('../src/build.js');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'alpine:init',
            expect.any(Function)
        );
    });

    it('should register portal directive when alpine:init fires', async () => {
        // Capture the callback instead of spying
        const callbacks = [];
        document.addEventListener = vi.fn((event, cb) => {
            if (event === 'alpine:init') {
                callbacks.push(cb);
            }
        });

        await import('../src/build.js');

        // Fire the captured callback
        expect(callbacks.length).toBeGreaterThan(0);
        callbacks[0]();

        expect(window.Alpine.directive).toHaveBeenCalledWith(
            'portal',
            expect.any(Function)
        );
    });
});
