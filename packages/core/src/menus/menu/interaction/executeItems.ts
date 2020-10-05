import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {executeAction} from "../../actions/types/execute/executeAction";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IExecutable} from "../../actions/types/execute/_types/IExecutable";
import {IOContext} from "../../../context/IOContext";
import {IMenuItemActionBindings} from "../../actions/_types/IMenuItemActionBindings";

/**
 * Executes the default actions of the selected items of the menu
 * @param menu The menu for which to execute the items
 * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
 */
export async function executeItems(menu: IMenu, onExecute?: () => void): Promise<void>;

/**
 * Executes the default actions of specified items
 * @param context The context the items can use
 * @param items The items for which to execute the default action
 * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
 */
export async function executeItems(
    context: IIOContext,
    items: (IMenuItem | IMenuItemActionBindings)[],
    onExecute?: () => void
): Promise<void>;
export async function executeItems(
    context: IMenu | IIOContext,
    items?: (IMenuItem | IMenuItemActionBindings)[] | (() => void),
    onExecute?: () => void
): Promise<void> {
    // Setup function to handle closing of the parent menu
    let blockCallback = false;
    const executeCallback = () => {
        if (!blockCallback) {
            if (items instanceof Function) items?.();
            else onExecute?.();
        }
        blockCallback = true; // Make sure to not perform the callback twice
    };

    let preventCount = 0; // Track how many executors temporarily prevented the callback
    const preventCallback = (active: boolean = false) => {
        preventCount++;
        return () => {
            preventCount--;
            if (preventCount == 0) executeCallback();
        };
    };

    // Execute the command
    let executable: IExecutable;
    let c: IIOContext;
    if ("getAllSelected" in context) {
        c = context.getContext();
        executable = executeAction.get(context.getAllSelected());
    } else {
        c = context;
        executable = executeAction.get(items as IMenuItem[]);
    }
    blockCallback = executable.passive || false; // Block the callback if the executor is passive
    const cmd = await executable.execute({context: c, preventCallback});
    if (cmd) c.undoRedo.execute(cmd);

    // Close the menu if not prevented
    if (preventCount == 0) executeCallback();
}
