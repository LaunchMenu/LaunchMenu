import React, {useMemo, useCallback, useRef} from "react";
import {highlightTagErrors} from "../../../textFields/syntax/utils/highlightTagErrors";
import {ISyntaxHighlighterProps} from "./_types/ISyntaxHighlighterProps";
import {getHighlightThemeStyle} from "../../../styling/theming/highlighting/getHighlightThemeStyle";
import {Box} from "../../../styling/box/Box";
import {mergeStyles} from "../../../utils/mergeStyles";
import {SyntaxHighlighterNodes} from "./SyntaxHighlighterNodes";
import {SyntaxHighlighterSelection} from "./SyntaxHighlighterSelection";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {useHorizontalScroll} from "../../../utils/hooks/useHorizontalScroll";
import {useCursorScroll} from "./useCursorScroll";
import {LFC} from "../../../_types/LFC";
import {useIOContext} from "../../../context/react/useIOContext";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {useDataHook} from "model-react";
import {ITextSelection} from "../../../textFields/_types/ITextSelection";
import {ISyntaxHighlighterNodesListenerProps} from "../syntaxField/_types/ISyntaxHighlighterNodesProps";
import {getJumpTokenPos} from "../../../textFields/interaction/getJumpTokenPos";

/**
 * A simple component to render syntax highlighted using a passed highlighter
 */
export const SyntaxHighlighter: LFC<ISyntaxHighlighterProps> = ({
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
    // Allow the highlighter to force updates
    const highlightChangeID = useRef(0);
    const [h] = useDataHook({onChange: () => highlightChangeID.current++});

    // Obtain the highlight nodes
    let nodes: IHighlightNode[];
    if ("value" in rest) {
        const ioContext = useIOContext();
        const highlighting = ioContext?.settings
            .get(baseSettings)
            .field.highlightingEnabled.get(h);
        nodes = useMemo(() => {
            if (!highlighting)
                return [{start: 0, end: rest.value.length, text: rest.value, tags: []}];

            // Highlight the text including error tags
            const {nodes, errors} = rest.highlighter.highlight(rest.value, h);
            if (rest.setErrors) rest.setErrors(errors);
            const errorHighlighted =
                rest.highlightErrors == false ? nodes : highlightTagErrors(nodes, errors);

            // Return all nodes
            return errorHighlighted;
        }, [rest.value, rest.highlightErrors, highlightChangeID.current, highlighting]);
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
    const {
        onDragEnd,
        onDragStart,
        onMouseDown: mouseDownHandler,
        onMouseUp: mouseUpHandler,
        onMouseMove: mouseMoveHandler,
    } = useTextSelector(
        {nodes, selection},
        {onSelectionChange, onMouseDown, onMouseMove, onMouseUp}
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
            onMouseUp={(onSelectionChange || onMouseUp) && mouseUpHandler}
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
            onMouseUp={onSelectionChange && onDragEnd}>
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

/**
 * A hook to create mouse event listeners to deal with text selection
 * @param textData The nodes and current text selection
 * @param callbacks The callbacks to perform when text is selected/mouse interaction occurs
 * @returns The callbacks to add to the syntax highlighter field and its container
 */
export function useTextSelector(
    {nodes, selection}: {nodes: IHighlightNode[]; selection?: ITextSelection},
    {
        onSelectionChange,
        onMouseDown,
        onMouseUp,
        onMouseMove,
    }: {
        onSelectionChange?: (selection: ITextSelection) => void;
    } & ISyntaxHighlighterNodesListenerProps
): ISyntaxHighlighterNodesListenerProps & {
    onDragStart: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onDragEnd: (event: React.MouseEvent<Element, MouseEvent>) => void;
} {
    const text = useMemo(() => nodes.reduce((text, node) => text + node.text, ""), [
        nodes,
    ]);

    // The drag listeners used to select multiple characters
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

    // Double click selection variables
    let prevClickTimesRef = useRef([] as number[]);
    let doubleClickSelectionRef = useRef<ITextSelection>();

    // The down listener to decide  the new text select on click
    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const mouseDownHandler = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>, i: number) => {
            onMouseDown?.(e, i);
            const now = Date.now();
            const index = Math.round(i);
            let newRange: {start: number; end: number};
            let doubleClick = false;

            // Handle triple click
            if (now - prevClickTimesRef.current[1] < 400) {
                newRange = {
                    start: 0,
                    end: text.length,
                };
                doubleClick = true;
            }
            // Handle double click
            else if (now - prevClickTimesRef.current[0] < 200) {
                newRange = {
                    start: getJumpTokenPos(text, index, -1, true),
                    end: getJumpTokenPos(text, index - 1, 1, true),
                };
                doubleClick = true;
            }
            // Handle regular mouse selection
            else newRange = {start: index, end: index};

            // Either expand the current selection, or replace it depending on if shift is down
            const curStart = selectionRef.current?.start ?? newRange.start;
            const curEnd = selectionRef.current?.end ?? newRange.end;
            const extendedRange = e.shiftKey
                ? {
                      start: curStart,
                      end: curEnd > curStart ? newRange.end : newRange.start,
                  }
                : newRange;
            if (doubleClick) doubleClickSelectionRef.current = extendedRange;

            // Perform a callback if the selection range changed
            if (
                selectionRef.current?.start != extendedRange.start ||
                selectionRef.current?.end != extendedRange.end
            ) {
                selectionRef.current = extendedRange;
                onSelectionChange?.(extendedRange);
            }

            // Update the ref data
            caughtLineClick.current = true;
            prevClickTimesRef.current.unshift(now);
            if (prevClickTimesRef.current.length > 2) prevClickTimesRef.current.pop();
        },
        [onSelectionChange, onMouseDown, text]
    );

    // The move listener to increase the text selection
    const mouseMoveHandler = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>, i: number) => {
            onMouseMove?.(e, i);
            const index = Math.round(i);
            if (dragging.current && selectionRef.current?.end != index) {
                // Handle dragging and selecting full words at once if activated by double/triple click
                if (doubleClickSelectionRef.current) {
                    // The selection should always include the base range, and extend that
                    const baseRange = doubleClickSelectionRef.current;
                    const orderedBaseRange = {
                        start: Math.min(baseRange.start, baseRange.end),
                        end: Math.max(baseRange.start, baseRange.end),
                    };
                    const startIndex =
                        index <= orderedBaseRange.end && index <= orderedBaseRange.start
                            ? orderedBaseRange.end
                            : orderedBaseRange.start;
                    selectionRef.current = {
                        start: startIndex,
                        end: getJumpTokenPos(
                            text,
                            index,
                            index > startIndex ? 1 : -1,
                            true
                        ),
                    };
                }
                // Otherwise perform normal text selection
                else {
                    selectionRef.current = {
                        start: selectionRef.current?.start ?? index,
                        end: index,
                    };
                }
                onSelectionChange?.(selectionRef.current);
            }
        },
        [onSelectionChange, onMouseMove, text]
    );

    // The mouse up handler
    const mouseUpHandler = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>, i: number) => {
            onMouseUp?.(e, i);
            doubleClickSelectionRef.current = undefined;
        },
        [onMouseUp]
    );

    // Return all the listeners
    return {
        onMouseDown: mouseDownHandler,
        onMouseMove: mouseMoveHandler,
        onMouseUp: mouseUpHandler,
        onDragEnd: onDragEnd.current,
        onDragStart,
    };
}
