import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {updateKeyPatternOptionExtrasExecuteHandler} from "./updateKeyPatternOptionExtrasExecuteHandler";
import {Action} from "../../../../../../actions/Action";
import {createContextAction} from "../../../../../../actions/contextAction/createContextAction";
import {executeAction} from "../../../../../../actions/types/execute/executeAction";
import {IIOContext} from "../../../../../../../context/_types/IIOContext";

/**
 * An action to update the extra keys that are allowed of a key pattern option
 */
export const updateKeyPatternOptionExtrasAction = new Action(
    createContextAction(
        (data: IUpdateKeyPatternOptionExtrasExecuteData[], items) => ({
            execute: ({context}: {context: IIOContext}) => {
                const bindings = data.flatMap((data, i) =>
                    items[i].map(item => ({
                        item,
                        actionBindings: [
                            updateKeyPatternOptionExtrasExecuteHandler.createBinding(
                                data
                            ),
                        ],
                    }))
                );
                return executeAction.get(bindings).execute(context);
            },
        }),
        {name: "Update allowed extra keys"}
    )
);
