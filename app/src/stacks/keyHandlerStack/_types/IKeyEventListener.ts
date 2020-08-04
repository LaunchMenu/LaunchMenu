import {KeyEvent} from "../KeyEvent";

/**
 * A listener for key events
 */
export type IKeyEventListener =
    /**
     * Handles a key event being fired
     * @param event The event that was fired
     * @returns Whether the event was caught
     */
    (event: KeyEvent) => boolean | void;
