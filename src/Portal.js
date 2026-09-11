/**
 * Default Tailwind-compatible screen breakpoints.
 *
 * @since 1.0.0
 * @type {Record<string, number>}
 */
export const defaultScreens = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

/**
 * Active screen breakpoints (can be extended via plugin configuration).
 *
 * @since 1.0.0
 * @type {Record<string, number>}
 */
export const screens = { ...defaultScreens };

/**
 * Builds a CSS media query string from a screen value (number, name, range, or query).
 *
 * @since 1.0.0
 * @param {number|string|number[]} screen The screen specification.
 * @param {Record<string, number>} [screenMap=screens] Screen breakpoints mapping.
 * @returns {string|null} The resolved media query string, or null if disabled.
 */
export function buildMediaQuery(screen, screenMap = screens) {
    if (screen === 0 || screen === '0' || screen === null || screen === undefined || screen === false) {
        return null;
    }

    if (typeof screen === 'number') {
        return `(${screen > 0 ? 'min' : 'max'}-width: ${Math.abs(screen)}px)`;
    }

    if (Array.isArray(screen) && screen.length >= 2) {
        const [min, max] = screen;
        return `(min-width: ${min}px) and (max-width: ${max}px)`;
    }

    if (typeof screen === 'string') {
        const trimmed = screen.trim();
        if (!trimmed || trimmed === '0') return null;

        // Arbitrary media query already wrapped in parentheses or compound
        if (trimmed.startsWith('(') || trimmed.includes(' and ') || trimmed.includes('screen and')) {
            return trimmed;
        }

        // Negative screen name or number: e.g. -md or -768
        if (trimmed.startsWith('-')) {
            const raw = trimmed.slice(1);
            const bp = screenMap[raw] !== undefined ? screenMap[raw] : Number(raw);
            if (!isNaN(bp)) {
                return `(max-width: ${bp}px)`;
            }
        }

        // Range syntax: e.g. 640-1024 or sm-lg
        if (trimmed.includes('-') || trimmed.includes(':')) {
            const parts = trimmed.includes(':') ? trimmed.split(':') : trimmed.split('-');
            if (parts.length === 2 && parts[0] && parts[1]) {
                const minVal = screenMap[parts[0]] !== undefined ? screenMap[parts[0]] : Number(parts[0]);
                const maxVal = screenMap[parts[1]] !== undefined ? screenMap[parts[1]] : Number(parts[1]);
                if (!isNaN(minVal) && !isNaN(maxVal)) {
                    return `(min-width: ${minVal}px) and (max-width: ${maxVal}px)`;
                }
            }
        }

        // Screen name alias: e.g. md, lg
        if (screenMap[trimmed] !== undefined) {
            return `(min-width: ${screenMap[trimmed]}px)`;
        }

        // Numeric string: e.g. "640" or "-640"
        const num = Number(trimmed);
        if (!isNaN(num)) {
            if (num === 0) return null;
            return `(${num > 0 ? 'min' : 'max'}-width: ${Math.abs(num)}px)`;
        }

        return `(${trimmed})`;
    }

    return null;
}

/**
 * Portal that controls the teleportation process.
 *
 * @since 0.1.0
 * @since 0.2.0 Instead of the `window.onresize` event, `window.mediaMatch` was used.
 * @since 1.0.0 DOM position preservation via comment marker, placement modifiers, multi-target routing,
 *              lifecycle events, state conditions, layout shift prevention, and destroy lifecycle.
 *
 * @param {HTMLElement} el The element for which the portal is active.
 * @constructor
 */
