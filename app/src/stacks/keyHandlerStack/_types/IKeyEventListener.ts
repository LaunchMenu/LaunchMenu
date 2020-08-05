import {KeyEvent} from "../KeyEvent";

/**
 * A listener function for key events
 */
export type IKeyEventListenerFunction =
    /**
     * Handles a key event being fired
     * @param event The event that was fired
     * @returns Whether the event was caught
     */
    (event: KeyEvent) => boolean | void | Promise<boolean | void>;

/**
 * A listener object for key events
 */
export type IKeyEventListenerObject = {
    emit: IKeyEventListenerFunction;

    /** Destroys any data created for the listener */
    destroy?: () => void;
};

/**
 * A listener for key events
 */
export type IKeyEventListener = IKeyEventListenerFunction | IKeyEventListenerObject;
