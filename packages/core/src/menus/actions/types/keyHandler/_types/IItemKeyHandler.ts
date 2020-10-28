import {IIOContext} from "../../../../../context/_types/IIOContext";
import {KeyEvent} from "../../../../../keyHandler/KeyEvent";
import {IMenu} from "../../../../menu/_types/IMenu";
import {IMenuItemExecuteCallback} from "../../../../menu/_types/IMenuItemExecuteCallback";

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
     * @param menu The menu that the item is in that forwarded this event
     * @param onExecute The item execution listener for the menu
     * @returns Whether the event was caught
     */
    onKey(
        event: KeyEvent,
        menu: IMenu,
        onExecute?: IMenuItemExecuteCallback
    ): ISyncItemKeyHandlerResponse | Promise<ISyncItemKeyHandlerResponse>;
};
