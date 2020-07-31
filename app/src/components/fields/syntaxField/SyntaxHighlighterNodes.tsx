import React, {FC, useCallback, useMemo} from "react";
import {
    ISyntaxHighlighterNodesProps,
    ISyntaxHighlighterNodesListenerProps,
} from "./_types/ISyntaxHighlighterNodesProps";
import {IHighlightNode} from "../../../textFields/syntax/_types/IHighlightNode";
import {getFrameSize} from "./getFrameSize";

/**
 * Determines how to the right in the div on which th event occurred the mouse is as a fraction
 * @param event The mouse event
 * @returns The fraction with 0 being all the way on the left, 1 being all the way on the right
 */
const getPosFrac = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const xPos = event.clientX;
    const target = event.target as HTMLSpanElement;
    const rect = target.getBoundingClientRect();
    const dx = xPos - rect.x;
    return dx / rect.width;
};

export const SyntaxHighlighterChar: FC<
    {
        char: string;
        start: number;
    } & ISyntaxHighlighterNodesListenerProps
> = ({char, start, onMouseDown, onMouseUp, onMouseMove}) => {
    const getEventHandler = (
        listener?: (e: React.MouseEvent<HTMLSpanElement>, i: number) => void
    ) => e => listener?.(e, start + getPosFrac(e));

    const mouseDown = useMemo(() => getEventHandler(onMouseDown), [onMouseDown]);
    const mouseUp = useMemo(() => getEventHandler(onMouseUp), [onMouseUp]);
    const mouseMove = useMemo(() => getEventHandler(onMouseMove), [onMouseMove]);

    return (
        <span
            onMouseDown={onMouseDown && mouseDown}
            onMouseUp={onMouseUp && mouseUp}
            onMouseMove={onMouseMove && mouseMove}>
            {char}
        </span>
    );
};

/**
 * Determines how far within the frame the mouse is as a fraction
 * @param event The mouse event
 * @returns The fraction with 0 being all the way on the left 0.5 being somewhere in the content and 1 being all the way on the right
 */
const getFramePosFrac = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const xPos = event.clientX;
    const target = event.target as HTMLSpanElement;
    const rect = target.getBoundingClientRect();
    const dx = xPos - rect.x;

    const {left, right} = getFrameSize(target);

    if (dx < left && left != 0) return (0.5 * dx) / left;
    if (rect.width - dx < right && right != 0)
        return 1 - (0.5 * (rect.width - dx)) / right;
    return 0.5;
};

export const SyntaxHighlighterNode: FC<
    {
        node: IHighlightNode;
    } & ISyntaxHighlighterNodesListenerProps
> = ({node: {text, start, tags}, ...listeners}) => {
    const {onMouseDown, onMouseUp, onMouseMove} = listeners;
    const getEventHandler = (
        listener?: (e: React.MouseEvent<HTMLSpanElement>, i: number) => void
    ) => e => {
        const per = getFramePosFrac(e);
        if (per == 0.5) return;
        listener?.(e, start + text.length * (per > 0.5 ? 1 : 0));
    };
    const mouseDown = useMemo(() => getEventHandler(onMouseDown), [onMouseDown]);
    const mouseUp = useMemo(() => getEventHandler(onMouseUp), [onMouseUp]);
    const mouseMove = useMemo(() => getEventHandler(onMouseMove), [onMouseMove]);

    return (
        <span
            onMouseDown={onMouseDown && mouseDown}
            onMouseUp={onMouseUp && mouseUp}
            onMouseMove={onMouseMove && mouseMove}
            className={tags.join(" ") + (text == "" ? " empty" : "")}>
            {text.split("").map((char, j) => (
                <SyntaxHighlighterChar
                    key={j}
                    char={char}
                    start={start + j}
                    {...listeners}
                />
            ))}
        </span>
    );
};

/**
 * Renders the passed highlight nodes
 */
export const SyntaxHighlighterNodes: FC<ISyntaxHighlighterNodesProps> = ({
    nodes,
    ...listeners
}) => {
    // const {onMouseDown, onMouseUp, onMouseMove} = listeners;
    // const hasListeners = onMouseDown || onMouseUp || onMouseMove;
    return (
        <>
            {nodes.map((node, i) => (
                <SyntaxHighlighterNode key={i} node={node} {...listeners} />
            ))}
            {/* {
                const {text, start, tags} = node;
                const getPos = (e: React.MouseEvent<HTMLSpanElement>) =>
                    start + text.length * getPosFrac(e, true);
                const tokenContents = hasListeners ? (
                    <SyntaxHighlighterSplitNode node={node} {...listeners} />
                ) : (
                    text
                );

                return (
                    <SyntaxHighlighterNode key={i} node={node} {...listeners} />
                    <span
                        className={tags.join(" ") + (text == "" ? " empty" : "")}
                        onMouseDown={onMouseDown && (e => onMouseDown?.(e, getPos(e)))}
                        onMouseUp={onMouseUp && (e => onMouseUp?.(e, getPos(e)))}
                        onMouseMove={onMouseMove && (e => onMouseMove?.(e, getPos(e)))}
                        key={i}>
                        {tokenContents}
                    </span>
                );
            })} */}
        </>
    );
};
