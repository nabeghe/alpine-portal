import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import registerPlugin from '../src/index.js';

/**
 * Helper: creates a mock Alpine instance.
 */
function createMockAlpine() {
    const directives = {};

    return {
        directive: vi.fn((name, callback) => {
            directives[name] = callback;
        }),
        _directives: directives,
        // Defer nextTick to avoid onResize(null) during Portal construction
        nextTick: vi.fn((cb) => { /* deferred, not called */ }),
    };
}

/**
 * Helper: creates a DOM element with a parent and sets up window globals.
 */
function setupDOM() {
    const parent = document.createElement('div');
    parent.id = 'parent';
    const el = document.createElement('div');
    el.id = 'portal-el';
    parent.appendChild(el);

    const target = document.createElement('div');
    target.id = 'target';

    document.body.appendChild(parent);
    document.body.appendChild(target);

    // Mock matchMedia
    window.matchMedia = vi.fn(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));

    return { parent, el, target };
}

function cleanupDOM() {
    document.body.innerHTML = '';
}

describe('Directive Registration (index.js)', () => {
    let Alpine;

    beforeEach(() => {
        Alpine = createMockAlpine();
        window.Alpine = Alpine;
        setupDOM();
    });

    afterEach(() => {
        cleanupDOM();
        delete window.Alpine;
    });

    it('should register a "portal" directive on Alpine', () => {
        registerPlugin(Alpine);

        expect(Alpine.directive).toHaveBeenCalledWith('portal', expect.any(Function));
    });

    it('should create _x_portal on element when no value is provided', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // Call with no value (base x-portal directive)
        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        expect(el._x_portal).toBeDefined();
        expect(el._x_portal.target).toBe('#target');
    });

    it('should set target from expression when no value modifier', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        expect(el._x_portal.target).toBe('#target');
    });

    it('should not create duplicate Portal when called again without value', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });
        const firstPortal = el._x_portal;

        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        expect(el._x_portal).toBe(firstPortal);
    });

    it('should set screen property and call update() when value is "screen"', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // First create the portal
        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        // Spy on update
        const updateSpy = vi.spyOn(el._x_portal, 'update');

        // Set screen
        const evaluate = vi.fn(() => 640);
        callback(el, { value: 'screen', expression: '640' }, { evaluate });

        expect(evaluate).toHaveBeenCalledWith('640');
        expect(el._x_portal.screen).toBe(640);
        expect(updateSpy).toHaveBeenCalled();
    });

    it('should set target property when value is "target"', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // First create the portal
        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        // Set target via modifier
        const evaluate = vi.fn(() => '#other-target');
        callback(el, { value: 'target', expression: "'#other-target'" }, { evaluate });

        expect(el._x_portal.target).toBe('#other-target');
    });

    it('should skip when expression is false', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // Call with expression=false
        callback(el, { value: null, expression: false }, { evaluate: vi.fn() });

        // Portal should be created but no property should be set
        expect(el._x_portal).toBeDefined();
        // target should remain null since expression was false
        expect(el._x_portal.target).toBeNull();
    });

    it('should evaluate expressions for value modifiers', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // First create the portal
        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        // Set screen with dynamic expression
        const evaluate = vi.fn(() => 1024);
        callback(el, { value: 'screen', expression: 'breakpointVar' }, { evaluate });

        expect(evaluate).toHaveBeenCalledWith('breakpointVar');
        expect(el._x_portal.screen).toBe(1024);
    });

    it('should support negative screen values', () => {
        registerPlugin(Alpine);
        const callback = Alpine._directives['portal'];
        const el = document.getElementById('portal-el');

        // Create portal
        callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

        // Set negative screen
        const evaluate = vi.fn(() => -640);
        callback(el, { value: 'screen', expression: '-640' }, { evaluate });

        expect(el._x_portal.screen).toBe(-640);
    });

    describe('v1.0.0 Directive Enhancements', () => {
        it('should parse placement modifiers (.prepend, .before, .after, .append)', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, modifiers: ['prepend'], expression: '#target' }, { evaluate: vi.fn() });
            expect(el._x_portal.placement).toBe('prepend');

            callback(el, { value: null, modifiers: ['before'], expression: '#target' }, { evaluate: vi.fn() });
            expect(el._x_portal.placement).toBe('before');

            callback(el, { value: null, modifiers: ['after'], expression: '#target' }, { evaluate: vi.fn() });
            expect(el._x_portal.placement).toBe('after');

            callback(el, { value: null, modifiers: ['append'], expression: '#target' }, { evaluate: vi.fn() });
            expect(el._x_portal.placement).toBe('append');
        });

        it('should parse spacer modifier (.spacer or .placeholder)', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, modifiers: ['spacer'], expression: '#target' }, { evaluate: vi.fn() });
            expect(el._x_portal.spacer).toBe(true);
        });

        it('should parse named screen modifier (x-portal:screen.md)', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });
            callback(el, { value: 'screen', modifiers: ['md'], expression: '' }, { evaluate: vi.fn() });

            expect(el._x_portal.screen).toBe('md');
        });

        it('should handle x-portal:media directive', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

            const evaluate = vi.fn(() => '(orientation: portrait)');
            callback(el, { value: 'media', expression: "'(orientation: portrait)'" }, { evaluate });

            expect(el._x_portal.media).toBe('(orientation: portrait)');
        });

        it('should handle x-portal:when directive and update state', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

            const evaluate = vi.fn(() => false);
            callback(el, { value: 'when', expression: 'isReady' }, { evaluate });

            expect(el._x_portal.when).toBe(false);
        });

        it('should parse multi-target route object literal expression', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            const routes = { '-640': '#mobile', '641': '#desktop' };
            const evaluate = vi.fn(() => routes);

            callback(el, { value: null, expression: "{ '-640': '#mobile', '641': '#desktop' }" }, { evaluate });

            expect(el._x_portal.routes).toBeDefined();
            expect(el._x_portal.routes.length).toBe(2);
        });

        it('should support custom screens via plugin options', () => {
            registerPlugin(Alpine, {
                screens: { tablet: 820, desktop: 1440 }
            });

            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn() });

            const evaluate = vi.fn(() => 'tablet');
            callback(el, { value: 'screen', expression: "'tablet'" }, { evaluate });

            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 820px)');
        });

        it('should register Alpine v3 cleanup hook on element teardown', () => {
            registerPlugin(Alpine);
            const callback = Alpine._directives['portal'];
            const el = document.getElementById('portal-el');

            let cleanupCallback;
            const cleanup = vi.fn((cb) => { cleanupCallback = cb; });

            callback(el, { value: null, expression: '#target' }, { evaluate: vi.fn(), cleanup });

            expect(cleanup).toHaveBeenCalled();
            const destroySpy = vi.spyOn(el._x_portal, 'destroy');

            // Trigger cleanup
            cleanupCallback();

            expect(destroySpy).toHaveBeenCalled();
            expect(el._x_portal).toBeUndefined();
        });
    });
});
