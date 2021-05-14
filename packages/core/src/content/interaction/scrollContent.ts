import {IContent} from "../_types/IContent";

/**
 * Scrolls the content up or down
 * @param content The content to be scrolled
 * @param amount The amount to scroll, with negative numbers representing up
 * @returns Whether the scroll was changed
 */
export function scrollContent(content: IContent, amount: number): boolean {
    const scrollHeight = content.getScrollHeight() || 1;
    const scrollPer = content.getScrollPercentage();
    const old = content.getScrollOffset();
    content.setScrollPercentage(scrollPer + amount / scrollHeight);
    return old != content.getScrollOffset();
}
