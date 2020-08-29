import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {executeItems} from "../executeItems";

/**
 * Handles execute input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleExecuteInput(event: KeyEvent, menu: IMenu): void | boolean {
    if (event.is("enter")) {
        executeItems(menu);
        return true;
    }
}
