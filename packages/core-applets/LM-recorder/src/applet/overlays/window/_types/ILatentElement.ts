import {FC} from "react";

/**
 * Represents an element, that hasn't yet been initialized
 */
export type ILatentElement<T = Record<string, any>> = {
    /** The component */
    Component: FC<T>;
    /** The element's key */
    key: string;
    /** Whether to fade in, and optionally the duration */
    fadeIn?: number;
    /** Whether to fade out, and optionally the duration */
    fadeOut?: number;
    /** The props to pass to the element */
    props?: T;
    /** Whether the element is still visible */
    visible: boolean;
    /** The time at which the element was removed */
    removalTime?: number;
};
