import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {IKeyEventListener} from "../../../../keyHandler/_types/IKeyEventListener";
import {UndoRedoFacility} from "../../../../undoRedo/UndoRedoFacility";
import {ITextField} from "../../../_types/ITextField";
import {CompoundTextEditCommand} from "../../commands/CompoundTextEditCommand";
import {TextEditCommand} from "../../commands/TextEditCommand";
import {ITextEditTarget} from "../../_types/ITextEditTarget";

/**
 * Creates a key handler for undoable key events, according to the specified createHandler callback.
 * This function takes care of the command execution and command merging based on the user's preferences
 * @param textField The text field to be altered
 * @param context The context to obtain the user's settings from
 * @param createHandler The function to construct the actual keyhandler
 * @param options Any additional options for customization
 * @returns A key handler
 */
export function createUndoableTextFieldKeyHandler<T extends IKeyEventListener>(
    textField: ITextField,
    context: IIOContext,
    createHandler: (data: {
        undoableTextField: ITextEditTarget;
        onEditCommand: (command: TextEditCommand) => void;
        handleUndoRedoInput?: IKeyEventListener;
    }) => T,
    options: {
        /** The undo redo facility to execute the commands in */
        undoRedoFacility?: UndoRedoFacility;
    } = {}
): T {
    const undoRedo = options.undoRedoFacility ?? new UndoRedoFacility();

    const undoMode = context.settings.get(baseSettings).field.undoMode;
    const onChange = (command: TextEditCommand) => {
        // TODO: merge certain commands, based on the settings and the altered text
        undoRedo.execute(command, prevCommand => {
            return false;
            // const mode = undoMode.get();
            // if(!(prevCommand instanceof CompoundTextEditCommand)) return false;

            // // If character mode is selected, no commands are ever merged
            // if(mode=="Character") {
            //     return false;
            // } else
            // // If word mode is selected, commands are merged as long as no space is detected
            // if(mode=="Word") {
            //     prevCommand.getAlterations().some(alteration=>{

            //     })
            // } else
            // // If line mode is selected, commands are merged as long as they target the same line
            // if(mode=="Line") {

            // }
        });
    };

    const textControls = context.settings.get(baseSettings).controls.field;
    return createHandler({
        undoableTextField: {textField, onChange},
        onEditCommand: onChange,
        handleUndoRedoInput: e => {
            if (textControls.undo.get().matches(e)) {
                undoRedo.undo();
                return true;
            }
            if (textControls.redo.get().matches(e)) {
                undoRedo.redo();
                return true;
            }
        },
    });
}
