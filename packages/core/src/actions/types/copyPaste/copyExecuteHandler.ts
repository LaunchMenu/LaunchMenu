import {executeAction} from "../execute/executeAction";
import {IExecutable} from "../execute/_types/IExecutable";
import {createContextAction} from "../../contextMenuAction/createContextAction";

/** An execute handler to copy items */
export const copyExecuteHandler = createContextAction({
    name: "Execute copy",
    contextItem: {
        priority: executeAction.priority,
        icon: "copy",
        name: "Copy",
    },
    override: executeAction,
    parents: [executeAction],
    core: (executables: IExecutable[]) => {
        const executeBindings = executables.map(executable =>
            executeAction.createBinding(executable)
        );
        return {
            result: executeBindings,
            children: executeBindings,
        };
    },
});
