import {IStack} from "../../_types/IStack";
import {IKeyEventListener} from "./IKeyEventListener";
import {IKeyEvent} from "./IKeyEvent";

/**
 * The stack to manage key handlers
 */
export type IKeyHandlerStack = IStack<IKeyEventListener> & {
    /**
     * Emits a key event
     * @param event The event to emit
     * @returns Whether the event was caught
     */
    emit(event: IKeyEvent): boolean;
};
