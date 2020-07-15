type IKey = {
    /** The code for this key */
    keyCode: number;
    /** The string of this key */
    key: string;
}

/**
 * A key event raised by the event handler
 */
export type IKeyEvent = {
    /** The event type */
    type: "down" | "up" | "repeat";
    /** All keys that are currently held down */
    heldKeys: IKey[];

    // TODO: augment with relevant data
} & IKey;
