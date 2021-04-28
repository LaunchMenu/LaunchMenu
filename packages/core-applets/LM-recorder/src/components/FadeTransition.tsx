import {Box, IBoxProps, mergeStyles} from "@launchmenu/core";
import React, {FC, useRef, Fragment, ReactNode, useState} from "react";
import {CSSTransition} from "react-transition-group";

/** A component to transition between old and new states of the children elements */
export const FadeTransition: FC<{
    deps: any[];
    containerProps?: IBoxProps;
    duration?: number;
}> = ({deps, children, containerProps = {}, duration = 300}) => {
    const prevChildren = useRef(children);
    const prevDeps = useRef(deps);

    // Keep track of the nodes to be displayed
    const IDRef = useRef(0);
    const fadeChildren = useRef<{ID: number; node: ReactNode}[]>([]);

    // Add a new node when dependencies changes
    const changed = new Array(Math.max(prevDeps.current.length, deps.length))
        .fill(0)
        .some((_, i) => prevDeps.current[i] != deps[i]);
    if (changed) {
        fadeChildren.current.push({
            ID: IDRef.current++,
            node: prevChildren.current,
        });
    }
    prevChildren.current = children;
    prevDeps.current = deps;

    // Add some way of removing non-visible old nodes
    const [_, update] = useState(0);
    const removeNode = (nodeID: number) => {
        fadeChildren.current = fadeChildren.current.filter(({ID}) => nodeID != ID);
        update(v => v + 1);
    };

    // Create the animations
    const allChildren = [...fadeChildren.current, {ID: IDRef.current, node: children}];
    return (
        <Box
            {...containerProps}
            css={mergeStyles(
                {
                    ".transition-appear": {
                        opacity: 0,
                    },
                    ".transition-appear-active": {
                        opacity: 1,
                        transition: `opacity ${duration}ms`,
                    },
                    ".transition-exit": {
                        opacity: 1,
                    },
                    ".transition-exit-active": {
                        opacity: 0,
                        transition: `opacity ${duration}ms`,
                    },
                },
                containerProps.css
            )}>
            {allChildren.map(({ID, node}) => (
                <CSSTransition
                    key={ID}
                    onExited={() => removeNode(ID)}
                    in={ID == IDRef.current}
                    appear
                    timeout={duration}
                    mountOnEnter
                    classNames="transition">
                    {node}
                </CSSTransition>
            ))}
        </Box>
    );
};
