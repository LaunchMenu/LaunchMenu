import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {IKeyEventListener} from "../../../../keyHandler/_types/IKeyEventListener";
import {ITextField} from "../../../_types/ITextField";
import {createTextFieldKeyHandler} from "../../keyHandler/createTextFieldKeyHandler";
import {handleNewlineInput} from "../../keyHandler/handleNewlineInput";
import {handleVerticalCursorInput} from "../../keyHandler/handleVerticalCursorInput";
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
        extraHandler,
        indentCharacter = " ".repeat(4),
    }: {
        /** Whether this is a multiline input, defaults to true */
        multiline?: boolean;
        /** The code to execute when trying to exit the field  */
        onExit?: () => void;
        /** Optional extra key handlers to augment this handler by */
        extraHandler?: IKeyEventListener;
        /** The character to use for indentation, defaults to 4 spaces */
        indentCharacter?: string;
    } = {}
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls;
    const fieldSettings = settings.field;

    const extraHandlerObj =
        extraHandler instanceof Function ? {emit: extraHandler} : extraHandler;
    return createTextFieldKeyHandler(textField, context, onExit, {
        init: () => extraHandlerObj?.init?.(),
        emit: e => {
            if (handleIndentInput(e, textField, fieldSettings, indentCharacter))
                return true;
            if (multiline) {
                if (handleVerticalCursorInput(e, textField, fieldSettings)) return true;
                if (handleNewlineInput(e, textField, fieldSettings)) return true;
            }
            if (extraHandlerObj?.emit(e)) return true;
        },
        destroy: () => extraHandlerObj?.destroy?.(),
    });
}
