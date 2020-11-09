import {IContextExecuteData} from "../../../context/_types/IContextExecuteData";
import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {createContextAction} from "../../contextMenuAction/createContextAction";
import {IResetable} from "./_types/IResetable";

/**
 * The default reset action of any menu item
 */
export const resetAction = createContextAction({
    name: "reset",
    core: (executors: IResetable[]) => {
        /**
         * Resets the passed items
         * @param data The data used for executing the reset
         * @returns A command for undoable resets
         */
        const reset = async (data: IContextExecuteData) => {
            const results = await Promise.all(
                executors.map(executable => executable(data))
            );
            const commands = results.filter(Boolean) as ICommand[];
            if (commands.length > 0)
                return new CompoundCommand({name: "Execute"}, commands);
        };
        return {
            execute: reset,
            result: {reset},
        };
    },
});
