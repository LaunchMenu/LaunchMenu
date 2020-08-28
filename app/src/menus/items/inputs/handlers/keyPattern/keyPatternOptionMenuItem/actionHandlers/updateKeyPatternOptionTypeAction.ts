import {IUpdateKeyPatternOptionTypeExecuteData} from "../_types/IUpdateKeyPatternOptionTypeExecuteData";
import {updateKeyPatternOptionTypeExecuteHandler} from "./updateKeyPatternOptionTypeExecuteHandler";
import {createContextAction} from "../../../../../../actions/contextAction/createContextAction";
import {Action} from "../../../../../../actions/Action";
import {executeAction} from "../../../../../../actions/types/execute/executeAction";
import {IIOContext} from "../../../../../../../context/_types/IIOContext";

/**
 * An action to update the event type of a key pattern option
 */
export const updateKeyPatternOptionTypeAction = new Action(
    createContextAction(
        (data: IUpdateKeyPatternOptionTypeExecuteData[], items) => ({
            execute: ({context}: {context: IIOContext}) => {
                const bindings = data.flatMap((data, i) =>
                    items[i].map(item => ({
                        item,
                        actionBindings: [
                            updateKeyPatternOptionTypeExecuteHandler.createBinding(data),
                        ],
                    }))
                );
                return executeAction.get(bindings).execute(context);
            },
        }),
        {name: "Update event type"}
    )
);
