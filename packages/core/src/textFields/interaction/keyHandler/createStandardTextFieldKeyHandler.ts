import {ITextField} from "../../_types/ITextField";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {handleHorizontalCursorInput} from "./handleHorizontalCursorInput";
import {handleCharacterInput} from "./handleCharacterInput";
import {handleRemovalInput} from "./handleRemovalInput";
import {handleCursorJumpInput} from "./handleCursorJumpInput";
import {handleCopyPasteInput} from "./handleCopyPasteInput";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";
import {setupModifierCatcherHandler} from "./setupModifierCatcherHandler";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TextEditCommand} from "../commands/TextEditCommand";
import {ITextEditTarget} from "../_types/ITextEditTarget";
import {mergeKeyListeners} from "../../../keyHandler/mergeKeyListeners";

/**
 * Creates a standard text field key handler
 * @param textField The text field to create the handler for
 * @param context The context that the handler is used in
 * @param config Additional configuration
 * @returns The key handler that can be added to the input handler stack
 */
export function createStandardTextFieldKeyHandler(
    textField: ITextField,
    context: IIOContext,
    {
        onExit,
        extraHandler,
        onEditCommand,
    }: {
        /** The code to execute when trying to exit the field */
        onExit?: () => void;
        /** Optional extra key handlers to augment this handler by */
        extraHandler?: IKeyEventListener;
        /** The callback to make when an undoable action was retrieved, note that this command won't be executed by itself */
        onEditCommand?: (command: TextEditCommand) => void;
    } = {}
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.field;
    const shift = new KeyPattern("shift"); // Shift is always a modifier for capital letters

    // Some normalization of optional config params that can be passed to augment this handler
    const undoableTextField: ITextEditTarget = onEditCommand
        ? {textField, onChange: onEditCommand}
        : textField;

    // Create and return the key handler itself
    return setupModifierCatcherHandler(
        () => [fieldSettings.expandSelection.get(), shift],
        mergeKeyListeners(e => {
            // Handle common text field inputs
            if (handleCharacterInput(e, undoableTextField)) return true;
            if (handleRemovalInput(e, undoableTextField, fieldSettings)) return true;
            if (handleHorizontalCursorInput(e, textField, fieldSettings)) return true;
            if (handleCursorJumpInput(e, textField, fieldSettings)) return true;
            if (handleCopyPasteInput(e, undoableTextField, fieldSettings)) return true;

            // Handle exit
            if (onExit && settings.common.back.get().matches(e)) {
                onExit();
                return true;
            }
        }, extraHandler)
    );
}
