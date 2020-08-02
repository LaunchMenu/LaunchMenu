/**
 * Retrieves the size of the frame on each side (margin, border, padding)
 * @param element The element to get the frame for
 * @returns The sizes
 */
export function getFrameSize(
    element: Element
): {top: number; right: number; bottom: number; left: number} {
    const style = window.getComputedStyle(element);
    const left =
        parseFloat(style.marginLeft) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.paddingLeft);
    const right =
        parseFloat(style.marginRight) +
        parseFloat(style.borderRightWidth) +
        parseFloat(style.paddingRight);
    const bottom =
        parseFloat(style.marginBottom) +
        parseFloat(style.borderBottomWidth) +
        parseFloat(style.paddingBottom);
    const top =
        parseFloat(style.marginTop) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.paddingTop);
    return {left, right, bottom, top};
}
