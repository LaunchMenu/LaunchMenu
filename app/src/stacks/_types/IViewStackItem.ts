import {FC, isValidElement} from "react";
import {IViewStackItemProps} from "./IViewStackItemProps";

/**
 * An item that can be added to view stacks
 */
export type IViewStackItem =
    | {view: IViewStackItemView; transparent: boolean}
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
