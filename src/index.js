import Portal, { screens, defaultScreens, buildMediaQuery } from "./Portal";

/**
 * List of active portals.
 *
 * @since 0.1.0
 * @type {Portal[]}
 */
const portals = [];

/**
 * Alpine Portal Plugin for Alpine.js v3.
 *
 * @since 0.1.0
 * @since 1.0.0 Plugin options, Alpine cleanup hook, modifiers, multi-target routes, and media/when directives.
 *
 * @param {object} Alpine The Alpine instance.
 * @param {object} [options={}] Plugin options.
 * @param {Record<string, number>} [options.screens] Custom screen breakpoints.
 */
export default function (Alpine, options = {}) {
    if (options && options.screens) {
        Object.assign(screens, options.screens);
    }

    Alpine.directive('portal', (el, { value, modifiers = [], expression }, { evaluate, cleanup } = {}) => {
        // Defining a portal object on the element itself.
        if (!value && el._x_portal === undefined) {
            el._x_portal = new Portal(el);
            portals.push(el._x_portal);
        }

        // Official Alpine v3 cleanup hook
        if (cleanup) {
            cleanup(() => {
                if (el._x_portal) {
                    el._x_portal.destroy();
                    delete el._x_portal;
                }
            });
        }

        // Apply placement & layout modifiers if present
        if (modifiers && modifiers.length > 0 && el._x_portal) {
            if (modifiers.includes('prepend')) {
                el._x_portal.placement = 'prepend';
            } else if (modifiers.includes('before')) {
                el._x_portal.placement = 'before';
            } else if (modifiers.includes('after')) {
                el._x_portal.placement = 'after';
            } else if (modifiers.includes('append')) {
                el._x_portal.placement = 'append';
            }

            if (modifiers.includes('spacer') || modifiers.includes('placeholder')) {
                el._x_portal.spacer = true;
            }
        }

        // If there is no value for the expression, ignore it (unless modifiers specify screen).
        if (expression === false) return;

        // If the directive value is not present, it is setting target or multi-target routes.
        if (!value) {
            // Check if expression is an object literal (multi-target routes)
            if (typeof expression === 'string' && expression.trim().startsWith('{')) {
                try {
                    const evaluated = evaluate ? evaluate(expression) : null;
                    if (evaluated && typeof evaluated === 'object') {
                        el._x_portal.setRoutes(evaluated);
                        return;
                    }
                } catch (e) {
                    // Fallback to setting target if evaluation fails
                }
            }
            value = 'target';
        } else {
            // If modifier specifies screen name (e.g. x-portal:screen.md or x-portal:screen.-md)
            if (value === 'screen' && (!expression || expression === true || expression === '')) {
                const screenMod = modifiers.find((m) => screens[m] !== undefined || screens[m.replace(/^-/, '')] !== undefined);
                if (screenMod) {
                    expression = screenMod;
                } else if (evaluate && typeof expression === 'string' && expression) {
                    expression = evaluate(expression);
                }
            } else if (evaluate && typeof expression === 'string') {
                expression = evaluate(expression);
            }
        }

        if (!el._x_portal) return;

        // Handle specific portal properties and routes
        if (value === 'routes' && typeof expression === 'object' && expression !== null) {
            el._x_portal.setRoutes(expression);
        } else if (value === 'when') {
            el._x_portal.when = Boolean(expression);
            el._x_portal.check();
        } else if (value === 'media') {
            el._x_portal.media = expression;
            el._x_portal.update();
        } else {
            el._x_portal[value] = expression;

            // If the screen size breakpoint has changed, update the portal.
            if (value === 'screen') {
                el._x_portal.update();
            }
        }
    });
};

export { Portal, screens, defaultScreens, buildMediaQuery, portals };