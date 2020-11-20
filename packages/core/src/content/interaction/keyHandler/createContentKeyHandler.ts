import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {IContent} from "../../_types/IContent";
import {handleContentScrollInput} from "./handleContentScrollInput";

/**
 * Creates a standard content key handler
 * @param content The content to be handled
 * @param context The context that the handler is used in
 * @returns The key handler tha can be added to the UILayer
 */
export function createContentKeyHandler(
    content: IContent,
    context: IIOContext
): IKeyEventListener {
    const settings = context.settings.get(baseSettings).controls.content;
    return e => {
        if (handleContentScrollInput(e, content, settings)) return true;
    };
}
