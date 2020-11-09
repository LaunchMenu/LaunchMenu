import {createContextAction} from "../../../../../../../actions/contextMenuAction/createContextAction";
import {executeAction} from "../../../../../../../actions/types/execute/executeAction";
import {IExecutable} from "../../../../../../../actions/types/execute/_types/IExecutable";
import {Priority} from "../../../../../../menu/priority/Priority";
import {IUpdateKeyPatternOptionTypeExecuteData} from "../_types/IUpdateKeyPatternOptionTypeExecuteData";
import {updateKeyPatternOptionTypeExecuteHandler} from "./updateKeyPatternOptionTypeExecuteHandler";

/**
 * An action to update the event type of a key pattern option
 */
export const updateKeyPatternOptionTypeAction = createContextAction({
    name: "update pattern extras",
    contextItem: {
        priority: [Priority.HIGH, 2],
    },
    core: (data: IUpdateKeyPatternOptionTypeExecuteData[]) => {
        const execute: IExecutable = args => {
            const bindings = data.map((data, i) => ({
                actionBindings: [
                    updateKeyPatternOptionTypeExecuteHandler.createBinding(data),
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
