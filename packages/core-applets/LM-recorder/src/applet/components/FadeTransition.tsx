import {Box, FillBox, IBoxProps, mergeStyles} from "@launchmenu/core";
import React, {
    FC,
    useRef,
    Fragment,
    ReactNode,
    useState,
    cloneElement,
    useEffect,
} from "react";
import {CSSTransition} from "react-transition-group";
import {IFadeTransitionProps} from "./_types/IFadeTransitionProps";

/** A component to transition between old and new states of the children elements */
export const FadeTransition: FC<IFadeTransitionProps> = ({
    deps,
    children,
    fadeProps = {},
    containerProps = {},
    innerProps = {},
    duration = 300,
    inDuration = duration,
    outDuration = duration,
}) => {
    const prevChildren = useRef(children);
    const prevDeps = useRef(deps);

    // Keep track of the nodes to be displayed
    const IDRef = useRef(0);
    const fadeChildren = useRef<{ID: number; node: ReactNode}[]>([]);

    // Add some way of removing non-visible old nodes
    const [_, update] = useState(0);
    const removeNode = (nodeID: number) => {
        fadeChildren.current = fadeChildren.current.filter(({ID}) => nodeID != ID);
        update(v => v + 1);
    };

    // Add a new node when dependencies changes
    const changed = new Array(Math.max(prevDeps.current.length, deps.length))
        .fill(0)
        .some((_, i) => prevDeps.current[i] != deps[i]);
    if (changed) {
        setTimeout(removeNode, outDuration, IDRef.current);
        fadeChildren.current.push({
            ID: IDRef.current++,
            node: prevChildren.current,
        });
    }
    prevChildren.current = children;
    prevDeps.current = deps;

    // Update the currently selected ID with a slight delay
    const elRef = useRef<HTMLElement>(null);
    const [curID, setNewID] = useState(IDRef.current - 1);
    useEffect(() => {
        elRef.current?.getBoundingClientRect(); // Force reflow for stability
        setNewID(IDRef.current);
    }, [IDRef.current]);

    // Include the current children
    const allChildren = [...fadeChildren.current, {ID: IDRef.current, node: children}];

    // Create the animations
    return (
        <Box
            elRef={elRef}
            {...containerProps}
            css={mergeStyles(
                {
                    ">*": {
                        opacity: 0,
                        transition: `opacity ${outDuration}ms`,
                        "&.visible": {
                            opacity: 1,
                            transition: `opacity ${inDuration}ms`,
                        },
                    },
                },
                containerProps.css
            )}>
            {allChildren.map(({ID, node}) => {
                const visible = ID == curID;
                const fading = ID < curID;
                return (
                    <Box
                        key={ID}
                        className={`fadeEl ${visible ? "visible" : ""} ${
                            innerProps.className ?? ""
                        }`}
                        {...innerProps}
                        {...(fading && fadeProps)}>
                        {node}
                    </Box>
                );
            })}
        </Box>
    );
};
