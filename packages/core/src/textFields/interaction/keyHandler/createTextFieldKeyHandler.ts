import {ITextField} from "../../_types/ITextField";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {handleHorizontalCursorInput} from "./handleHorizontalCursorInput";
import {handleCharacterInput} from "./handleCharacterInput";
import {handleRemovalInput} from "./handleRemovalInput";
import {handleCursorJumpInput} from "./handleCursorJumpInput";
import {handleCopyPasteInput} from "./handleCopyPasteInput";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";
import {setupModifierCatcherHandler} from "./superModifierCatcherHandler";
import {KeyPattern} from "../../../keyHandler/KeyPattern";

/**
 * Creates a standard text field key handler
 * @param textField The text field to create the handler for
 * @param context The context that the handler is used in
 * @param onExit The code to execute when trying to exit the field
 * @param extraHandler Optional extra key handlers to augment this handler by
 * @returns The key handler that can be added to the input handler stack
 */
export function createTextFieldKeyHandler(
    textField: ITextField,
    context: IIOContext,
    onExit?: () => void,
    extraHandler?: IKeyEventListener
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.field;
    const shift = new KeyPattern("shift"); // Shift is always a modifier for capital letters

    const extraHandlerObj =
        extraHandler instanceof Function ? {emit: extraHandler} : extraHandler;
    return setupModifierCatcherHandler(
        () => [fieldSettings.expandSelection.get(), shift],
        {
            init: () => extraHandlerObj?.init?.(),
            emit: e => {
                // Handle common text field inputs
                if (handleCharacterInput(e, textField)) return true;
                if (handleRemovalInput(e, textField, fieldSettings)) return true;
                if (handleHorizontalCursorInput(e, textField, fieldSettings)) return true;
                if (handleCursorJumpInput(e, textField, fieldSettings)) return true;
                if (handleCopyPasteInput(e, textField, fieldSettings)) return true;
                if (extraHandlerObj?.emit(e)) return true;

                // Handle exit
                if (onExit && settings.back.get().matches(e)) {
                    onExit();
                    return true;
                }
            },
            destroy: () => extraHandlerObj?.destroy?.(),
        }
    );
}
