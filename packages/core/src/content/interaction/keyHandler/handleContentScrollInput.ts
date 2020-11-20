import {createContentControlsSettingsFolder} from "../../../application/settings/baseSettings/controls/createContentControlsSettingsFolder";
import {KeyEvent} from "../../../keyHandler/KeyEvent";
import {KeyPattern} from "../../../keyHandler/KeyPattern";
import {TSettingsFromFactory} from "../../../settings/_types/TSettingsFromFactory";
import {IContent} from "../../_types/IContent";
import {scrollContent} from "../scrollContent";
import {isContentControlsSettingsFolder} from "./isContentControlsSettingsFolder";

/**
 * Handles content scroll input (page down/up)
 * @param event The event to test
 * @param content The content to be scrolled
 * @param patterns The key patterns to detect, or the base settings to extract them from
 * @returns Whether the event was caught
 */
export function handleContentScrollInput(
    event: KeyEvent,
    content: IContent,
    patterns:
        | {contentUp: KeyPattern; contentDown: KeyPattern}
        | TSettingsFromFactory<typeof createContentControlsSettingsFolder>
): void | boolean {
    if (isContentControlsSettingsFolder(patterns))
        patterns = {
            contentUp: patterns.contentUp.get(),
            contentDown: patterns.contentDown.get(),
        };

    if (patterns.contentUp.matches(event)) {
        scrollContent(content, -30); // TODO: add settings for scroll speed
    } else if (patterns.contentDown.matches(event)) {
        scrollContent(content, 30); // TODO: add settings for scroll speed
    }
}
