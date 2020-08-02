import {ITextField} from "../../_types/ITextField";
import {IKeyEventListener} from "../../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {isDownEvent} from "../../../stacks/keyHandlerStack/keyEventHelpers/isDownEvent";
import {handleHorizontalCursorInput} from "./handleHorizontalCursorInput";
import {handleVerticalCursorInput} from "./handleVerticalCursorInput";
import {handleCharacterInput} from "./handleCharacterInput";
import {handleNewlineInput} from "./handleNewlineInput";
import {handleRemovalInput} from "./handleRemovalInput";
import {handleCursorJumpInput} from "./handleCursorJumpInput";
import {handleCopyPasteInput} from "./handleCopyPasteInput";

/**
 * Creates a standard text field key handler
 * @param textField The text field to create the handler for
 * @param multiline Whether the text field may span multiple lines
 * @param onExit The code to execute when trying to exit the field
 * @returns The key handler that can be added to the input handler stack
 */
export function createTextFieldKeyHandler(
    textField: ITextField,
    multiline: boolean = false,
    onExit?: () => void
): IKeyEventListener {
    return e => {
        if (handleCharacterInput(e, textField)) return true;
        if (handleRemovalInput(e, textField)) return true;
        if (handleHorizontalCursorInput(e, textField)) return true;
        if (handleCursorJumpInput(e, textField)) return true;
        if (handleCopyPasteInput(e, textField)) return true;
        if (multiline) {
            if (handleVerticalCursorInput(e, textField)) return true;
            if (handleNewlineInput(e, textField)) return true;
        }
        if (onExit && isDownEvent(e, "esc")) {
            onExit();
            return true;
        }

        // TODO: support ctrl+a selection
    };
}
