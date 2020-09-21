import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {KeyPattern} from "../../../items/inputs/handlers/keyPattern/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";

/**
 * Handles deselect input events, deselecting the whole selection
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param pattern The key pattern to detect
 * @returns Whether the event was caught
 */
export function handleDeselectInput(
    event: KeyEvent,
    menu: IMenu,
    pattern: KeyPattern = menu.getContext().settings.get(baseSettings).controls.back.get()
): void | boolean {
    if (pattern.matches(event)) {
        const selection = menu.getSelected();
        if (selection.length > 0) {
            selection.forEach(item => menu.setSelected(item, false));
            return true;
        }
    }
}
