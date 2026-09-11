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
});
