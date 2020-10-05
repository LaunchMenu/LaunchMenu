import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../stacks/keyHandlerStack/KeyEvent";
import {executeItems} from "../executeItems";
import {KeyPattern} from "../../../items/inputs/handlers/keyPattern/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";

/**
 * Handles execute input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
 * @param pattern The key pattern to detect
 * @returns Whether the event was caught
 */
export function handleExecuteInput(
    event: KeyEvent,
    menu: IMenu,
    onExecute?: () => void,
    pattern: KeyPattern = menu
        .getContext()
        .settings.get(baseSettings)
        .controls.menu.execute.get()
): void | boolean {
    if (pattern.matches(event)) {
        executeItems(menu, onExecute);
        return true;
    }
}
