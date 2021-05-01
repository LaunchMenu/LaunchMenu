/** The configuration for the show screen function */
export type IShowScreenConfig<T> = {
    /** The props to pass to the element */
    props?: T;
    /** The duration for which to show this element */
    duration?: number;
    /** Whether to fade in, and optionally the duration */
    fadeIn?: number | boolean;
    /** Whether to fade out, and optionally the duration */
    fadeOut?: number | boolean;
    /** Whether to hide the cursor while this element is visible */
    hideCursor?: boolean;
};
