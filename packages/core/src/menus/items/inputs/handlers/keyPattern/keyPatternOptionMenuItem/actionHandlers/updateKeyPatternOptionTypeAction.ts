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
    name: "Update pattern trigger type",
    contextItem: {
        priority: [Priority.HIGH, 2],
    },
    core: (data: IUpdateKeyPatternOptionTypeExecuteData[]) => {
        const execute: IExecutable = ({context}) => {
            const bindings = data.map((data, i) => ({
                actionBindings: [
                    updateKeyPatternOptionTypeExecuteHandler.createBinding(data),
                ],
            }));
            return executeAction.execute(context, bindings);
        };
        return {
            execute,
            result: {execute},
        };
    },
});
