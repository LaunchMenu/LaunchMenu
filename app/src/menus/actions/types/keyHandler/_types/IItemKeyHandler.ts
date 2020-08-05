import {KeyEvent} from "../../../../../stacks/keyHandlerStack/KeyEvent";

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
     * @returns Whether the event was caught
     */
    onKey(
        event: KeyEvent
    ): ISyncItemKeyHandlerResponse | Promise<ISyncItemKeyHandlerResponse>;
};
