import {IMenu} from "../../_types/IMenu";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles execute input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleExecuteInput(event: KeyEvent, menu: IMenu): void | boolean {
    if (event.is("enter")) {
        executeAction.get(menu.getAllSelected()).execute();
        return true;
    }
}
