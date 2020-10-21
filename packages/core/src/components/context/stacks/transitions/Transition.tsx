import React, {
    FC,
    ReactNode,
    useRef,
    useState,
    useCallback,
    useEffect,
    memo,
} from "react";
import {SlideOpenTransition} from "./open/SlideOpenTransition";
import {SlideCloseTransition} from "./close/SlideCloseTransition";
import {v4 as uuid} from "uuid";
import {SlideChangeTransition} from "./change/SlideChangeTransition";
import {ITransitionProps} from "./_types/ITransitionProps";

export const defaultTransitions = {
    Open: SlideOpenTransition,
    Change: SlideChangeTransition,
    Close: SlideCloseTransition,
};

export const Transition: FC<ITransitionProps> = memo(
    ({
        children: child,
        skipMountAnimation,
        onOpen,
        onClose,
        onChange,
        hidden,
        OpenTransitionComp: InputOpenTransitionComp = defaultTransitions.Open,
        ChangeTransitionComp: InputChangeTransitionComp = defaultTransitions.Change,
        CloseTransitionComp: InputCloseTransitionComp = defaultTransitions.Close,
    }) => {
        // Track previous children to transition a change from
        const prevChildren = useRef([] as ReactNode[]);
        // Track the last child to detect child changes
        const lastChild = useRef(undefined as undefined | JSX.Element);

        // Manage possible changes to transition components (Don't update while they are animating)
        const inputTransitionComps = useRef({
            Change: InputChangeTransitionComp,
            Close: InputCloseTransitionComp,
        });
        inputTransitionComps.current.Change = InputChangeTransitionComp;
        inputTransitionComps.current.Close = InputCloseTransitionComp;
        const transitionComps = useRef({
            Open: InputOpenTransitionComp,
            Change: InputChangeTransitionComp,
            Close: InputCloseTransitionComp,
        });
        if (prevChildren.current.length == 1) {
            transitionComps.current.Change = InputChangeTransitionComp;
            transitionComps.current.Close = InputCloseTransitionComp;
        }

        // Reset the slide change transition whenever a change finishes (to reduce element count)
        const [changeID, setChangeID] = useState("initial");
        const _onChange = useCallback(() => {
            prevChildren.current = [lastChild.current];
            transitionComps.current = {
                ...transitionComps.current,
                ...inputTransitionComps.current,
            };
            onChange?.();
            setChangeID(uuid());
        }, [onChange]);

        // Detect if the child changed, and if it's not undefined
        const sameChild =
            lastChild.current == child ||
            (lastChild.current?.key && child?.key && lastChild.current.key == child.key);
        if (!sameChild && child) {
            prevChildren.current.push(child);
            lastChild.current = child;
        }

        // Handle change transitions
        const changeable = hidden ? undefined : prevChildren.current.length > 1 ? (
            <transitionComps.current.Change key={changeID} onComplete={_onChange}>
                {prevChildren.current}
            </transitionComps.current.Change>
        ) : (
            child || lastChild.current
        );

        // Handle close changes
        const closable = (
            <transitionComps.current.Close
                activate={!child && !!lastChild.current}
                onComplete={onClose}>
                {changeable}
            </transitionComps.current.Close>
        );

        // Handle opening changes
        const skipMount = useRef(skipMountAnimation);
        return skipMount.current ? (
            closable
        ) : (
            <transitionComps.current.Open
                onComplete={onOpen}
                activate={!!child || !!lastChild.current}>
                {closable}
            </transitionComps.current.Open>
        );
    }
);
