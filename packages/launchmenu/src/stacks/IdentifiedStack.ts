import {Stack} from "./Stack";
import {IIdentifiedItem} from "./_types/IIdentifiedItem";
import {v4 as uuid} from "uuid";

/**
 * A stack of items and substacking system
 */
export class IdentifiedStack<T> extends Stack<IIdentifiedItem<T>> {
    // Overwrite the equivalence of two items
    protected equals: (
        a: IIdentifiedItem<T> | this,
        b: IIdentifiedItem<T> | this
    ) => boolean = (a, b) =>
        ("id" in a &&
            "id" in b &&
            (a.id == b.id || ((!a.id || !b.id) && a.value == b.value))) ||
        a == b;

    /**
     * Creates a new stack
     * @param init The initial items of the stack
     */
    public constructor(init?: (T | IIdentifiedItem<T>)[]) {
        super(
            init
                ? init.map(item =>
                      typeof item != "object" || !("id" in item)
                          ? {id: uuid(), value: item}
                          : item
                  )
                : undefined
        );
    }

    /**
     * Maps input items for removal to items accepted by the stack class this class extends
     * @param items The items to map
     * @param generateID Whether to generate IDs for items without ids
     * @returns The mapped items
     */
    protected mapToSuperItems(
        items: (IIdentifiedItem<T> | {id: string} | T | this)[],
        generateID: boolean = false
    ): (IIdentifiedItem<T> | this)[] {
        return items.map(item => this.mapToSuperItem(item, generateID));
    }

    /**
     * Maps an input item for removal to an item accepted by the stack class this class extends
     * @param item The item to map
     * @param generateID Whether to generate IDs for items without ids
     * @returns The mapped item
     */
    protected mapToSuperItem(
        item: IIdentifiedItem<T> | {id: string} | T | this,
        generateID: boolean = false
    ): IIdentifiedItem<T> | this {
        if (typeof item == "object") {
            if (item instanceof Stack) {
                return item;
            } else if (!("id" in item)) {
                return {id: generateID ? uuid() : "", value: item};
            } else if (!("value" in item)) {
                return {id: item.id, value: null as any};
            } else {
                return item;
            }
        } else {
            return {id: generateID ? uuid() : "", value: item};
        }
    }

    // Primary alteration methods
    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     * @returns The id that was generated for this item
     */
    public push(item: IIdentifiedItem<T> | T | this): string;

    /**
     * Adds an item to the top of the stack
     * @param item The item to be added
     */
    public push(...item: (IIdentifiedItem<T> | T | this)[]): void;
    public push(...item: (IIdentifiedItem<T> | T | this)[]): string | void {
        const items = this.mapToSuperItems(item, true);
        super.push(...items);
        if (items.length && "id" in items[0]) return items[0].id;
    }

    /**
     * Removes an item or substack from the top of the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public pop(...item: (IIdentifiedItem<T> | {id: string} | T | this)[]): boolean {
        return super.pop(...this.mapToSuperItems(item));
    }

    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     * @returns The provided id or one that was generated for this item
     */
    public insert(item: IIdentifiedItem<T> | T, index: number): string;
    /**
     * Inserts an item into the stack
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    public insert(item: this, index: number): void;
    public insert(item: IIdentifiedItem<T> | T | this, index: number): string | void {
        item = this.mapToSuperItem(item, true);
        super.insert(item, index);
        if ("id" in item) return item.id;
    }

    /**
     * Removes an item anywhere in the stack
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public remove(item: IIdentifiedItem<T> | {id: string} | T | this): boolean {
        return super.remove(this.mapToSuperItem(item));
    }

    // Recursive methods that ignore the presence of substacks, handling the stack as if there's no hierarchy

    /**
     * Adds an item to the top of the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     * @return The id that was generated for this item
     */
    public pushFlat(item: IIdentifiedItem<T> | T | this): string;
    /**
     * Adds an item to the top of the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     */
    public pushFlat(...item: (IIdentifiedItem<T> | T | this)[]): void;
    public pushFlat(...item: (IIdentifiedItem<T> | T | this)[]): string | void {
        const items = this.mapToSuperItems(item, true);
        super.pushFlat(...items);
        if (items.length && "id" in items[0]) return items[0].id;
    }

    /**
     * Removes a single item from the top of the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public popFlat(item?: IIdentifiedItem<T> | {id: string} | T | this): boolean {
        return super.popFlat(item === undefined ? undefined : this.mapToSuperItem(item));
    }

    /**
     * Inserts an item into the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     * @param index The index to insert the item at
     * @returns The id that was generated for this item
     */
    public insertFlat(item: T, index: number): string;
    /**
     * Inserts an item into the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be added
     * @param index The index to insert the item at
     */
    public insertFlat(item: IIdentifiedItem<T> | this, index: number): void;
    public insertFlat(item: IIdentifiedItem<T> | T | this, index: number): void | string {
        return super.insertFlat(this.mapToSuperItem(item, true), index);
    }

    /**
     * Removes an item anywhere in the stack or substack,
     * ignores the presence of the stack hierarchy
     * @param item The item to be removed
     * @returns Whether the item was removed
     */
    public removeFlat(item: IIdentifiedItem<T> | {id: string} | T | this): boolean {
        return super.removeFlat(this.mapToSuperItem(item));
    }
}
