import {ITextField} from "../../_types/ITextField";
import {IKeyEventListener} from "../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {handleHorizontalCursorInput} from "./handleHorizontalCursorInput";
import {handleVerticalCursorInput} from "./handleVerticalCursorInput";
import {handleCharacterInput} from "./handleCharacterInput";
import {handleNewlineInput} from "./handleNewlineInput";
import {handleRemovalInput} from "./handleRemovalInput";
import {handleCursorJumpInput} from "./handleCursorJumpInput";
import {handleCopyPasteInput} from "./handleCopyPasteInput";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * Creates a standard text field key handler
 * @param textField The text field to create the handler for
 * @param context The context that the handler is used in
 * @param onExit The code to execute when trying to exit the field
 * @param multiline Whether the text field may span multiple lines
 * @returns The key handler that can be added to the input handler stack
 */
export function createTextFieldKeyHandler(
    textField: ITextField,
    context: IIOContext,
    onExit?: () => void,
    multiline: boolean = false
): IKeyEventListener {
    return e => {
        const settings = context.settings.get(baseSettings).controls.field;
        if (handleCharacterInput(e, textField)) return true;
        if (handleRemovalInput(e, textField, settings)) return true;
        if (handleHorizontalCursorInput(e, textField, settings)) return true;
        if (handleCursorJumpInput(e, textField, settings)) return true;
        if (handleCopyPasteInput(e, textField, settings)) return true;
        if (multiline) {
            if (handleVerticalCursorInput(e, textField, settings)) return true;
            if (handleNewlineInput(e, textField, settings)) return true;
        }
        if (onExit && e.is("esc")) {
            onExit();
            return true;
        }

        // TODO: support ctrl+a selection
    };
}
