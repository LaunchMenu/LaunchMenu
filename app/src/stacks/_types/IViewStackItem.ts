import {FC} from "react";

/**
 * An item that can be added to view stacks
 */
export type IViewStackItem =
    | {view: FC<{onTop: boolean; index: number}> | JSX.Element; transparent: boolean}
    | FC<{onTop: boolean; index: number}>
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
