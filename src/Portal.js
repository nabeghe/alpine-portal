/**
 * Portal that controls the teleportation process.
 *
 * @since 0.1.0
 *
 * @param {HTMLElement} el
 * @constructor
 */
function Portal(el) {

    /**
     * Target selector.
     *
     * @since 0.1.0
     * @type {string}
     */
    this.target = '';

    /**
     * Screen breakpoint.
     *
     * @since 0.1.0
     * @type {int}
     */
    this.screen = 0;

    /**
     * Whether to teleport if it is greater than the specified screen breakpoint or if it is smaller.
     * The default is true, which means teleporting if it is greater.
     *
     * @since 0.1.0
     * @type {boolean}
     */
    this.is = true;

    /**
     * The element belonging to the first parent so that it can be reverted to it after teleportation.
     *
     * @since 0.1.0
     * @type {HTMLElement}
     */
    const elRealParent = el.parentElement;

    /**
     * Whether it has been teleported to the target or not.
     * In other words, whether the element is inside the target or not.
     *
     * @since 0.1.0
     * @type {boolean}
     */
    let teleported = false;

    /**
     * Window resize event.
     *
     * @since 0.1.0
     */
    this.onResize = () => {
        const isScreen = window.innerWidth > this.screen;

        // If it has been previously teleported to the target, then the element's return must be checked.
        if (teleported) {
            if ((this.is && !isScreen) || (!this.is && isScreen)) {
                elRealParent.appendChild(el);
                teleported = false;
            }
            return;
        }

        // If it has not been previously teleported to the target, then the teleportation to the target must be checked.
        if ((this.is && isScreen) || (!this.is && !isScreen)) {
            document.querySelector(this.target).appendChild(el);
            teleported = true;
        }
    }

    // Define the screen resize event.
    window.addEventListener("resize", this.onResize);

    // For the next tick, set up the screen resize event to be executed and checked at the beginning of document load.
    window.Alpine.nextTick(this.onResize);
}

export default Portal;