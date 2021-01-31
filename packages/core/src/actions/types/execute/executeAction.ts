import {IIOContext} from "../../../context/_types/IIOContext";
import {Priority} from "../../../menus/menu/priority/Priority";
import {IPriority} from "../../../menus/menu/priority/_types/IPriority";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {contextMenuAction} from "../../contextMenuAction/contextMenuAction";
import {createAction} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {IExecutable, IExecutableResponse} from "./_types/IExecutable";
import {IItemExecuteCallback} from "./_types/IItemExecuteCallback";

const priority: IPriority = new Array(3).fill(Priority.HIGH);

/**
 * The action to execute the main function of menu items
 */
export const executeAction = createAction({
    name: "executeAction",
    parents: [contextMenuAction],
    core: function (executors: IExecutable[]) {
        const combineExecutables: IExecutable = async data => {
            const results = await Promise.all(
                executors.map(executable => executable(data))
            );

            const passive = results.some(
                result => result && "passive" in result && result.passive
            );
            const commands = results
                .map(result => (result && "command" in result ? result.command : result))
                .filter((cmd): cmd is ICommand => !!cmd);
            return {
                passive,
                command:
                    commands.length > 0
                        ? new CompoundCommand({name: "Execute"}, commands)
                        : undefined,
            };
        };

        // Dynamically create the standard item creator in order ro deal with circular dependencies
        const createStandardItemImport: typeof import("../../../menus/items/createStandardMenuItem") = require("../../../menus/items/createStandardMenuItem");

        return {
            result: combineExecutables,

            // Create a context menu item for this action, such that it also shows up in the context menu
            children: [
                contextMenuAction.createBinding({
                    action: this,
                    execute: [this.createBinding(combineExecutables)], // Gets passed to the context item
                    item: (execute: IActionBinding[]) => ({
                        priority,
                        item: createStandardItemImport.createStandardMenuItem({
                            icon: "play",
                            name: "Execute",
                            actionBindings: execute,
                        }),
                    }),
                }) as any,
            ],
        };
    },
    extras: {
        /** The context menu priority of the execute action */
        priority,
        /** An execute method that automatically dispatches commands, and take care of onExecute callback calling */
        execute: async function (
            this: IAction<IExecutable[], IExecutable>,
            context: IMenu | IIOContext,
            items?: IActionTarget[] | IItemExecuteCallback,
            onExecute?: IItemExecuteCallback
        ) {
            // Normalize the data
            let normalizedContext: IIOContext;
            let normalizedItems: IActionTarget[];
            let normalizedOnExecute: IItemExecuteCallback | undefined;
            if ("getAllSelected" in context) {
                normalizedContext = context.getContext();
                normalizedItems = context.getAllSelected();
                normalizedOnExecute = items as IItemExecuteCallback;
            } else {
                normalizedContext = context;
                normalizedItems = items as IActionTarget[];
                normalizedOnExecute = onExecute as IItemExecuteCallback;
            }

            // Execute the function
            const execute = this.get(normalizedItems);
            const result = await execute({context: normalizedContext});

            // Retrieve the command if any, and execute it
            const cmd = result && ("execute" in result ? result : result.command);
            if (cmd) normalizedContext.undoRedo.execute(cmd);

            // Execute the callback if not passive
            if (!(result && "passive" in result && result.passive)) {
                normalizedOnExecute?.(normalizedItems);
            }
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

        /**
         * Retrieves the command from an execution response
         * @param result The execution result to get the command from
         * @returns The command from the response, if any
         */
        getExecuteResponseCommand(result: IExecutableResponse): ICommand | undefined {
            return result ? ("execute" in result ? result : result.command) : undefined;
        },

        /**
         * Retrieves whether the execution was passive
         * @param result The execution result to get the passivity data from
         * @returns Whether the execution was passive
         */
        isExecuteResponsePassive(result: IExecutableResponse): boolean {
            return (result && "passive" in result && result.passive) || false;
        },
    },
});
