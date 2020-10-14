import {IKey} from "./IKey";

/**
 * A class storing data for key events
 */
export type IKeyEventInput = {
    /** The type of event to invoke */
    type: "down" | "up";

    /** The key that was altered */
    key: IKey;

    /** The event that created this 'synthetic' event */
    original?: KeyboardEvent;
};
