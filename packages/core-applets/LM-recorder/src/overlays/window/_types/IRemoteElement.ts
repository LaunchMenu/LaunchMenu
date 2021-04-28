import {IJSON} from "@launchmenu/core";

/**
 * Represents a remote element to be instantiated in another process
 */
export type IRemoteElement = {
    /** The file path to the component */
    componentPath: string;
    /** The element's key */
    key: string;
    /** The extra props to send to the element */
    props: Record<string, IJSON>;
};
