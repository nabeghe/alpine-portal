(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

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
      };

      /**
       * Window resize event.
       *
       * @since 0.1.0
       * @since 0.2.0 The usage of `window.onresize` event has been changed to `window.meatchMedia` and its `addEventListener` method of type 'change'.
       *
       * @param {MediaQueryList} e The media query object.
       */
      this.onResize = e => {
        // When the conditions were met for teleporting to the target.
        if (e.matches) {
          document.querySelector(this.target).appendChild(el);
        }
        // When the conditions were met for returning to the initial position, then it should be teleported back to the initial position.
        else {
          elRealParent.appendChild(el);
        }
      };

      // For the next tick, set up the screen resize event to be executed and checked at the beginning of document load.
      window.Alpine.nextTick(() => this.onResize(mediaQuery));
    }

    /**
     * List of portals... Currently not in use.
     *
     * @since 0.1.0
     * @type {Portal[]}
     */
    const portals = [];
    function AlpinePortal (Alpine) {
      Alpine.directive('portal', (el, {
        value,
        expression
      }, {
        evaluate
      }) => {
        // Defining a portal object on the element itself.
        if (!value && el._x_portal === undefined) {
          el._x_portal = new Portal(el);
          portals.push(el._x_portal);
        }

        // If there is no value for the expression, ignore it.
        if (expression === false) return;

        // If the directive value is not present, it is in the process of setting the target property of the portal.
        if (!value) {
          value = 'target';
        } //
        // If the value is provided for the directive, that value is the name of a portal property, and the expression must also be evaluated.
        else {
          expression = evaluate(expression);
        }

        // Set the property for the portal.
        el._x_portal[value] = expression;

        // If the screen size breakpoint has changed, update the portal.
        if (value && value === 'screen') {
          el._x_portal.update();
        }
      });
    }

    /**
     * For when using a CDN.
     *
     * @since 0.1.0
     */
    document.addEventListener('alpine:init', () => {
      AlpinePortal(window.Alpine);
    });

}));
//# sourceMappingURL=alpine-portal.js.map
