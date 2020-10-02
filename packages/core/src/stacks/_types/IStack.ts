import {IDataHook} from "model-react";

/**
 * A data structure to maintain a stack of items
 */
export type IStack<T> = {
    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     */
    push(...item: (T | IStack<T>)[]): void;

    /**
     * Removes an item or substack from the top of the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    pop(...item: (T | IStack<T>)[]): boolean;

    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    insert(item: T | IStack<T>, index: number): void;

    /**
     * Removes an item anywhere in the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    remove(item: T | IStack<T>): boolean;

    // Data retrieval
    /**
     * Retrieves all items and substacks in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items and substacks
     */
    getRaw(hook?: IDataHook): readonly (T | IStack<T>)[];

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    get(hook?: IDataHook): readonly T[];

    /**
     * Retrieves all items in sequence on the stack
     * @param hook The hook to subscribe to changes
     * @returns THe list of items
     */
    getTop(hook?: IDataHook): undefined | T;
};
