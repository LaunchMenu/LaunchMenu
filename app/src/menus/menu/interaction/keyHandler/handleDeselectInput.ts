import {IKeyEvent} from "../../../../stacks/keyHandlerStack/_types/IKeyEvent";
import {IMenu} from "../../_types/IMenu";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";

/**
 * Handles deselect input events, deselecting the whole selection
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleDeselectInput(event: IKeyEvent, menu: IMenu): void | boolean {
    if (isDownEvent(event, "esc")) {
        const selection = menu.getSelected();
        if (selection.length > 0) {
            selection.forEach(item => menu.setSelected(item, false));
            return true;
        }
    }
}
