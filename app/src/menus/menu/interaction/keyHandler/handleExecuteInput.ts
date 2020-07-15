import {IKeyEvent} from "../../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {IMenu} from "../../_types/IMenu";
import {executeAction} from "../../../actions/types/execute/executeAction";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";

/**
 * Handles execute input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleExecuteInput(event: IKeyEvent, menu: IMenu): void | boolean {
    if (isDownEvent(event, "enter")) {
        executeAction.get(menu.getAllSelected()).execute();
        return true;
    }
}
