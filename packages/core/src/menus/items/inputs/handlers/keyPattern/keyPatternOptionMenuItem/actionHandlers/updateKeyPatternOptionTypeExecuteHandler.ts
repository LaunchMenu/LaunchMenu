import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../../../../../../keyHandler/KeyPattern";
import {IUpdateKeyPatternOptionTypeExecuteData} from "../_types/IUpdateKeyPatternOptionTypeExecuteData";
import {IKeyPatternEventType} from "../../_types/IKeyPatternEventType";
import {IDataHook} from "model-react";
import {results} from "../../../../../../actions/Action";
import {createStandardMenuItem} from "../../../../../createStandardMenuItem";
import {selectExecuteHandler} from "../../../../../../../uiLayers/types/select/selectExecuteHandler";
import {ISelectExecuteData} from "../../../../../../../uiLayers/types/select/_types/ISelectExecuteData";

/**
 * An execute handler that can be used to set the event type of a key pattern option
 */
export const updateKeyPatternOptionTypeExecuteHandler = selectExecuteHandler.createHandler(
    (data: IUpdateKeyPatternOptionTypeExecuteData[]) => ({
        [results]: data.map(
            ({
                option,
                patternField,
                liveUpdate,
                undoable,
            }): ISelectExecuteData<string> => ({
                field: {
                    set: (value: IKeyPatternEventType) => {
                        const pattern = patternField.get(null);
                        const index = getKeyPatternOptionIndex(pattern, option);
                        if (index != -1) {
                            const newPattern = pattern.patterns.map(
                                ({pattern, type, allowExtra}, i) => ({
                                    pattern,
                                    allowExtra,
                                    type: i == index ? value : type,
                                })
                            );
                            patternField.set(new KeyPattern(newPattern));
                        }
                    },
                    get: (hook: IDataHook) => {
                        const pattern = patternField.get(hook);
                        const index = getKeyPatternOptionIndex(pattern, option);
                        if (index != -1) return pattern.patterns[index].type;
                        return option.type;
                    },
                },
                undoable,
                liveUpdate,
                options: ["down", "up", "repeat", "down or repeat"],
                createOptionView: option => createStandardMenuItem({name: option}),
            })
        ),
    })
);
