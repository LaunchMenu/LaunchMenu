import React, {FC, useState, useEffect} from "react";
import {ISyntaxHighlighterSelectionProps} from "./_types/ISyntaxHighlighterSelectionProps";
import {Box} from "../../../styling/box/Box";
import {FillBox} from "../../FillBox";
import {getFrameSize} from "./getFrameSize";
import {useIOContext} from "../../../context/react/useIOContext";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {useDataHook} from "model-react";

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

    // Cursor blinking
    const cursorVisible = useCursorBlink(selection);

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
                {cursorPos != undefined && cursorVisible && (
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

// TODO: replace by some css animation magic for better performance
const useCursorBlink = (selection: ITextSelection) => {
    const ioContext = useIOContext();
    const [h] = useDataHook();
    const settings = ioContext?.settings.get(baseSettings).field;
    const blinkDelay = settings?.blinkDelay.get(h) ?? 100;
    const blinkOnTime = settings?.blinkSpeed.onTime.get(h) ?? 1000;
    const blinkOffTime = settings?.blinkSpeed.offTime.get(h) ?? 1000;
    const [blinking, setBlinking] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
        setBlinking(false);
        const ID = setTimeout(() => {
            setBlinking(true);
        }, blinkDelay);
        return () => clearTimeout(ID);
    }, [blinkDelay, selection.start, selection.end]);
    useEffect(() => {
        if (!blinking) {
            setCursorVisible(true);
        } else {
            let destroyed = false;

            const blink = () => {
                setCursorVisible(false);
                setTimeout(() => {
                    if (!destroyed) setCursorVisible(true);
                }, blinkOffTime);
            };
            const ID = setInterval(blink, blinkOnTime + blinkOffTime);
            blink();

            return () => {
                destroyed = true;
                clearInterval(ID);
            };
        }
    }, [blinking]);
    return cursorVisible;
};
