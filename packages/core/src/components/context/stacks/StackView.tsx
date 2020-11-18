import React, {memo, useRef, useState} from "react";
import {IStackViewProps} from "./_types/IStackViewProps";
import {IIdentifiedItem} from "../../../_types/IIdentifiedItem";
import {defaultTransitions, Transition} from "./transitions/Transition";
import {getViewStackItemElement} from "./getViewStackItemElement";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {LFC} from "../../../_types/LFC";
import {IUUID} from "../../../_types/IUUID";
import {
    IViewStackItem,
    IViewStackItemView,
} from "../../../uiLayers/_types/IViewStackItem";
import {IViewTransitions} from "../../../uiLayers/_types/IViewTransitions";
import {findStackChanges} from "../../../context/findStackChanges";

type IStackViewChild = {
    /** A key for this specific transition element */
    key: IUUID;
    /** The ID of the item contained in this transition */
    id: IUUID;
    /** The element that's currently shown */
    element: IViewStackItemView | undefined;
    /** Whether the transition element is currently closing */
    closing: boolean;
    /** Whether the transition element is currently opening */
    opening: boolean;
    /** Whether any of the elements that are still in the change transition are transparent */
    wasTransparent: boolean;
    /** Whether the current element is transparent */
    transparent: boolean;
    /** The transition components to use */
    transitions: Required<IViewTransitions>;
    /** Whether to skip the opening animation */
    skipOpening?: boolean;
};

/**
 * Updates the children array, replacing, adding or removing children
 * @param items The new items array
 * @param prevItems The old items array
 * @param children The children list to modify
 * @param defaultTransitions The default transitions to be used
 * @param skipOpening Whether to skip opening animation for the new items
 */
function updateChildren(
    items: readonly IIdentifiedItem<IViewStackItem>[],
    prevItems: readonly IIdentifiedItem<IViewStackItem>[],
    children: IStackViewChild[],
    defaultTransitions: Required<IViewTransitions>,
    skipOpening?: boolean
): void {
    const {added, removed} = findStackChanges(prevItems, items);
    removed.forEach(({item}) => {
        const child = children.find(({id}) => id == item.ID);
        if (child) child.element = undefined;
    });
    added.forEach(({index, item}) => {
        if ("close" in item.value) return;

        // Find the index to add the item at
        let childIndex: number;
        if (index > 0) {
            const itemBefore = items[index - 1];
            childIndex = children.findIndex(({id}) => id == itemBefore.ID) + 1;
        } else {
            childIndex = 0;
        }

        // Create the view element
        let view: IViewStackItemView;
        if ("view" in item.value) view = item.value.view;
        else view = item.value;
        const {transparent, transitions} =
            "transparent" in item.value || "transitions" in item.value
                ? item.value
                : {transparent: false, transitions: {}};

        // Add the child or replace a previous child
        const currentChild = children[childIndex];
        if (currentChild && currentChild.element == undefined && !currentChild.closing) {
            currentChild.element = view;
            currentChild.id = item.ID;
            currentChild.wasTransparent =
                currentChild.wasTransparent || currentChild.transparent;
            currentChild.transparent = transparent ?? false;
            currentChild.transitions = {...defaultTransitions, ...transitions};
        } else {
            children.splice(childIndex, 0, {
                key: item.ID,
                id: item.ID,
                element: view,
                closing: false,
                opening: skipOpening ? false : true,
                wasTransparent: false,
                transparent: transparent ?? false,
                transitions: {...defaultTransitions, ...transitions},
                skipOpening,
            });
        }
    });
    removed.forEach(({item}) => {
        const child = children.find(({id}) => id == item.ID);
        if (child && !child.element) child.closing = true;
    });
}

/**
 * Visualizes a stack of views
 */
export const StackView: LFC<IStackViewProps> = memo(
    ({
        stackGetter,
        smartHide = true,
        ChangeTransitionComp,
        CloseTransitionComp,
        OpenTransitionComp,
    }) => {
        // Retrieve the items
        const [h] = useDataHook();
        const items = stackGetter(h);
        const prevItems = useRef<readonly IIdentifiedItem<IViewStackItem>[]>();

        // Keep track of the children to render
        const childrenRef = useRef([] as IStackViewChild[]);

        // Update the elements to render when the items array changes
        if (prevItems.current != items) {
            updateChildren(
                items,
                prevItems.current ?? [],
                childrenRef.current,
                {
                    Open: OpenTransitionComp ?? defaultTransitions.Open,
                    Change: ChangeTransitionComp ?? defaultTransitions.Change,
                    Close: CloseTransitionComp ?? defaultTransitions.Close,
                },
                prevItems.current == undefined
            );
            prevItems.current = items;
        }

        // Handle transition changes
        const [_, _forceUpdate] = useState(false);
        const forceUpdate = () => _forceUpdate(a => !a);
        const onClose = (key: IUUID) => {
            const children = childrenRef.current;
            const index = children.findIndex(({key: k}) => k == key);
            if (index != -1) {
                children.splice(index, 1);
                forceUpdate();
            }
        };
        const onOpen = (key: IUUID) => {
            const children = childrenRef.current;
            const child = children.find(({key: k}) => k == key);
            if (child) {
                child.opening = false;
                forceUpdate();
            }
        };
        const onChange = (key: IUUID) => {
            const children = childrenRef.current;
            const child = children.find(({key: k}) => k == key);
            if (child) {
                child.wasTransparent = false;
                forceUpdate();
            }
        };

        // Find the first index that needs to be rendered
        const children = childrenRef.current;
        let firstOpaqueIndex = smartHide ? children.length : 0;
        let childTransparent = true;
        while (childTransparent && --firstOpaqueIndex >= 0) {
            const child = children[firstOpaqueIndex];
            childTransparent =
                child.opening ||
                child.closing ||
                child.transparent ||
                child.wasTransparent;
        }

        // Render the children
        return (
            <>
                {childrenRef.current.map(
                    ({key, id, element, transitions, skipOpening}, index) => {
                        const props = {
                            key: id,
                            onTop: index == childrenRef.current.length,
                            stack: items,
                            index,
                        };
                        const el = element && getViewStackItemElement(element, props);
                        return (
                            <Transition
                                key={key}
                                hidden={index < firstOpaqueIndex}
                                onClose={() => onClose(key)}
                                onChange={() => onChange(key)}
                                onOpen={() => onOpen(key)}
                                skipMountAnimation={skipOpening}
                                ChangeTransitionComp={transitions.Change}
                                CloseTransitionComp={transitions.Close}
                                OpenTransitionComp={transitions.Open}>
                                {el}
                            </Transition>
                        );
                    }
                )}
            </>
        );
    }
);
