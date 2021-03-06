import {IUpdateKeyPatternOptionExecuteData} from "../_types/IUpdateKeyPatternOptionExecuteData";
import {createKeyPatternFieldKeyHandler} from "../../createKeyPatternFieldKeyHandler";
import {getKeyPatternOptionIndex} from "../getKeyPatternOptionIndex";
import {KeyPattern} from "../../../../../../../keyHandler/KeyPattern";
import {ICommand} from "../../../../../../../undoRedo/_types/ICommand";
import {TextField} from "../../../../../../../textFields/TextField";
import {SetFieldCommand} from "../../../../../../../undoRedo/commands/SetFieldCommand";
import {UILayer} from "../../../../../../../uiLayers/standardUILayer/UILayer";
import {createAction} from "../../../../../../../actions/createAction";
import {editExecuteHandler} from "../../../../../../../actions/types/execute/types/editExecuteHandler";

/**
 * A execute handler that can be used to set the key pattern of a field
 */
export const updateKeyPatternOptionExecuteHandler = createAction({
    name: "Update key pattern",
    parents: [editExecuteHandler],
    core: (data: IUpdateKeyPatternOptionExecuteData[]) => ({
        children: data.map(({option, patternField, undoable, insertIfDeleted}) =>
            editExecuteHandler.createBinding(
                ({context}) =>
                    new Promise<ICommand | void>(res => {
                        const textField = new TextField();
                        context.open(
                            new UILayer((context, close) => ({
                                field: textField,
                                fieldHandler: createKeyPatternFieldKeyHandler(
                                    textField,
                                    () => {
                                        const newOptionPattern = textField.get();
                                        const newOption = {
                                            ...option,
                                            pattern: newOptionPattern,
                                        };
                                        const pattern = patternField.get();
                                        const newIndex = getKeyPatternOptionIndex(
                                            pattern,
                                            option
                                        );

                                        if (newIndex != -1 || insertIfDeleted) {
                                            const newPatternData =
                                                newIndex != -1
                                                    ? pattern.patterns.map((v, i) =>
                                                          i == newIndex ? newOption : v
                                                      )
                                                    : [...pattern.patterns, newOption];

                                            const newPattern = new KeyPattern(
                                                newPatternData
                                            );
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
                            }))
                        );
                    })
            )
        ),
    }),
});
