import {IIOContext} from "../../../../../context/_types/IIOContext";
import {KeyEvent} from "../../../../../stacks/keyHandlerStack/KeyEvent";

/** The possible responses for key handlers of an item */
export type ISyncItemKeyHandlerResponse =
    | undefined
    /** The value for stop propagation, stopImmediatePropagation defaults to false */
    | boolean
    | {
          /** Stops propagation to handlers with lower priority (down the handler stack) */
          stopPropagation?: boolean;
          /** Stops propagation to handlers with the same priority (other item handlers) */
          stopImmediatePropagation?: boolean;
      };

/**
 * Key handlers for individual items
 */
export type IItemKeyHandler = {
    /**
     * Informs about key events and returns whether it was caught
     * @param event The event to be executed
     * @param context The IO context that can be used
     * @returns Whether the event was caught
     */
    onKey(
        event: KeyEvent,
        context: IIOContext
    ): ISyncItemKeyHandlerResponse | Promise<ISyncItemKeyHandlerResponse>;
};
