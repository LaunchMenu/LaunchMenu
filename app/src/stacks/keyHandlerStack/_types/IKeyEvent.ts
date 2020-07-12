import {IKey} from "./IKey";

/**
 * A class storing data for key events
 */
export type IKeyEvent = {
    /** The keys that were held down when this event was fired */
    readonly held: IKey[];

    /** Whether the ctrl key is down */
    readonly ctrl: boolean;
    /** Whether the shift key is down */
    readonly shift: boolean;
    /** Whether the alt key is down */
    readonly alt: boolean;

    /** Whether this event was fired from a key repeat */
    readonly repeat: boolean;
    /** Whether this was a key down event */
    readonly down: boolean;

    /** The key that was altered */
    readonly key: IKey;
    /** The original event this event was obtained from if any */
    readonly original?: KeyboardEvent;
};
