import {IMenu} from "../../_types/IMenu";
import {openContextMenu} from "../../../contextMenu/openContextMenu";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";

/**
 * Handles context menu opening input events
 * @param event The event to test
 * @param menu The menu to perform the event for
 * @param pattern The key pattern to detect
 * @param ioContext The IO context to use to open the context menu
 * @returns Whether the event was caught
 */
export function handleContextInput(
    event: KeyEvent,
    menu: IMenu,
    pattern: KeyPattern = menu
        .getContext()
        .settings.get(baseSettings)
        .controls.menu.openContextMenu.get(),
    ioContext: IIOContext = menu.getContext()
): void | boolean {
    if (pattern.matches(event)) {
        openContextMenu(menu, ioContext);
        return true;
    }
}
