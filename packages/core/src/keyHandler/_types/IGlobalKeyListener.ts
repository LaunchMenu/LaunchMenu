import {IGlobalKeyResult} from "node-global-key-listener/build/ts/_types/IGlobalKeyResult";
import {IGlobalKeyEvent} from "./IGlobalKeyEvent";

/** A key listener to listen for global key events */
export type IGlobalKeyListener = {
    /**
     * Listens for global key events
     * @param key The key event that was emitted
     * @returns How to handle event propagation
     */
    (key: IGlobalKeyEvent): IGlobalKeyResult;
};
