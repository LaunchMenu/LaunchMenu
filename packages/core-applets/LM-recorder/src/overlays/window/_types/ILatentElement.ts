import {FC} from "react";

/**
 * Represents an element, that hasn't yet been initialized
 */
export type ILatentElement<T = Record<string, any>> = {
    /** The component */
    Component: FC<T>;
    /** The element's key */
    key: string;
    /** The extra props to send to the element */
    props: T;
};
