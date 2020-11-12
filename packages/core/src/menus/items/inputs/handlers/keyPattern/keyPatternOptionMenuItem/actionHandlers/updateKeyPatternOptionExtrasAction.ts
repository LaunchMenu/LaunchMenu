import {createContextAction} from "../../../../../../../actions/contextMenuAction/createContextAction";
import {executeAction} from "../../../../../../../actions/types/execute/executeAction";
import {IExecutable} from "../../../../../../../actions/types/execute/_types/IExecutable";
import {Priority} from "../../../../../../menu/priority/Priority";
import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {updateKeyPatternOptionExtrasExecuteHandler} from "./updateKeyPatternOptionExtrasExecuteHandler";

/**
 * An action to update the extra keys that are allowed of a key pattern option
 */
export const updateKeyPatternOptionExtrasAction = createContextAction({
    name: "Update pattern extras",
    contextItem: {
        priority: [Priority.HIGH, 1],
    },
    core: (data: IUpdateKeyPatternOptionExtrasExecuteData[]) => {
        const execute: IExecutable = args => {
            const bindings = data.map(data => ({
                actionBindings: [
                    updateKeyPatternOptionExtrasExecuteHandler.createBinding(data),
                ],
            }));
            return executeAction.get(bindings).execute(args);
        };
        return {
            execute,
            result: {execute},
        };
    },
});
