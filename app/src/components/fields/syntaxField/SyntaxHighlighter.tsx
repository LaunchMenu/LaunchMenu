import React, {FC, useMemo, useCallback, useRef} from "react";
import {highlightTagErrors} from "../../../textFields/syntax/utils/highlightTagErrors";
import {ISyntaxHighlighterProps} from "./_types/ISyntaxHighlighterProps";
import {getHighlightThemeStyle} from "../../../styling/theming/highlighting/getHighlightThemeStyle";
import {Box} from "../../../styling/box/Box";
import {mergeStyles} from "../../../utils/mergeStyles";
import {SyntaxHighlighterNodes} from "./SyntaxHighlighterNodes";
import {SyntaxHighlighterSelection} from "./SyntaxHighlighterSelection";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {useHorizontalScroll} from "../../../utils/hooks/useHorizontalScroll";
import {useSmoothScroll} from "../../../utils/hooks/useSmoothScroll";
import {useCursorScroll} from "./useCursorScroll";
import {FillBox} from "../../FillBox";

/**
 * A simple component to render syntax highlighted using a passed highlighter
 */
export const SyntaxHighlighter: FC<ISyntaxHighlighterProps> = ({
    selection,
    onSelectionChange,
    theme,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    scrollCursorPadding = 30,
    getPixelSelection,
    ...rest
}) => {
    // Obtain the highlight nodes
    let nodes: IHighlightNode[];
    if ("value" in rest) {
        nodes = useMemo(() => {
            // Highlight the text including error tags
            const {nodes, errors} = rest.highlighter.highlight(rest.value);
            if (rest.setErrors) rest.setErrors(errors);
            const errorHighlighted =
                rest.highlightErrors == false ? nodes : highlightTagErrors(nodes, errors);

            // Return all nodes
            return errorHighlighted;
        }, [rest.value, rest.highlightErrors]);
    } else {
        nodes = rest.nodes;
    }

    // Obtain syntax styling
    const syntaxStyling = useMemo(
        () =>
            theme &&
            mergeStyles(getHighlightThemeStyle(theme), {
                ".selection": theme.selection,
                ".cursor": theme.cursor,
            }),
        [theme]
    );
    if (syntaxStyling) rest.css = mergeStyles(syntaxStyling, rest.css);

    // Selection listeners
    const dragging = useRef(false);
    const onDragEnd = useRef(() => {
        dragging.current = false;
        document.removeEventListener("mouseup", onDragEnd.current);
    });
    const caughtLineClick = useRef(false);
    const onDragStart = useCallback(
        (e: React.PointerEvent) => {
            dragging.current = true;
            document.addEventListener("mouseup", onDragEnd.current);

            // Select the last index if clicking in the div but not on a character
            if (!caughtLineClick.current) {
                const index = nodes.reduce((cur, node) => Math.max(node.end, cur), 0);
                selectionRef.current = {
                    start:
                        (e.shiftKey ? selectionRef.current?.start : undefined) ?? index,
                    end: index,
                };
                onSelectionChange?.(selectionRef.current);
            }
            caughtLineClick.current = false;
        },
        [nodes]
    );

    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const mouseDownHandler = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>, i: number) => {
            onMouseDown?.(e, i);
            const index = Math.round(i);
            if (
                selectionRef.current?.start != index ||
                selectionRef.current?.end != index
            ) {
                selectionRef.current = {
                    start:
                        (e.shiftKey ? selectionRef.current?.start : undefined) ?? index,
                    end: index,
                };
                onSelectionChange?.(selectionRef.current);
            }
            caughtLineClick.current = true;
        },
        [onSelectionChange, onMouseDown]
    );
    const mouseMoveHandler = useCallback(
        (e, i: number) => {
            onMouseMove?.(e, i);
            const index = Math.round(i);
            if (dragging.current && selectionRef.current?.end != index) {
                selectionRef.current = {
                    start: selectionRef.current?.start ?? index,
                    end: index,
                };
                onSelectionChange?.(selectionRef.current);
            }
        },
        [onSelectionChange]
    );

    // Scroll manager
    const horizontalScrollRef = useHorizontalScroll();
    const [cursorScrollRef, onPixelSelectionChange] = useCursorScroll(
        scrollCursorPadding,
        getPixelSelection
    );

    // Determine whether or not to render a wrapper component at all
    const nodesEl = (
        <SyntaxHighlighterNodes
            nodes={nodes}
            onMouseDown={(onSelectionChange || onMouseDown) && mouseDownHandler}
            onMouseMove={(onSelectionChange || onMouseMove) && mouseMoveHandler}
            onMouseUp={onMouseUp}
        />
    );
    return (
        <Box
            position="relative"
            overflowX="auto"
            whiteSpace="pre"
            noSelect
            elRef={[horizontalScrollRef, ...cursorScrollRef]}
            {...rest}
            onMouseDown={onSelectionChange && onDragStart}
            onMouseUp={onSelectionChange && onDragEnd.current}>
            {selection ? (
                <SyntaxHighlighterSelection
                    selection={selection}
                    getPixelSelection={onPixelSelectionChange}>
                    {nodesEl}
                </SyntaxHighlighterSelection>
            ) : (
                nodesEl
            )}
        </Box>
    );
};
