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
import {globalKeyHandler} from "../../../../../../../keyHandler/globalKeyHandler/globalKeyHandler";
import {ITextField} from "../../../../../../../textFields/_types/ITextField";
import {SelectKeyInputLayer} from "./SelectKeyInputLayer";

/**
 * A execute handler that can be used to set the key pattern of a field
 */
export const updateKeyPatternOptionExecuteHandler = createAction({
    name: "Update key pattern",
    parents: [editExecuteHandler],
    core: (data: IUpdateKeyPatternOptionExecuteData[]) => ({
        children: data.map(bindingData =>
            editExecuteHandler.createBinding(
                ({context}) =>
                    new Promise<ICommand | void>(res => {
                        const textField = new TextField();
                        context.open(
                            new SelectKeyInputLayer({
                                textField,
                                onClose: createFieldUpdateCallback(
                                    textField,
                                    bindingData,
                                    res
                                ),
                                globalShortcut: bindingData.globalShortcut,
                            })
                        );
                    })
            )
        ),
    }),
});

/**
 * Creates the update callback handler, which updates the pattern data
 * @param textField The textfield to get the input from
 * @param config The config provided by the binding
 * @param resolve The function to call when triggered, and to return the command to
 * @param close The callback to close the selection UI
 * @returns The function to invoke when the field is exited
 */
const createFieldUpdateCallback =
    (
        textField: ITextField,
        {
            option,
            patternField,
            insertIfDeleted,
            undoable,
            globalShortcut,
        }: IUpdateKeyPatternOptionExecuteData,
        resolve: (cmd?: ICommand) => void
    ) =>
    () => {
        const newOptionPattern = textField.get();
        const newOption = {
            ...option,
            pattern: newOptionPattern,
        };
        const pattern = patternField.get();
        const newIndex = getKeyPatternOptionIndex(pattern, option);

        if (newIndex != -1 || insertIfDeleted) {
            const newPatternData =
                newIndex != -1
                    ? pattern.patterns.map((v, i) => (i == newIndex ? newOption : v))
                    : [...pattern.patterns, newOption];

            const newPattern = new KeyPattern(newPatternData);

            if (globalShortcut && globalKeyHandler.isShortcutInvalid(newPattern)) {
                resolve();
            } else {
                if (undoable) {
                    resolve(new SetFieldCommand(patternField, newPattern));
                } else {
                    patternField.set(newPattern);
                    resolve();
                }
            }
        } else {
            resolve();
        }
    };
