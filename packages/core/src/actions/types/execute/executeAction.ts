import {IDataRetriever} from "model-react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {Priority} from "../../../menus/menu/priority/Priority";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {contextMenuAction} from "../../contextMenuAction/contextMenuAction";
import {createAction} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {IExecutable, IExecutableObject} from "./_types/IExecutable";
import {IItemExecuteCallback} from "./_types/IItemExecuteCallback";

/**
 * The action to execute the main function of menu items
 */
export const executeAction = createAction({
    name: "executeAction",
    parents: [contextMenuAction],
    core: function (executors: IExecutable[]) {
        const combineExecutables: IExecutable = {
            execute: async data => {
                const results = await Promise.all(
                    executors.map(executable =>
                        executable instanceof Function
                            ? executable(data)
                            : executable.execute(data)
                    )
                );
                const commands = results.filter(Boolean) as ICommand[];
                if (commands.length > 0)
                    return new CompoundCommand({name: "Execute"}, commands);
            },
            // The command is only passive if all children are passive too
            passive: Object.values(executors).reduce(
                (cur, e) => cur && !(e instanceof Function) && e.passive,
                true
            ),
        };

        return {
            result: combineExecutables,

            // Create a context menu item for this action, such that it also shows up in the context menu
            children: [
                (contextMenuAction as any).createBinding({
                    action: this,
                    execute: this.createBinding(combineExecutables), // Gets passed to the item
                    item: (execute: IActionBinding) => ({
                        priority: new Array(3).fill(Priority.HIGH),
                        item: createStandardMenuItem({
                            name: "Execute",
                            // actionBindings: execute?[execute]:[] // TODO: enable this
                        }),
                    }),
                }) as any,
            ],
        };
    },

    /** Creates a binding, without treating functions as subscribable data */
    createBinding: function (data: ISubscribable<IExecutable>, subscribable?: boolean) {
        if (subscribable) return {action: this, subscribableData: data};
        else return {action: this, data};
    } as {
        /**
         * Retrieves a binding for this action
         * @param data The executable data for the binding
         * @param subscribable Whether the passed data is a subscriber function
         * @returns The created binding
         */
        (data: IExecutable, subscribable?: false): IActionBinding<
            IAction<IExecutable, IExecutableObject>
        >;

        /**
         * Retrieves a binding for this action
         * @param data The retriever for the executable data for the binding
         * @param subscribable Whether the passed data is a subscriber function
         * @returns The created binding
         */
        (data: IDataRetriever<IExecutable>, subscribable: true): IActionBinding<
            IAction<IExecutable, IExecutableObject>
        >;
    },

    /** An execute method that automatically dispatches commands, and take care of onExecute callback calling */
    execute: async function (
        context: IMenu | IIOContext,
        items?: IActionTarget[] | IItemExecuteCallback,
        onExecute?: IItemExecuteCallback
    ) {
        // Setup a function to handle the callbacks
        let blockCallback = false;
        let exItems: IActionTarget[];
        const executeCallback = () => {
            if (!blockCallback) {
                if (items instanceof Function) items?.(exItems);
                else onExecute?.(exItems);
            }
            blockCallback = true; // Make sure to not perform the callback twice
        };

        let preventCount = 0; // Track how many executors temporarily prevented the callback
        const preventCallback = () => {
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
            exItems = [] || context.getAllSelected(); // TODO: menu items use new action interfaces
        } else {
            c = context;
            exItems = items as IActionTarget[];
        }
        const executable = this.get(exItems);
        blockCallback = executable.passive || false; // Block the callback if the executor is passive
        const cmd = await executable.execute({context: c, preventCallback});
        if (cmd) c.undoRedo.execute(cmd);

        // Close the menu if not prevented
        if (preventCount == 0) executeCallback();
    } as {
        /**
         * Executes the default actions of the selected items of the menu
         * @param menu The menu for which to execute the items
         * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
         */
        (menu: IMenu, onExecute?: IItemExecuteCallback): Promise<void>;

        /**
         * Executes the default actions of specified items
         * @param context The context the items can use
         * @param items The items for which to execute the default action
         * @param onExecute A callback to perform when an item executed (may be suppressed/delayed by an executable)
         */
        (
            context: IIOContext,
            items: IActionTarget[],
            onExecute?: IItemExecuteCallback
        ): Promise<void>;
    },
});
