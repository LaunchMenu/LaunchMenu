/** The event type that are sent by the global key listener */
export type IGlobalKeyEvent = {
    keycode: number;
    rawcode: number;
    type: "keyup" | "keydown";
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
};
