import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {IContent} from "../../_types/IContent";
import {handleContentScrollInput} from "./handleContentScrollInput";

/**
 * Creates a standard content key handler
 * @param content The content to be handled
 * @param context The context that the handler is used in
 * @param config Additional configuration
 * @returns The key handler tha can be added to the UILayer
 */
export function createStandardContentKeyHandler(
    content: IContent,
    context: IIOContext,
    {
        onExit,
    }: {
        /** The code to execute when trying to exit the field */
        onExit?: () => void;
    } = {}
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls;
    const controlsSettings = context.settings.get(baseSettings).controls.content;
    const generalSettings = context.settings.get(baseSettings).content;

    return e => {
        if (
            handleContentScrollInput(
                e,
                content,
                controlsSettings,
                generalSettings.scrollSpeed.get()
            )
        )
            return true;

        // Handle exit
        if (onExit && settings.common.back.get().matches(e)) {
            onExit();
            return true;
        }
    };
}
