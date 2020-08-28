import {sequentialExecuteHandler} from "../../../../../menus/actions/types/execute/sequentialExecuteHandler";
import {results} from "../../../../../menus/actions/Action";
import {IUpdateKeyPatternOptionExecuteData} from "../_types/IUpdateKeyPatternOptionExecuteData";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {TextField} from "../../../../../textFields/TextField";
import {createKeyPatternFieldKeyHandler} from "../../createKeyPatternFieldKeyHandler";
import {openUI} from "../../../../../context/openUI/openUI";
import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../KeyPattern";
import {SetFieldCommand} from "../../../../../undoRedo/commands/SetFieldCommand";

/**
 * A execute handler that can be used to set the key pattern of a field
 */
export const updateKeyPatternOptionExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IUpdateKeyPatternOptionExecuteData[]) => ({
        [results]: data.map(
            ({
                context,
                option,
                patternField,
                undoable,
                insertIfDeleted: insertIfDelete,
            }) => ({
                execute: () =>
                    new Promise<ICommand | void>(res => {
                        const textField = new TextField();
                        const close = openUI(context, {
                            field: textField,
                            fieldHandler: createKeyPatternFieldKeyHandler(
                                textField,
                                () => {
                                    const newOptionPattern = textField.get();
                                    const newOption = {
                                        ...option,
                                        pattern: newOptionPattern,
                                    };
                                    const pattern = patternField.get(null);
                                    const newIndex = getKeyPatternOptionIndex(
                                        pattern,
                                        option
                                    );

                                    if (newIndex != -1 || insertIfDelete) {
                                        const newPatternData =
                                            newIndex != -1
                                                ? pattern.patterns.map((v, i) =>
                                                      i == newIndex ? newOption : v
                                                  )
                                                : [...pattern.patterns, newOption];

                                        const newPattern = new KeyPattern(newPatternData);
                                        if (undoable) {
                                            res(
                                                new SetFieldCommand(
                                                    patternField,
                                                    newPattern
                                                )
                                            );
                                        } else {
                                            patternField.set(newPattern);
                                            res();
                                        }
                                    } else {
                                        res();
                                    }
                                    close();
                                }
                            ),
                        });
                    }),
            })
        ),
    })
);
