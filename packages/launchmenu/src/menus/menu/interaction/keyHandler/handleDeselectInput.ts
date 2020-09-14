import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";

/**
 * Handles deselect input events, deselecting the whole selection
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @returns Whether the event was caught
 */
export function handleDeselectInput(event: KeyEvent, menu: IMenu): void | boolean {
    if (event.is("esc")) {
        const selection = menu.getSelected();
        if (selection.length > 0) {
            selection.forEach(item => menu.setSelected(item, false));
            return true;
        }
    }
}
