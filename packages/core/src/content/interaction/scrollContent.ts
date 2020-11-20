import {IContent} from "../_types/IContent";

/**
 * Scrolls the content up or down
 * @param content The content to be scrolled
 * @param amount The amount to scroll, with negative numbers representing up
 */
export function scrollContent(content: IContent, amount: number): void {
    const scrollHeight = content.getScrollHeight() || 1;
    const scrollPer = content.getScrollPercentage();
    content.setScrollPercentage(scrollPer + amount / scrollHeight);
}
