import {createContextAction} from "../../../contextMenuAction/createContextAction";
import {executeAction} from "../executeAction";
import {sequentialExecuteHandler} from "../sequentialExecuteHandler";
import {IExecutable} from "../_types/IExecutable";

/** An execute handler meant for sequentially editing fields. Automatically shows an appropriate 'execute' item in the context menu */
export const editExecuteHandler = createContextAction({
    name: "Edit execute handler",
    contextItem: {
        name: "Edit",
        icon: "edit",
        priority: executeAction.priority,
    },
    parents: [sequentialExecuteHandler],
    core: (executors: IExecutable[]) => ({
        children: executors.map(executor =>
            sequentialExecuteHandler.createBinding(executor)
        ),
    }),
});
