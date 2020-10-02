import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../KeyPattern";
import {IUpdateKeyPatternOptionTypeExecuteData} from "../_types/IUpdateKeyPatternOptionTypeExecuteData";
import {IKeyPatternEventType} from "../../_types/IKeyPatternEventType";
import {IDataHook} from "model-react";
import {selectFieldExecuteHandler} from "../../../../../../../textFields/types/selectField/selectFieldExecuteHandler";
import {results} from "../../../../../../actions/Action";
import {createStandardMenuItem} from "../../../../../createStandardMenuItem";
import {ISelectFieldExecuteData} from "../../../../../../../textFields/types/selectField/_types/ISelectFieldExecuteData";

/**
 * An execute handler that can be used to set the event type of a key pattern option
 */
export const updateKeyPatternOptionTypeExecuteHandler = selectFieldExecuteHandler.createHandler(
    (data: IUpdateKeyPatternOptionTypeExecuteData[]) => ({
        [results]: data.map(
            ({option, patternField, liveUpdate, undoable}) =>
                ({
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
                    undoable: undoable as any,
                    config: {
                        liveUpdate,
                        options: ["down", "up", "repeat", "down or repeat"],
                        createOptionView: option =>
                            createStandardMenuItem({name: option}),
                    },
                } as ISelectFieldExecuteData<string>)
        ),
    })
);
