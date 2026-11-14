/** Keep in step with --app-width and --u in app/globals.css. */
export const APP_MAX_WIDTH = 430;
/** The layouts were drawn at this width. */
export const DESIGN_WIDTH = 390;

/** One design pixel in screen pixels, for the current window. */
export const designPx = () => Math.min(window.innerWidth, APP_MAX_WIDTH) / DESIGN_WIDTH;
