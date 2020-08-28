import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {updateKeyPatternOptionExtrasExecuteHandler} from "./updateKeyPatternOptionExtrasExecuteHandler";
import {Action} from "../../../../../../actions/Action";
import {createContextAction} from "../../../../../../actions/contextAction/createContextAction";
import {executeAction} from "../../../../../../actions/types/execute/executeAction";
import {IExecutable} from "../../../../../../actions/types/execute/_types/IExecutable";

/**
 * An action to update the extra keys that are allowed of a key pattern option
 */
export const updateKeyPatternOptionExtrasAction = new Action(
    createContextAction(
        (data: IUpdateKeyPatternOptionExtrasExecuteData[], items): IExecutable => ({
            execute: args => {
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
                return executeAction.get(bindings).execute(args);
            },
        }),
        {name: "Update allowed extra keys"}
    )
);
