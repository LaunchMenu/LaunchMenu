import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IKeyEventListener} from "../../../../keyHandler/_types/IKeyEventListener";
import {UndoRedoFacility} from "../../../../undoRedo/UndoRedoFacility";
import {ICommand} from "../../../../undoRedo/_types/ICommand";
import {ITextField} from "../../../_types/ITextField";
import {CompoundTextEditCommand} from "../../commands/CompoundTextEditCommand";
import {
    isTextEditCommand,
    ITextEditCommand,
} from "../../commands/_types/ITextEditCommand";
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
        onEditCommand: (command: ICommand) => void;
        handleUndoRedoInput?: IKeyEventListener;
    }) => T,
    options: {
        /** The undo redo facility to execute the commands in */
        undoRedoFacility?: UndoRedoFacility;
    } = {}
): T {
    const undoRedo = options.undoRedoFacility ?? new UndoRedoFacility();

    let prevCommandWasSelectionChange = false;
    const onChange = async (command: ICommand) => {
        const historyPast = undoRedo.getCommands().past;
        const prevCommand = historyPast[historyPast.length - 1];

        if (isTextEditCommand(command) && command.isSelectionChange()) {
            // Text alterations shouldn't be undone, TODO: add an option for this
            command.execute();
            prevCommandWasSelectionChange = true;
            return;
        }

        // Detect whether a batch should be split
        let merge = false;
        if (
            !prevCommandWasSelectionChange &&
            prevCommand &&
            isTextEditCommand(prevCommand) &&
            isTextEditCommand(command)
        )
            merge = shouldTextCommandsMerge(prevCommand, command);
        if (!merge) undoRedo.splitBatch();

        // Execute the command, and make sure the compound text edit command is used for merging
        undoRedo.execute(command, prevCommand => {
            if (!prevCommand || isTextEditCommand(prevCommand))
                return CompoundTextEditCommand;
            return false;
        });

        prevCommandWasSelectionChange = false;
    };

    // Create the handler using the created command dispatcher and undo redo controller
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

/**
 * Checks whether two given commands should merge
 * @param prevCommand Command a
 * @param command Command b
 * @returns Whether the commands should merge
 */
export function shouldTextCommandsMerge(
    prevCommand: ITextEditCommand,
    command: ITextEditCommand
): boolean {
    const isSelectionChange = command.isSelectionChange();
    const prevIsSelectionChange = prevCommand.isSelectionChange();
    if (isSelectionChange || prevIsSelectionChange) {
        return isSelectionChange == prevIsSelectionChange;
    }

    const addedTexts = command.getAddedText();
    const prevAddedTexts = prevCommand.getAddedText();
    if (addedTexts == undefined || prevAddedTexts == undefined) {
        return addedTexts == prevAddedTexts;
    }

    // Make sure the new text doesn't contain a space
    if (addedTexts.match(/\s/)) return false;

    return true;
}
