import {Action} from "../../Action";
import {IExecutable} from "./_types/IExecutable";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../../undoRedo/_types/ICommand";

/**
 * The default execute action of any menu item
 */
export const executeAction = new Action((executors: IExecutable[]) => {
    return {
        execute: async context => {
            const results = await Promise.all(
                executors.map(executable => executable.execute(context))
            );
            const commands = results.filter(Boolean) as ICommand[];
            if (commands.length > 0)
                return new CompoundCommand({name: "Execute"}, commands);
        },
    } as IExecutable;
}, []);
