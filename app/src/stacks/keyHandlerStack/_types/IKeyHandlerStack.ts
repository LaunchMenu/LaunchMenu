import {IStack} from "../../_types/IStack";
import {IKeyEventListener} from "./IKeyEventListener";
import {KeyEvent} from "../KeyEvent";

/**
 * The stack to manage key handlers
 */
export type IKeyHandlerStack = IStack<IKeyEventListener> & {
    /**
     * Emits a key event
     * @param event The event to emit
     * @returns Whether the event was caught
     */
    emit(event: KeyEvent): boolean;
};
