import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {KeyEvent} from "../../../../keyHandler/KeyEvent";
import {mergeKeyListeners} from "../../../../keyHandler/mergeKeyListeners";
import {IKeyEventListener} from "../../../../keyHandler/_types/IKeyEventListener";
import {ITextField} from "../../../_types/ITextField";
import {TextEditCommand} from "../../commands/TextEditCommand";
import {createStandardTextFieldKeyHandler} from "../../keyHandler/createStandardTextFieldKeyHandler";
import {handleNewlineInput} from "../../keyHandler/handleNewlineInput";
import {handleVerticalCursorInput} from "../../keyHandler/handleVerticalCursorInput";
import {ITextEditTarget} from "../../_types/ITextEditTarget";
import {createUndoableTextFieldKeyHandler} from "./createUndoableTextFieldKeyHandler";
import {handleIndentInput} from "./handleIndentInput";

/**
 * Creates an advanced text field key handler, which can be used for complete editors
 * @param textField The text field to create the handler for
 * @param context The context that the handler is used in
 * @param config Extra configuration
 * @returns The key handler that can be added to the input handler stack
 */
export function createAdvancedTextFieldKeyHandler(
    textField: ITextField,
    context: IIOContext,
    {
        multiline = true,
        onExit,
        createExtraHandler,
        indentCharacter = " ".repeat(4),
    }: {
        /** Whether this is a multiline input, defaults to true */
        multiline?: boolean;
        /** The code to execute when trying to exit the field  */
        onExit?: () => void;
        /** Optional extra key handlers to augment this handler by */
        createExtraHandler?: (data: {
            undoableTextField: ITextEditTarget;
            onEditCommand: (command: TextEditCommand) => void;
        }) => IKeyEventListener;
        /** The character to use for indentation, defaults to 4 spaces */
        indentCharacter?: string;
    } = {}
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.field;

    /**
     * Retrieves a keyboard handler for advanced keyboard behavior
     * @param undoableTextField The undoable text field
     * @param handleUndoRedoInput The key handler that handles the user's undo/redo inputs
     * @returns The advanced key input handler
     */
    const getAdvancedKeyHandlers = (
        undoableTextField: ITextEditTarget,
        handleUndoRedoInput?: IKeyEventListener
    ) => (e: KeyEvent) => {
        if (handleIndentInput(e, undoableTextField, fieldSettings, indentCharacter))
            return true;
        if (multiline) {
            if (handleVerticalCursorInput(e, textField, fieldSettings)) return true;
            if (handleNewlineInput(e, undoableTextField, fieldSettings)) return true;
        }
        if (handleUndoRedoInput?.(e)) return true;
    };

    // Use the `createUndoableTextFieldHandler` and `createTextFieldHandler` to combine all behaviors
    return createUndoableTextFieldKeyHandler(
        textField,
        context,
        ({onEditCommand, undoableTextField, handleUndoRedoInput}) =>
            createStandardTextFieldKeyHandler(textField, context, {
                onExit,
                extraHandler: mergeKeyListeners(
                    getAdvancedKeyHandlers(undoableTextField, handleUndoRedoInput),
                    createExtraHandler?.({onEditCommand, undoableTextField})
                ),
                onEditCommand,
            })
    );
}
