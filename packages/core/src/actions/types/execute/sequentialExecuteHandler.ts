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
            executeAction.createBinding(async data => {
                let passive = false;
                let commands = [] as ICommand[];
                for (let executor of executors) {
                    const res = await executor(data);
                    const cmd = executeAction.getExecuteResponseCommand(res);
                    if (cmd) commands.push(cmd);
                    if (executeAction.isExecuteResponsePassive(res)) passive = true;
                }

                return {
                    passive,
                    command:
                        commands.length > 0
                            ? new CompoundCommand({name: "Execute sequential"}, commands)
                            : undefined,
                };
            }),
        ],
    }),
});
