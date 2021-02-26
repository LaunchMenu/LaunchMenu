import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IKeyEventListener} from "../../../../keyHandler/_types/IKeyEventListener";
import {UndoRedoFacility} from "../../../../undoRedo/UndoRedoFacility";
import {get2dIndex} from "../../../utils/rangeConversion";
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
        onEditCommand: (command: ITextEditCommand) => void;
        handleUndoRedoInput?: IKeyEventListener;
    }) => T,
    options: {
        /** The undo redo facility to execute the commands in */
        undoRedoFacility?: UndoRedoFacility;
    } = {}
): T {
    const undoRedo = options.undoRedoFacility ?? new UndoRedoFacility();

    const undoMode = context.settings.get(baseSettings).field.editor.undoMode;
    const onChange = (command: ITextEditCommand) => {
        const historyPast = undoRedo.getCommands().past;
        const prevCommand = historyPast[historyPast.length - 1];

        // Detect whether a batch should be split
        let merge = false;
        const mode = undoMode.get();
        if (prevCommand && isTextEditCommand(prevCommand))
            merge = shouldTextCommandsMerge(prevCommand, command, mode);
        if (!merge) undoRedo.splitBatch();

        // Execute the command, and make sure the compound text edit command is used for merging
        undoRedo.execute(command, prevCommand => {
            if (!prevCommand || isTextEditCommand(prevCommand))
                return CompoundTextEditCommand;
            return false;
        });
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
 * @param mode The merge mode
 * @returns Whether the commands should merge
 */
export function shouldTextCommandsMerge(
    prevCommand: ITextEditCommand,
    command: ITextEditCommand,
    mode: "Character" | "Word" | "Line"
): boolean {
    // If character mode is selected, no commands are ever merged
    if (mode == "Character") {
        return false;
    }
    // If word mode is selected, commands are merged as long as no space is detected
    else if (mode == "Word") {
        // Make sure there is only 1 change in both commands
        if (
            command.getAlterations().length != 1 ||
            prevCommand.getAlterations().length != 1
        )
            return false;

        // Make sure the changes are consecutive
        const ra = command.getAlterations()[0],
            rb = prevCommand.getAlterations()[0];
        if (!(rb.start == ra.end || ra.start == rb.start + rb.text.length)) return false;

        // Make sure that neither of the changes contain a space
        if (ra.prevText.match(/\s/) || ra.text.match(/\s/)) return false;

        return true;
    }
    // If line mode is selected, commands are merged as long as they target the same line
    else {
        // mode == "Line"
        // Make sure that all changes are on the same line
        const text = command.getTargetText();
        const row = get2dIndex(text, command.getAlterations()[0].start).row;
        if (
            command
                .getAlterations()
                .some(
                    ({start, end}) =>
                        get2dIndex(text, start).row != row ||
                        get2dIndex(text, end).row != row
                )
        )
            return false;

        // Make sure that the previous changes are on the same line
        const prevText = prevCommand.getTargetText();
        if (
            prevCommand
                .getAlterations()
                .some(
                    ({start, end}) =>
                        get2dIndex(prevText, start).row != row ||
                        get2dIndex(prevText, end).row != row
                )
        )
            return false;

        // Make sure the alterations don't contain new lines
        if (
            [prevCommand.getAlterations(), command.getAlterations()]
                .flat()
                .every(({text, prevText}) => text.match(/\n/g) || prevText.match(/\n/g))
        )
            return false;

        return true;
    }
}
