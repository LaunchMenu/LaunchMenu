import {executeAction} from "../../execute/executeAction";
import {IExecutable} from "../../execute/_types/IExecutable";
import {createContextAction} from "../../../contextMenuAction/createContextAction";

/** An execute handler to paste data */
export const pasteExecuteHandler = createContextAction({
    name: "Execute paste",
    contextItem: {
        priority: executeAction.priority,
        icon: "paste",
        name: "Paste",
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
