/**
 * Portal that controls the teleportation process.
 *
 * @since 0.1.0
 * @since 0.2.0 Instead of the `window.onresize` event, `window.mediaMatch` was used.
 *
 * @param {HTMLElement} el The element for which the portal is active.
 * @constructor
 */
function Portal(el) {

    /**
     * Target selector.
     *
     * @since 0.1.0
     * @type {string|null}
     */
    this.target = null;

    /**
     * Screen breakpoint.
     *
     * @since 0.1.0
     * @type {int}
     */
    this.screen = 0;

    /**
     * The element belonging to the first parent so that it can be reverted to it after teleportation.
     *
     * @since 0.1.0
     * @type {HTMLElement}
     */
    const elRealParent = el.parentElement;

    /**
     * The media query object that checks the page resize based on the CSS engine.
     *
     * @since 0.2.0
     * @type {MediaQueryList|null}
     */
    let mediaQuery = null;

    /**
     * Initializes the media query based on the current size of the portal screen from the beginning."
     *
     * @since 0.2.0
     */
    this.update = () => {
        // If there was a portal previously.
        if (mediaQuery) {
            // Turn off the previous portal.
            mediaQuery.removeEventListener('change', this.onResize);
            mediaQuery = null;
        }

        // When the screen is at 0, the portal teleportation is off.
        if (this.screen === 0) return;

        // The min-width or max-width state of the media query is determined based on the negative/positive sign of the screen size.
        mediaQuery = window.matchMedia(`(${this.screen > 0 ? 'min' : 'max'}-width: ${Math.abs(this.screen)}px)`);

        // Turn on the portal.
        mediaQuery.addEventListener('change', this.onResize);
    }

    /**
     * Window resize event.
     *
     * @since 0.1.0
     * @since 0.2.0 The usage of `window.onresize` event has been changed to `window.meatchMedia` and its `addEventListener` method of type 'change'.
     *
     * @param {MediaQueryList} e The media query object.
     */
    this.onResize = (e) => {
        // When the conditions were met for teleporting to the target.
        if (e.matches) {
            document.querySelector(this.target).appendChild(el);
        }
        // When the conditions were met for returning to the initial position, then it should be teleported back to the initial position.
        else {
            elRealParent.appendChild(el);
        }
    }
    
    // Avoiding Livewire re-run (see https://github.com/nabeghe/alpine-portal/issues/2)
    document.addEventListener('livewire:navigating', () => mediaQuery.removeEventListener('change', this.onResize));

    // For the next tick, set up the screen resize event to be executed and checked at the beginning of document load.
    window.Alpine.nextTick(() => this.onResize(mediaQuery));
}

export default Portal;
