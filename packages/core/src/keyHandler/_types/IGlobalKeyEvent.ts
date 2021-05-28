import {IKeyId} from "../keyIdentifiers/keyIds";

/** The event type that are sent by the global key listener */
export type IGlobalKeyEvent = {
    key: IKeyId;
    rawcode: string;
    type: "keyup" | "keydown";
    altKey?: "left" | "right";
    shiftKey?: "left" | "right";
    ctrlKey?: "left" | "right";
    metaKey?: "left" | "right";
};
