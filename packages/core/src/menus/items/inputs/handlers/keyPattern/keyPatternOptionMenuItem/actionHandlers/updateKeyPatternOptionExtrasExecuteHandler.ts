import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../../../../../../keyHandler/KeyPattern";
import {IDataHook} from "model-react";
import {IUpdateKeyPatternOptionExtrasExecuteData} from "../_types/IUpdateKeyPatternOptionExtrasExecuteData";
import {IKeyName, keyNames} from "../../../../../../../keyHandler/keyIdentifiers/names";
import {multiSelectExecuteHandler} from "../../../../../../../uiLayers/types/multiSelect/multiSelectExecuteHandler";
import {createMultiSelectMenuItem} from "../../../../../../../uiLayers/types/multiSelect/createMultiSelectMenuItem";
import {createAction} from "../../../../../../../actions/createAction";

/**
 * An execute handler that can be used to update the allowed extra keys of a key pattern option
 */
export const updateKeyPatternOptionExtrasExecuteHandler = createAction({
    name: "update key pattern option extras handler",
    parents: [multiSelectExecuteHandler],
    core: (data: IUpdateKeyPatternOptionExtrasExecuteData[]) => ({
        children: data.map(({option, patternField, liveUpdate, undoable}) =>
            multiSelectExecuteHandler.createBinding<IKeyName>({
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
                            return (
                                (pattern.patterns[index].allowExtra as IKeyName[]) || []
                            );
                        return (option.allowExtra as IKeyName[]) || [];
                    },
                },
                undoable,
                liveUpdate,
                options: Object.values(keyNames),
                createOptionView: (option, isSelected) =>
                    createMultiSelectMenuItem(isSelected, {name: option}),
            })
        ),
    }),
});
