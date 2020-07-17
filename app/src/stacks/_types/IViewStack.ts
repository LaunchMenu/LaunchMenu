import {IIdentifiedItem} from "./IIdentifiedItem";
import {IViewStackItem} from "./IViewStackItem";
import {IDataHook} from "model-react";

/** A stack of view that can be rendered */
export type IViewStack = {
    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     * @returns The id that was generated for this item
     */
    push(item: IIdentifiedItem<IViewStackItem> | IViewStackItem | IViewStack): string;
    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     */
    push(
        ...item: (IIdentifiedItem<IViewStackItem> | IViewStackItem | IViewStack)[]
    ): void;

    /**
     * Removes an item or substack from the top of the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    pop(
        ...item: (
            | IIdentifiedItem<IViewStackItem>
            | {id: string}
            | IViewStackItem
            | IViewStack
        )[]
    ): boolean;

    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     * @returns The provided id or one that was generated for this item
     */
    insert(item: IIdentifiedItem<IViewStackItem> | IViewStackItem, index: number): string;
    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    insert(item: IViewStack, index: number): void;

    /**
     * Removes an item anywhere in the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    remove(
        item: IIdentifiedItem<IViewStackItem> | {id: string} | IViewStackItem | IViewStack
    ): boolean;

    // Data retrieval
    /**
     * Retrieves all items and substacks in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items and substacks
     */
    getRaw(hook?: IDataHook): readonly (IIdentifiedItem<IViewStackItem> | IViewStack)[];

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    get(hook?: IDataHook): readonly IIdentifiedItem<IViewStackItem>[];

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    getTop(hook?: IDataHook): undefined | IIdentifiedItem<IViewStackItem>;
};
