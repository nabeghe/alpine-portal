import AlpinePortal from "./index";

/**
 * For when using a CDN.
 *
 * @since 0.1.0
 */
document.addEventListener('alpine:init', () => {
    AlpinePortal(window.Alpine);
});