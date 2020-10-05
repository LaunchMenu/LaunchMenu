import {Action} from "../../Action";
import {IExecutable} from "./_types/IExecutable";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {ExtendedObject} from "../../../../utils/ExtendedObject";

/**
 * The default execute action of any menu item
 */
export const executeAction = new Action((executors: IExecutable[]) => {
    return {
        execute: async data => {
            const results = await Promise.all(
                executors.map(executable => executable.execute(data))
            );
            const commands = results.filter(Boolean) as ICommand[];
            if (commands.length > 0)
                return new CompoundCommand({name: "Execute"}, commands);
        },
        // The command is only passive if all children are passive too
        passive: Object.values(executors).reduce((cur, e) => cur && e.passive, true),
    } as IExecutable;
}, []);
