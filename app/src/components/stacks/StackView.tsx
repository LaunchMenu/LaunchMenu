import React, {FC, useRef, createElement, useState, cloneElement} from "react";
import {IStackViewProps} from "./_types/IStackViewProps";
import {findStackChanges} from "../../stacks/findStackChanges";
import {IIdentifiedItem} from "../../stacks/_types/IIdentifiedItem";
import {IViewStackItem, IViewStackItemView} from "../../stacks/_types/IViewStackItem";
import {Transition} from "./transitions/Transition";
import {useDataHook} from "model-react";
import {getViewStackItemElement} from "./getViewStackItemElement";

type IStackViewChild = {
    // A key for this specific transition element
    key: string;
    // The ID of the item contained in this transition
    id: string;
    // The element that's currently shown
    element: IViewStackItemView | undefined;
    // Whether the transition element is currently closing
    closing: boolean;
    // Whether the transition element is currently opening
    opening: boolean;
    // Whether any of the elements that are still in the change transition are transparent
    wasTransparent: boolean;
    // Whether the current element is transparent
    transparent: boolean;
};

/**
 * Updates the children array, replacing, adding or removing children
 * @param items The new items array
 * @param prevItems The old items array
 * @param children The children list to modify
 */
function updateChildren(
    items: readonly IIdentifiedItem<IViewStackItem>[],
    prevItems: readonly IIdentifiedItem<IViewStackItem>[],
    children: IStackViewChild[]
): void {
    const {added, removed} = findStackChanges(prevItems, items);
    removed.forEach(({item}) => {
        const child = children.find(({id}) => id == item.id);
        if (child) child.element = undefined;
    });
    added.forEach(({index, item}) => {
        // Find the index to add the item at
        let childIndex: number;
        if (index > 0) {
            const itemBefore = items[index - 1];
            childIndex = children.findIndex(({id}) => id == itemBefore.id) + 1;
        } else {
            childIndex = 0;
        }

        // Create the view element
        let view: FC<{onTop: boolean; index: number}> | JSX.Element;
        if ("view" in item.value) view = item.value.view;
        else view = item.value;
        const transparent = "transparent" in item.value ? item.value.transparent : false;

        // Add the child or replace a previous child
        const currentChild = children[childIndex];
        if (currentChild && currentChild.element == undefined && !currentChild.closing) {
            currentChild.element = view;
            currentChild.id = item.id;
            currentChild.wasTransparent =
                currentChild.wasTransparent || currentChild.transparent;
            currentChild.transparent = transparent;
        } else {
            children.splice(childIndex, 0, {
                key: item.id,
                id: item.id,
                element: view,
                closing: false,
                opening: true,
                wasTransparent: false,
                transparent,
            });
        }
    });
    removed.forEach(({item}) => {
        const child = children.find(({id}) => id == item.id);
        if (child && !child.element) child.closing = true;
    });
}

/**
 * Visualizes a stack of views
 */
export const StackView: FC<IStackViewProps> = ({
    stack,
    smartHide = true,
    ChangeTransitionComp,
    CloseTransitionComp,
    OpenTransitionComp,
}) => {
    // Retrieve the items
    const [h] = useDataHook();
    const items = stack.get(h);
    const prevItems = useRef<readonly IIdentifiedItem<IViewStackItem>[]>([]);

    // Keep track of the children to render
    const childrenRef = useRef([] as IStackViewChild[]);

    // Update the elements to render when the items array changes
    if (prevItems.current != items) {
        updateChildren(items, prevItems.current, childrenRef.current);
        prevItems.current = items;
    }

    // Handle transition changes
    const [_, forceUpdate] = useState(false);
    const onClose = (key: string) => {
        const children = childrenRef.current;
        const index = children.findIndex(({key: k}) => k == key);
        if (index != -1) {
            children.splice(index, 1);
            forceUpdate(a => !a);
        }
    };
    const onOpen = (key: string) => {
        const children = childrenRef.current;
        const child = children.find(({key: k}) => k == key);
        if (child) {
            child.opening = false;
            forceUpdate(a => !a);
        }
    };
    const onChange = (key: string) => {
        const children = childrenRef.current;
        const child = children.find(({key: k}) => k == key);
        if (child) {
            child.wasTransparent = false;
            forceUpdate(a => !a);
        }
    };

    // Find the first index that needs to be rendered
    const children = childrenRef.current;
    let firstOpaqueIndex = smartHide ? children.length : 0;
    let childTransparent = true;
    while (childTransparent && --firstOpaqueIndex >= 0) {
        const child = children[firstOpaqueIndex];
        childTransparent =
            child.opening || child.closing || child.transparent || child.wasTransparent;
    }

    // Render the children
    return (
        <>
            {childrenRef.current.map(({key, id, element}, index) => {
                const props = {
                    key: id,
                    onTop: index == childrenRef.current.length,
                    stack,
                    index,
                };
                return (
                    <Transition
                        key={key}
                        hidden={index < firstOpaqueIndex}
                        onClose={() => onClose(key)}
                        onChange={() => onChange(key)}
                        onOpen={() => onOpen(key)}
                        ChangeTransitionComp={ChangeTransitionComp}
                        CloseTransitionComp={CloseTransitionComp}
                        OpenTransitionComp={OpenTransitionComp}>
                        {element && getViewStackItemElement(element, props)}
                    </Transition>
                );
            })}
        </>
    );
};