function Portal(el) {

    /**
     * Target selector or element.
     *
     * @since 0.1.0
     * @type {string|HTMLElement|null}
     */
    this.target = null;

    /**
     * Screen breakpoint.
     *
     * @since 0.1.0
     * @type {number|string|number[]}
     */
    this.screen = 0;

    /**
     * Arbitrary media query string.
     *
     * @since 1.0.0
     * @type {string|null}
     */
    this.media = null;

    /**
     * Placement modifier ('append', 'prepend', 'before', 'after').
     *
     * @since 1.0.0
     * @type {'append'|'prepend'|'before'|'after'}
     */
    this.placement = 'append';

    /**
     * Condition flag (state-driven teleportation).
     *
     * @since 1.0.0
     * @type {boolean}
     */
    this.when = true;

    /**
     * Whether to insert a placeholder spacer to prevent Cumulative Layout Shift (CLS).
     *
     * @since 1.0.0
     * @type {boolean}
     */
    this.spacer = false;

    /**
     * Multi-target routing list.
     *
     * @since 1.0.0
     * @type {Array<{condition: string, query: string, target: string|HTMLElement, placement: string, mql: MediaQueryList, handler: Function}>|null}
     */
    this.routes = null;

    /**
     * The element belonging to the first parent so that it can be reverted to it after teleportation.
     *
     * @since 0.1.0
     * @type {HTMLElement}
     */
    const elRealParent = el.parentElement;

    /**
     * DOM anchor marker comment to preserve the exact original sibling position.
     *
     * @since 1.0.0
     * @type {Comment}
     */
    const marker = document.createComment('x-portal-anchor');
    let markerInserted = false;

    /**
     * Inserts the anchor marker comment before the element if not already placed.
     */
    const insertMarker = () => {
        if (!markerInserted && el.parentNode) {
            el.parentNode.insertBefore(marker, el);
            markerInserted = true;
        }
    };
    insertMarker();

    /**
     * Placeholder spacer element for CLS prevention.
     *
     * @since 1.0.0
     * @type {HTMLElement|null}
     */
    let spacerEl = null;

    const createSpacer = () => {
        if (!this.spacer || spacerEl) return;
        spacerEl = document.createElement('div');
        spacerEl.className = 'x-portal-spacer';
        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if (rect && (rect.width || rect.height)) {
            spacerEl.style.width = `${rect.width}px`;
            spacerEl.style.height = `${rect.height}px`;
        }
        const computed = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (computed && computed.display && computed.display !== 'none') {
            spacerEl.style.display = computed.display;
        }
        if (marker.parentNode) {
            marker.parentNode.insertBefore(spacerEl, marker.nextSibling);
        } else if (el.parentNode) {
            el.parentNode.insertBefore(spacerEl, el);
        }
    };

    const removeSpacer = () => {
        if (spacerEl && spacerEl.parentNode) {
            spacerEl.parentNode.removeChild(spacerEl);
            spacerEl = null;
        }
    };

    /**
     * Teleport tracking state.
     *
     * @since 1.0.0
     */
    let isTeleported = false;
    let currentTargetEl = null;

    /**
     * Moves the element into or relative to the target container.
     *
     * @since 1.0.0
     * @param {string|HTMLElement} targetSelector
     * @param {string} placement
     * @returns {boolean}
     */
    const insertIntoTarget = (targetSelector, placement = this.placement) => {
        const target = typeof targetSelector === 'string'
            ? document.querySelector(targetSelector)
            : targetSelector;

        if (!target) return false;

        insertMarker();
        createSpacer();

        if (placement === 'prepend') {
            target.prepend(el);
        } else if (placement === 'before') {
            target.before(el);
        } else if (placement === 'after') {
            target.after(el);
        } else {
            target.appendChild(el);
        }

        isTeleported = true;
        currentTargetEl = target;

        el.dispatchEvent(new CustomEvent('portal:teleport', {
            bubbles: true,
            detail: {
                target: targetSelector,
                targetElement: target,
                placement,
                portal: this,
            }
        }));

        return true;
    };

    /**
     * Reverts the element back to its original DOM position.
     *
     * @since 1.0.0
     */
    const returnToOrigin = () => {
        if (!isTeleported && (!elRealParent || elRealParent.contains(el))) return;

        removeSpacer();

        if (marker.parentNode) {
            marker.parentNode.insertBefore(el, marker.nextSibling);
        } else if (elRealParent) {
            elRealParent.appendChild(el);
        }

        isTeleported = false;
        currentTargetEl = null;

        el.dispatchEvent(new CustomEvent('portal:revert', {
            bubbles: true,
            detail: {
                originalParent: elRealParent,
                portal: this,
            }
        }));
    };

    /**
     * The media query object that checks the page resize based on the CSS engine.
     *
     * @since 0.2.0
     * @type {MediaQueryList|null}
     */
    let mediaQuery = null;

    /**
     * Initializes the media query based on the current size of the portal screen from the beginning.
     *
     * @since 0.2.0
     * @since 1.0.0 Supports named breakpoints, arbitrary media queries, and range syntax.
     */
    this.update = () => {
        // If there was a portal previously.
        if (mediaQuery) {
            // Turn off the previous portal.
            mediaQuery.removeEventListener('change', this.onResize);
            mediaQuery = null;
        }

        let query = null;
        if (this.media) {
            query = buildMediaQuery(this.media);
        } else if (this.screen !== 0 && this.screen !== null && this.screen !== undefined) {
            query = buildMediaQuery(this.screen);
        }

        // When the query is null, the portal teleportation is off.
        if (!query) return;

        // Build media query.
        mediaQuery = window.matchMedia(query);

        // Turn on the portal.
        mediaQuery.addEventListener('change', this.onResize);
    };

    /**
     * Window resize / media query change event.
     *
     * @since 0.1.0
     * @since 0.2.0 Switched to `window.matchMedia` change listener.
     * @since 0.2.4 Avoiding Livewire re-run.
     * @since 1.0.0 Sibling position restoration, placement modifiers, layout shift prevention, and events.
     *
     * @param {MediaQueryList|{matches: boolean}} e The media query event/object.
     */
    this.onResize = (e) => {
        const matches = Boolean(e && e.matches);

        // When conditions are met for teleporting to the target.
        if (matches && (this.when !== false)) {
            insertIntoTarget(this.target, this.placement);
        }
        // When conditions are met for returning to the initial position.
        else {
            returnToOrigin();
        }
    };

    /**
     * Evaluates multi-target routes.
     *
     * @since 1.0.0
     */
    this.evaluateRoutes = () => {
        if (this.when === false || !this.routes || this.routes.length === 0) {
            returnToOrigin();
            return;
        }

        const activeRoute = this.routes.find((r) => r.mql && r.mql.matches);
        if (activeRoute) {
            insertIntoTarget(activeRoute.target, activeRoute.placement);
        } else {
            returnToOrigin();
        }
    };

    /**
     * Cleans up any registered route listeners.
     *
     * @since 1.0.0
     */
    this.cleanRoutes = () => {
        if (this.routes) {
            this.routes.forEach((r) => {
                if (r.mql && r.handler) {
                    r.mql.removeEventListener('change', r.handler);
                }
            });
            this.routes = null;
        }
    };

    /**
     * Sets up multi-target routes.
     *
     * @since 1.0.0
     * @param {Record<string, string|{target: string, placement?: string}>} routesObj
     */
    this.setRoutes = (routesObj) => {
        this.cleanRoutes();
        if (!routesObj || typeof routesObj !== 'object') return;

        this.routes = [];
        Object.entries(routesObj).forEach(([condition, targetConfig]) => {
            const query = buildMediaQuery(condition);
            if (!query) return;

            let target = targetConfig;
            let placement = this.placement;
            if (typeof targetConfig === 'object' && targetConfig !== null && !(targetConfig instanceof HTMLElement)) {
                target = targetConfig.target;
                placement = targetConfig.placement || this.placement;
            }

            const mql = window.matchMedia(query);
            const route = {
                condition,
                query,
                target,
                placement,
                mql,
                handler: () => this.evaluateRoutes(),
            };
            mql.addEventListener('change', route.handler);
            this.routes.push(route);
        });

        this.evaluateRoutes();
    };

    /**
     * Re-checks current conditions and triggers teleport/revert accordingly.
     *
     * @since 1.0.0
     */
    this.check = () => {
        if (this.routes && this.routes.length > 0) {
            this.evaluateRoutes();
        } else if (mediaQuery) {
            this.onResize(mediaQuery);
        } else if (this.target) {
            if (this.when && this.screen === 0 && !this.media) {
                insertIntoTarget(this.target, this.placement);
            } else if (!this.when) {
                returnToOrigin();
            }
        }
    };

    /**
     * Cleans up all event listeners, markers, and restores element to origin.
     *
     * @since 1.0.0
     */
    this.destroy = () => {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', this.onResize);
            mediaQuery = null;
        }
        this.cleanRoutes();
        document.removeEventListener('livewire:navigating', onLivewire);
        returnToOrigin();
        if (marker.parentNode) {
            marker.parentNode.removeChild(marker);
        }
        removeSpacer();
    };

    const onLivewire = () => {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', this.onResize);
        }
        if (this.routes) {
            this.routes.forEach((r) => {
                if (r.mql && r.handler) {
                    r.mql.removeEventListener('change', r.handler);
                }
            });
        }
    };

    document.addEventListener('livewire:navigating', onLivewire);

    // For the next tick, set up the screen resize event to be executed and checked at the beginning of document load.
    window.Alpine.nextTick(() => {
        if (this.routes && this.routes.length > 0) {
            this.evaluateRoutes();
        } else {
            this.onResize(mediaQuery);
        }
    });
}

export default Portal;
