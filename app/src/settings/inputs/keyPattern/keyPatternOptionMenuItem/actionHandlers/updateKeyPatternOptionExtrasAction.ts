import {Action} from "../../../../../menus/actions/Action";
import {createContextAction} from "../../../../../menus/actions/contextAction/createContextAction";
import {executeAction} from "../../../../../menus/actions/types/execute/executeAction";
import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {updateKeyPatternOptionExtrasExecuteHandler} from "./updateKeyPatternOptionExtrasExecuteHandler";

/**
 * An action to update the extra keys that are allowed of a key pattern option
 */
export const updateKeyPatternOptionExtrasAction = new Action(
    createContextAction(
        (data: IUpdateKeyPatternOptionExtrasExecuteData[], items) => ({
            execute: () => {
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
                return executeAction.get(bindings).execute();
            },
        }),
        {name: "Update allowed extra keys"}
    )
);
