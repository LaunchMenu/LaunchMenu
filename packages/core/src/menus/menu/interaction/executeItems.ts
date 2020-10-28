import {IMenu} from "../_types/IMenu";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {executeAction} from "../../actions/types/execute/executeAction";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IMenuItemActionBindings} from "../../actions/_types/IMenuItemActionBindings";
import {IMenuItemExecuteCallback} from "../_types/IMenuItemExecuteCallback";

/**
 * Executes the default actions of the selected items of the menu
 * @param menu The menu for which to execute the items
 * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
 */
export async function executeItems(
    menu: IMenu,
    onExecute?: IMenuItemExecuteCallback
): Promise<void>;

/**
 * Executes the default actions of specified items
 * @param context The context the items can use
 * @param items The items for which to execute the default action
 * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
 */
export async function executeItems(
    context: IIOContext,
    items: (IMenuItem | IMenuItemActionBindings)[],
    onExecute?: IMenuItemExecuteCallback
): Promise<void>;
export async function executeItems(
    context: IMenu | IIOContext,
    items?: (IMenuItem | IMenuItemActionBindings)[] | IMenuItemExecuteCallback,
    onExecute?: IMenuItemExecuteCallback
): Promise<void> {
    // Setup function to handle closing of the parent menu
    let blockCallback = false;
    let exItems: IMenuItem[];
    const executeCallback = () => {
        if (!blockCallback) {
            if (items instanceof Function) items?.(exItems);
            else onExecute?.(exItems);
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
    let c: IIOContext;
    if ("getAllSelected" in context) {
        c = context.getContext();
        exItems = context.getAllSelected();
    } else {
        c = context;
        exItems = items as IMenuItem[];
    }
    const executable = executeAction.get(exItems);
    blockCallback = executable.passive || false; // Block the callback if the executor is passive
    const cmd = await executable.execute({context: c, preventCallback});
    if (cmd) c.undoRedo.execute(cmd);

    // Close the menu if not prevented
    if (preventCount == 0) executeCallback();
}
