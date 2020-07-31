import React, {FC, useMemo, useRef, useState, useEffect} from "react";
import {ISyntaxHighlighterSelectionProps} from "./_types/ISyntaxHighlighterSelectionProps";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {getHighlightNodesRange} from "../../../textFields/syntax/utils/getHighlightNodesRange";
import {Box} from "../../../styling/box/Box";
import {MeasureBox} from "../../MeasureBox";
import {SyntaxHighlighterNodes} from "./SyntaxHighlighterNodes";
import {FillBox} from "../../FillBox";

export const SyntaxHighlighterSelection: FC<ISyntaxHighlighterSelectionProps> = ({
    selection,
    getPixelSelection,
    nodes,
}) => {
    // Obtain the highlight measuring nodes
    const [selectionStartNodes, selectionEndNodes] = useMemo(() => {
        // Obtain selection measurement nodes
        let selectionStartNodes: IHighlightNode[],
            selectionEndNodes: IHighlightNode[] | undefined;
        selectionStartNodes = getHighlightNodesRange(nodes, 0, selection.start);
        if (selection.start != selection.end)
            selectionEndNodes = getHighlightNodesRange(nodes, 0, selection.end);
        return [selectionStartNodes, selectionEndNodes];
    }, [nodes, selection.start, selection.end]);

    // Perform selection measurement
    const startElRef = useRef(undefined as undefined | HTMLElement);
    const endElRef = useRef(undefined as undefined | HTMLElement);
    const [selectionPixelRange, setSelectionPixelRange] = useState(
        undefined as undefined | {start: number; end?: number}
    );
    useEffect(() => {
        setSelectionPixelRange(r => {
            const start = startElRef.current?.clientWidth ?? 0;
            const end = endElRef.current?.clientWidth;
            const range = startElRef.current && {start, end};
            if (getPixelSelection) getPixelSelection(range);
            return range;
        });
    }, [startElRef.current, endElRef.current, selectionStartNodes, selectionEndNodes]);

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
        <FillBox pointerEvents="none" className="selectionHandler">
            {cursorPos != undefined && (
                <Box
                    className="cursor"
                    position="absolute"
                    top={0}
                    bottom={0}
                    leftCustom={cursorPos}
                />
            )}
            {selectionPixelRange && selectionPixelRange.end != undefined && (
                <Box
                    className="selection"
                    position="absolute"
                    top={0}
                    bottom={0}
                    leftCustom={selectionLeft}
                    width={selectionRight - selectionLeft}
                />
            )}

            {/* Elements to measure the text to determine positions */}
            <MeasureBox elRef={startElRef} css={{".empty": {display: "none"}}}>
                <SyntaxHighlighterNodes nodes={selectionStartNodes} />
            </MeasureBox>
            {selectionEndNodes && (
                <MeasureBox elRef={endElRef} css={{".empty": {display: "none"}}}>
                    <SyntaxHighlighterNodes nodes={selectionEndNodes} />
                </MeasureBox>
            )}
        </FillBox>
    );
};
