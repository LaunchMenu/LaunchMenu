import {Action} from "../../../../../menus/actions/Action";
import {createContextAction} from "../../../../../menus/actions/contextAction/createContextAction";
import {executeAction} from "../../../../../menus/actions/types/execute/executeAction";
import {IUpdateKeyPatternOptionTypeExecuteData} from "../_types/IUpdateKeyPatternOptionTypeExecuteData";
import {updateKeyPatternOptionTypeExecuteHandler} from "./updateKeyPatternOptionTypeExecuteHandler";

/**
 * An action to update the event type of a key pattern option
 */
export const updateKeyPatternOptionTypeAction = new Action(
    createContextAction(
        (data: IUpdateKeyPatternOptionTypeExecuteData[], items) => ({
            execute: () => {
                const bindings = data.flatMap((data, i) =>
                    items[i].map(item => ({
                        item,
                        actionBindings: [
                            updateKeyPatternOptionTypeExecuteHandler.createBinding(data),
                        ],
                    }))
                );
                return executeAction.get(bindings).execute();
            },
        }),
        {name: "Update event type"}
    )
);
