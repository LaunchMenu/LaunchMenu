import React, {FC, useState, useEffect} from "react";
import {ISyntaxHighlighterSelectionProps} from "./_types/ISyntaxHighlighterSelectionProps";
import {Box} from "../../../styling/box/Box";
import {FillBox} from "../../FillBox";
import {getFrameSize} from "./getFrameSize";

/**
 * Retrieves the pixel size of the text
 * @param element The element to get the text from, assumes characters are individually separated
 * @param end The end of the range to measure
 * @returns The number of pixels
 */
export function measureText(element: Element, end: number): number {
    const children = element.children;
    const {left, right} = getFrameSize(element);

    const contentLength = element.textContent?.length || 0;
    if (contentLength <= end) {
        return element.getBoundingClientRect().width - (contentLength == end ? right : 0);
    } else {
        let out = left;
        for (let child of children) {
            if (end <= 0) break;
            out += measureText(child, end);
            end -= child.textContent?.length || 0;
        }
        return out;
    }
}

/**
 * Renders a cursor and selection at the right place in the passed child element.
 * Assumes all characters are in a separate elements.
 */
export const SyntaxHighlighterSelection: FC<ISyntaxHighlighterSelectionProps> = ({
    selection,
    getPixelSelection,
    children,
    ...rest
}) => {
    const [syntaxEl, setSyntaxEl] = useState(null as null | Element);

    // Perform selection measurement
    const [selectionPixelRange, setSelectionPixelRange] = useState(
        undefined as undefined | {start: number; end?: number}
    );
    useEffect(() => {
        setSelectionPixelRange(r => {
            let range: undefined | {start: number; end?: number};
            if (!syntaxEl) {
                range = undefined;
            } else {
                const start = measureText(syntaxEl, selection.start);
                const end =
                    selection.start != selection.end
                        ? measureText(syntaxEl, selection.end)
                        : undefined;
                range = {start, end};
            }

            if (getPixelSelection) getPixelSelection(range);
            return range;
        });
    }, [selection.start, selection.end, syntaxEl]);

    // Selection and measurement rendering
    const cursorPos = selectionPixelRange?.end ?? selectionPixelRange?.start;
    const selectionLeft = Math.min(
        selectionPixelRange?.start ?? 0,
        selectionPixelRange?.end ?? 0
    );
    const selectionRight = Math.max(
        selectionPixelRange?.start ?? 0,
        selectionPixelRange?.end ?? 0
    );
    return (
        <>
            <Box className="syntax" display="inline-block" {...rest} elRef={setSyntaxEl}>
                {children}
            </Box>
            <FillBox pointerEvents="none" className="selectionHandler">
                {cursorPos != undefined && (
                    <Box
                        className="cursor"
                        position="absolute"
                        top="none"
                        bottom="none"
                        css={{left: cursorPos}}
                    />
                )}
                {selectionPixelRange && selectionPixelRange.end != undefined && (
                    <Box
                        className="selection"
                        position="absolute"
                        top="none"
                        bottom="none"
                        width={selectionRight - selectionLeft}
                        css={{left: selectionLeft}}
                    />
                )}
            </FillBox>
        </>
    );
};
