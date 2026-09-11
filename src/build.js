import AlpinePortal, { Portal, screens, defaultScreens, buildMediaQuery, portals } from "./index";

/**
  * Auto-register when Alpine initializes in a browser/CDN environment.
  *
  * @since 0.1.0
  */
document.addEventListener('alpine:init', () => {
    AlpinePortal(window.Alpine);
});

AlpinePortal.Portal = Portal;
AlpinePortal.screens = screens;
AlpinePortal.defaultScreens = defaultScreens;
AlpinePortal.buildMediaQuery = buildMediaQuery;
AlpinePortal.portals = portals;

if (typeof window !== 'undefined') {
    window.AlpinePortal = AlpinePortal;
}

export default AlpinePortal;