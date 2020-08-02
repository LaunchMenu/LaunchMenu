import {FC} from "react";
import {IViewStackItemProps} from "./IViewStackItemProps";

/**
 * An item that can be added to view stacks
 */
export type IViewStackItem =
    | {view: FC<IViewStackItemProps> | JSX.Element; transparent: boolean}
    | FC<IViewStackItemProps>
    | JSX.Element;

/**
 * Checks whether the given item is a view
 * @param item The item to check for
 * @returns Whether the item is a view
 */
export function isView(item: any): item is IViewStackItem {
    return (
        (item.view && item.transparent) ||
        item instanceof Function ||
        (item.type && item.props)
    );
}
