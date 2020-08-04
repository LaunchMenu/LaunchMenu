import {IKeyEventListener} from "../../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IMenu} from "../../_types/IMenu";
import {handleExecuteInput} from "./handleExecuteInput";
import {handleMoveInput} from "./handleMoveInput";
import {handleDeselectInput} from "./handleDeselectInput";
import {handleContextInput} from "./handleContextInput";
import {IKeyHandlerStack} from "../../../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IViewStack} from "../../../../stacks/_types/IViewStack";
import {IPartialIOContext} from "../../../../context/_types/IIOContext";

/**
 * Creates a standard menu key handler
 * @param menu The menu to create the handler for
 * @param ioContext The IO context to use to open the context menu
 * @param onExit The code to execute when trying to exit the menu
 * @returns The key handler that can be added to the input handler stack
 */
export function createMenuKeyHandler(
    menu: IMenu,
    ioContext: {
        panes: {menu: IViewStack};
        keyHandler: IKeyHandlerStack;
    } & IPartialIOContext,
    onExit?: () => void
): IKeyEventListener {
    return e => {
        if (handleExecuteInput(e, menu)) return true;
        if (handleMoveInput(e, menu)) return true;
        if (handleDeselectInput(e, menu)) return true;
        if (handleDeselectInput(e, menu)) return true;
        if (handleContextInput(e, menu, ioContext)) return true;
        if (onExit && e.is("esc")) {
            onExit();
            return true;
        }
    };
}
