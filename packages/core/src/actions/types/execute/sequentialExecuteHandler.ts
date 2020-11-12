import {CompoundCommand} from "../../../undoRedo/commands/CompoundCommand";
import {ICommand} from "../../../undoRedo/_types/ICommand";
import {createAction} from "../../createAction";
import {executeAction} from "./executeAction";
import {IExecutable} from "./_types/IExecutable";

/**
 * An execution handler that handles all bindings in sequence, useful to show one UI after another
 */
export const sequentialExecuteHandler = createAction({
    name: "sequential execute handler",
    parents: [executeAction],
    core: (executors: IExecutable[]) => ({
        children: [
            executeAction.createBinding(async context => {
                let commands = [] as ICommand[];
                for (let executor of executors) {
                    const res = await (executor instanceof Function
                        ? executor(context)
                        : executor.execute(context));
                    if (res) commands.push(res);
                }
                if (commands.length > 0)
                    return new CompoundCommand({name: "Execute sequential"}, commands);
            }),
        ],
    }),
});
