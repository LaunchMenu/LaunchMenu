import {IMenu} from "../../_types/IMenu";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {executeItems} from "../executeItems";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IMenuItemExecuteCallback} from "../../_types/IMenuItemExecuteCallback";

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
    onExecute?: IMenuItemExecuteCallback,
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
