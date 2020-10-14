import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../KeyPattern";
import {IDataHook} from "model-react";
import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {results} from "../../../../../../actions/Action";
import {multiSelectFieldExecuteHandler} from "../../../../../../../textFields/types/multiselectField/multiSelectFieldExecuteHandler";
import {IMultiSelectFieldExecuteData} from "../../../../../../../textFields/types/multiselectField/_types/IMultiSelectFieldExecuteData";
import {IKeyName, keyNames} from "../../../../../../../keyHandler/keyIdentifiers/names";
import {createMultiSelectMenuItem} from "../../../../../../../textFields/types/multiselectField/createMultiSelectMenuItem";

/**
 * An execute handler that can be used to update the allowed extra keys of a key pattern option
 */
export const updateKeyPatternOptionExtrasExecuteHandler = multiSelectFieldExecuteHandler.createHandler(
    (data: IUpdateKeyPatternOptionExtrasExecuteData[]) => ({
        [results]: data.map(
            ({option, patternField, liveUpdate, undoable}) =>
                ({
                    field: {
                        set: value => {
                            const pattern = patternField.get(null);
                            const index = getKeyPatternOptionIndex(pattern, option);
                            if (index != -1) {
                                const newPattern = pattern.patterns.map(
                                    ({pattern, type, allowExtra}, i) => ({
                                        pattern,
                                        type,
                                        allowExtra: i == index ? value : allowExtra,
                                    })
                                );
                                patternField.set(new KeyPattern(newPattern));
                            }
                        },
                        get: (hook: IDataHook) => {
                            const pattern = patternField.get(hook);
                            const index = getKeyPatternOptionIndex(pattern, option);
                            if (index != -1)
                                return pattern.patterns[index].allowExtra || [];
                            return option.allowExtra || [];
                        },
                    },
                    undoable: undoable as any,
                    config: {
                        liveUpdate,
                        options: Object.values(keyNames),
                        createOptionView: (option, isSelected) =>
                            createMultiSelectMenuItem(isSelected, {name: option}),
                    },
                } as IMultiSelectFieldExecuteData<IKeyName>)
        ),
    })
);
