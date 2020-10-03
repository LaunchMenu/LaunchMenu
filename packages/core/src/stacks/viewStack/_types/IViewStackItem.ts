import {isValidElement} from "react";
import {LFC} from "../../../_types/LFC";
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
export type IViewStackItemView = LFC<IViewStackItemProps> | JSX.Element;

/**
 * Checks whether the given item is a view
 * @param item The item to check for
 * @returns Whether the item is a view
 */
export function isView(item: any): item is IViewStackItem {
    return item.close || item.view || item instanceof Function || isValidElement(item);
}
