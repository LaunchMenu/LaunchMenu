import {FC, isValidElement} from "react";
import {IViewStackItemProps} from "./IViewStackItemProps";
import {IViewTransitions} from "./IViewTransitions";

/**
 * An item that can be added to view stacks
 */
export type IViewStackItem =
    | {close: true; closeTransitionDuration?: number}
    | IViewStackViewItem;

/**
 * An item that can be added to view stacks
 */
export type IViewStackViewItem =
    | {view: IViewStackItemView; transparent?: boolean; transitions?: IViewTransitions}
    | IViewStackItemView;

/**
 * The view of a view stack item
 */
export type IViewStackItemView = FC<IViewStackItemProps> | JSX.Element;

/**
 * Checks whether the given item is a view
 * @param item The item to check for
 * @returns Whether the item is a view
 */
export function isView(item: any): item is IViewStackItem {
    return (
        (item.view && item.transparent) ||
        item instanceof Function ||
        isValidElement(item)
    );
}
