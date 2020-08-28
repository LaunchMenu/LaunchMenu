import {sequentialExecuteHandler} from "../../../menus/actions/types/execute/sequentialExecuteHandler";
import {IAdvancedKeyInputExecuteData} from "./_types/IAdvancedKeyInputExecuteData";
import {results} from "../../../menus/actions/Action";
import {updateKeyPatternOptionExecuteHandler} from "./keyPatternOptionMenuItem/actionHandlers/updateKeyPatternOptionExecuteHandler";
import {executeAction} from "../../../menus/actions/types/execute/executeAction";
import {advancedKeyInputEditAction} from "./advancedKeyInputEditAction";

/**
 * The standard key input execute handler, which either opens the advanced editor or allows you to quickly update the pattern if there is only 1
 */
export const keyInputExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IAdvancedKeyInputExecuteData[], itemSets) => ({
        [results]: data.map((binding, i) => ({
            execute: () => {
                const pattern = binding.field.get(null);
                const items = itemSets[i];

                // Execute the update pattern action if there is only 1 pattern
                if (pattern.patterns.length <= 1) {
                    const mappedItems = items.map(item => ({
                        item,
                        actionBindings: [
                            updateKeyPatternOptionExecuteHandler.createBinding({
                                patternField: binding.field,
                                option: pattern.patterns[0],
                                ...binding,
                            }),
                        ],
                    }));
                    return executeAction.get(mappedItems).execute();
                }
                // If there are multiple patterns, enter the advanced editor
                else {
                    const mappedItems = items.map(item => ({
                        item,
                        actionBindings: [
                            advancedKeyInputEditAction.createBinding(binding),
                        ],
                    }));
                    return advancedKeyInputEditAction.get(mappedItems).execute();
                }
            },
        })),
    })
);
