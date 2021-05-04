import {IJSON} from "@launchmenu/core";

/**
 * Represents a remote element to be instantiated in another process
 */
export type IRemoteElement = {
    /** The file path to the component */
    componentPath: string;
    /** The element's key */
    key: string;
    /** The props to pass to the element */
    props?: Record<string, IJSON>;
    /** Whether to fade in, and optionally the duration */
    fadeIn?: number;
    /** Whether to fade out, and optionally the duration */
    fadeOut?: number;
};
