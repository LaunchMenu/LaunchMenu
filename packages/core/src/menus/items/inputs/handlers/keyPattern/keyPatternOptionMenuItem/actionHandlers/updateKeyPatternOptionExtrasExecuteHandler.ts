import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../../../../../../keyHandler/KeyPattern";
import {IDataHook} from "model-react";
import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {results} from "../../../../../../actions/Action";
import {IKeyName, keyNames} from "../../../../../../../keyHandler/keyIdentifiers/names";
import {multiSelectExecuteHandler} from "../../../../../../../uiLayers/types/multiSelect/multiSelectExecuteHandler";
import {IMultiSelectExecuteData} from "../../../../../../../uiLayers/types/multiSelect/_types/IMultiSelectExecuteData";
import {createMultiSelectMenuItem} from "../../../../../../../uiLayers/types/multiSelect/createMultiSelectMenuItem";

/**
 * An execute handler that can be used to update the allowed extra keys of a key pattern option
 */
export const updateKeyPatternOptionExtrasExecuteHandler = multiSelectExecuteHandler.createHandler(
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
                    undoable,
                    liveUpdate,
                    options: Object.values(keyNames),
                    createOptionView: (option, isSelected) =>
                        createMultiSelectMenuItem(isSelected, {name: option}),
                } as IMultiSelectExecuteData<IKeyName>)
        ),
    })
);
