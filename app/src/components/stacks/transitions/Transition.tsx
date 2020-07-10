import React, {FC, ReactNode, useRef, useState, useCallback, useEffect} from "react";
import {SlideOpenTransition} from "./open/SlideOpenTransition";
import {SlideCloseTransition} from "./close/SlideCloseTransition";
import {v4 as uuid} from "uuid";
import {SlideChangeTransition} from "./change/SlideChangeTransition";
import {ICloseTransition} from "./close/_types/ICloseTransition";
import {IOpenTransition} from "./open/_types/IOpenTransition";
import {IChangeTransition} from "./change/_types/IChangeTransition";

export const Transition: FC<{
    children?: JSX.Element;
    onOpen?: () => void;
    onClose?: () => void;
    onChange?: () => void;
    OpenTransitionComp?: IOpenTransition;
    ChangeTransitionComp?: IChangeTransition;
    CloseTransitionComp?: ICloseTransition;
}> = ({
    children: child,
    onOpen,
    onClose,
    onChange,
    OpenTransitionComp = SlideOpenTransition,
    ChangeTransitionComp = SlideChangeTransition,
    CloseTransitionComp = SlideCloseTransition,
}) => {
    // Track previous children to transition a change from
    const prevChildren = useRef([] as ReactNode[]);
    // Track the last child to detect child changes
    const lastChild = useRef(undefined as undefined | JSX.Element);

    // Reset the slide change transition whenever a change finishes (to reduce element count)
    const [changeID, setChangeID] = useState("initial");
    const _onChange = useCallback(() => {
        prevChildren.current = [lastChild.current];
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
    const changeable =
        prevChildren.current.length > 1 ? (
            <ChangeTransitionComp key={changeID} onComplete={_onChange}>
                {prevChildren.current}
            </ChangeTransitionComp>
        ) : (
            child || lastChild.current
        );

    // Handle open and close changes
    const closable = (
        <CloseTransitionComp
            activate={!child && !!lastChild.current}
            onComplete={onClose}>
            {changeable}
        </CloseTransitionComp>
    );

    return (
        <OpenTransitionComp onComplete={onOpen} activate={!!child || !!lastChild.current}>
            {closable}
        </OpenTransitionComp>
    );
};
