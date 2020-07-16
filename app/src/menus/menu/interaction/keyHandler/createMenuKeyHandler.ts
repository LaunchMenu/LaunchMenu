import {IKeyEventListener} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {handleMoveInput} from "./handleMoveInput";
import {isDownEvent} from "../../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";
import {handleDeselectInput} from "./handleDeselectInput";
import {ViewStack} from "../../../../stacks/ViewStack";
import {KeyHandlerStack} from "../../../../stacks/keyHandlerStack/KeyHandlerStack";
import {handleContextInput} from "./handleContextInput";

/**
 * Creates a standard menu key handler
 * @param menu The menu to create the handler for
 * @param viewStack The view stack to add the context menu to
 * @param inputStack The key input handler stack
 * @param onExit The code to execute when trying to exit the menu
 * @returns The key handler that can be added to the input handler stack
 */
export function createMenuKeyHandler(
    menu: IMenu,
    viewStack: ViewStack,
    inputStack: KeyHandlerStack,
    onExit?: () => void
): IKeyEventListener {
    return e => {
        if (handleExecuteInput(e, menu)) return true;
        if (handleMoveInput(e, menu)) return true;
        if (handleDeselectInput(e, menu)) return true;
        if (handleDeselectInput(e, menu)) return true;
        if (handleContextInput(e, menu, viewStack, inputStack)) return true;
        if (onExit && isDownEvent(e, "esc")) {
            onExit();
            return true;
        }
    };
}
