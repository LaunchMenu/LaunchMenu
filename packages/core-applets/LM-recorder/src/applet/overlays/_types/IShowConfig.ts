/** The config for the controller's show method */
export type IShowConfig = {
    /** The duration to show the screen for */
    duration?: number;
    /** Whether to fade in, and optionally the duration */
    fadeIn?: number | boolean;
    /** Whether to fade out, and optionally the duration */
    fadeOut?: number | boolean;
};
