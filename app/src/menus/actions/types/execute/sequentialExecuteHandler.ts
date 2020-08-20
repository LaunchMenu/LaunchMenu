import {executeAction} from "./executeAction";
import {IExecutable} from "./_types/IExecutable";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {CompoundCommand} from "../../../../undoRedo/commands/CompoundCommand";

/**
 * An execution handler that handles all bindings in sequence, useful to show one UI after another
 */
export const sequentialExecuteHandler = executeAction.createHandler(
    (executors: IExecutable[]) => {
        return {
            execute: async () => {
                let commands = [] as ICommand[];
                for (let executor of executors) {
                    const res = await executor.execute();
                    if (res) commands.push(res);
                }
                if (commands.length > 0)
                    return new CompoundCommand({name: "Execute sequential"}, commands);
            },
        };
    }
);
