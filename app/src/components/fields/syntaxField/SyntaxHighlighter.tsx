import React, {FC, useMemo, useCallback, useRef} from "react";
import {highlightTagErrors} from "../../../textFields/syntax/utils/highlightTagErrors";
import {ISyntaxHighlighterProps} from "./_types/ISyntaxHighlighterProps";
import {getHighlightThemeStyle} from "../../../styling/theming/highlighting/getHighlightThemeStyle";
import {Box} from "../../../styling/box/Box";
import {mergeStyles} from "../../../utils/mergeStyles";
import {SyntaxHighlighterNodes} from "./SyntaxHighlighterNodes";
import {SyntaxHighlighterSelection} from "./SyntaxHighlighterSelection";

/**
 * A simple component to render syntax highlighted using a passed highlighter
 */
export const SyntaxHighlighter: FC<ISyntaxHighlighterProps> = ({
    value,
    highlighter,
    selection,
    onSelectionChange,
    theme,
    setErrors,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    ...rest
}) => {
    // TODO: option to disable error highlighting
    // TODO: fix selection issue with padding and such

    // Obtain the highlight nodes
    const [nodes] = useMemo(() => {
        // Highlight the text including error tags
        const {nodes, errors} = highlighter.highlight(value);
        if (setErrors) setErrors(errors);
        const errorHighlighted = highlightTagErrors(nodes, errors);
        console.log(errors);

        // Return all nodes
        return [errorHighlighted];
    }, [value]);

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
    // TODO:: forward mouse events with index
    const dragging = useRef(false);
    const onDragEnd = useRef(() => {
        dragging.current = false;
        document.removeEventListener("mouseup", onDragEnd.current);
    });
    const onDragStart = useCallback((e: React.PointerEvent) => {
        dragging.current = true;
        document.addEventListener("mouseup", onDragEnd.current);
    }, []);

    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const onSelect = useCallback(
        (e, i: number) => {
            const index = Math.round(i);
            if (
                selectionRef.current?.start != index ||
                selectionRef.current?.end != index
            )
                onSelectionChange?.({start: Math.round(i), end: Math.round(i)});
        },
        [onSelectionChange]
    );
    const onExpandSelection = useCallback(
        (e, i: number) => {
            const index = Math.round(i);
            if (dragging.current && selectionRef.current?.end != index)
                onSelectionChange?.({
                    start: selection?.start ?? Math.round(i),
                    end: Math.round(i),
                });
        },
        [onSelectionChange, selection?.start]
    );

    // Determine whether or not to render a wrapper component at all
    return (
        <Box
            position="relative"
            noSelect
            {...rest}
            onMouseDown={onSelectionChange && onDragStart}
            onMouseUp={onSelectionChange && onDragEnd.current}>
            <SyntaxHighlighterNodes
                nodes={nodes}
                onMouseDown={onSelectionChange && onSelect}
                onMouseMove={onSelectionChange && onExpandSelection}
            />
            {selection && (
                <SyntaxHighlighterSelection nodes={nodes} selection={selection} />
            )}
        </Box>
    );
};
