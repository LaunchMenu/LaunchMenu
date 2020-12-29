import {IAdvancedKeyInputExecuteData} from "./_types/IAdvancedKeyInputExecuteData";
import {updateKeyPatternOptionExecuteHandler} from "./keyPatternOptionMenuItem/actionHandlers/updateKeyPatternOptionExecuteHandler";
import {advancedKeyInputEditAction} from "./advancedKeyInputEditAction";
import {createAction} from "../../../../../actions/createAction";
import {sequentialExecuteHandler} from "../../../../../actions/types/execute/sequentialExecuteHandler";
import {executeAction} from "../../../../../actions/types/execute/executeAction";

/**
 * The standard key input execute handler, which either opens the advanced editor or allows you to quickly update the pattern if there is only 1
 */
export const keyInputExecuteHandler = createAction({
    name: "key input execute handler",
    parents: [sequentialExecuteHandler],
    core: (data: IAdvancedKeyInputExecuteData[]) => ({
        children: data.map((binding, i) =>
            sequentialExecuteHandler.createBinding({
                execute: ({context}) => {
                    const pattern = binding.field.get(null);

                    // Execute the update pattern action if there is only 1 pattern
                    if (pattern.patterns.length <= 1) {
                        return executeAction
                            .get([
                                {
                                    actionBindings: [
                                        updateKeyPatternOptionExecuteHandler.createBinding(
                                            {
                                                patternField: binding.field,
                                                option: pattern.patterns[0],
                                                insertIfDeleted: true,
                                                ...binding,
                                            }
                                        ),
                                    ],
                                },
                            ])
                            .execute({context});
                    }

                    // If there are multiple patterns, enter the advanced editor
                    else {
                        return advancedKeyInputEditAction
                            .get([
                                {
                                    actionBindings: [
                                        advancedKeyInputEditAction.createBinding(binding),
                                    ],
                                },
                            ])
                            .execute({context});
                    }
                },
            })
        ),
    }),
});
