import {Field, IDataHook, isDataLoadRequest} from "model-react";
import {IUUID} from "../../_types/IUUID";
import {ExtendedObject} from "../ExtendedObject";
import {createCallbackHook} from "../modelReact/createCallbackHook";
import {IPatternMatch} from "./_types/IPatternMatch";
import {ISearchable} from "./_types/ISearchable";
import {ISearchExecuterConfig} from "./_types/ISearchExecuterConfig";
import {ISearchNode} from "./_types/ISearchNode";
/**
 * This class can be used to perform a 'recursive' search.
 * Every searchable item can return an item if it matched the search, and child searchables that should also be checked.
 * In addition the searchable will receive a hook when invoked, which it can use to notify the executer of changes.
 * When it's notified of changes, it will redo the search of the relevant item, and possibly invoke or remove changed child searchables.
 *
 * In addition any searchable can indicate it matches some 'pattern' which can be any pattern the searchable decides on.
 * If such a pattern is matched, all items that don't match a pattern will automatically be removed.
 */

/**
 * A class that can be used to perform a search.
 * The order in which items are retrieved is meaningless, sorting should be applied in one form or another afterwards.
 */
export class SearchExecuter<Q, I> {
    protected rootSearchable: ISearchable<Q, I>;
    protected onAdd?: (item: I) => void;
    protected onRemove?: (item: I) => void;
    protected getPatternMatch: (
        match: IPatternMatch,
        currentMatches: IPatternMatch[]
    ) => IPatternMatch | undefined;

    protected query = new Field(null as Q | null);
    protected results = new Field([] as I[]);

    protected interruptSearch = false;
    protected searching = new Field(false);
    protected searchPromise = Promise.resolve();
    protected foundPatternMatches = new Field([] as IPatternMatch[]);

    protected nodes = new Map() as Map<IUUID, ISearchNode<Q, I>>; // All nodes
    protected itemNodes = new Set() as Set<IUUID>; // Nodes that returned items
    protected emptyNodes = new Set() as Set<IUUID>; // Nodes that returned no items
    protected matchingPatternNodes = new Set() as Set<IUUID>; // Nodes that specified they match a pattern

    protected removalQueue = [] as IUUID[];
    protected updateQueue = [] as ISearchNode<Q, I>[];

    /**
     * Creates a new search executor
     * @param config The search configuration
     */
    public constructor({
        searchable,
        onAdd,
        onRemove,
        getPatternMatch = (match, currentMatches) =>
            currentMatches.find(m => ExtendedObject.deepEquals(m, match)) ?? match,
    }: ISearchExecuterConfig<Q, I>) {
        this.rootSearchable = searchable;
        this.onAdd = onAdd;
        this.onRemove = onRemove;
        this.getPatternMatch = getPatternMatch;
    }

    // Interaction
    /**
     * Updates the query and calls the onAdd and onRemove callbacks accordingly
     * @param query The query to use
     * @returns A promise that resolves when the search completes
     */
    public setQuery(query: Q): Promise<void> {
        this.query.set(query);

        // Stop the search, and wait until it fully stopped
        let s = Date.now();
        this.interruptSearch = true;
        return this.searchPromise.then(() => {
            this.interruptSearch = false;

            // Cancel the planned removals
            this.removalQueue = [];

            // Retrieve all searchables, with nodes returning items prioritized
            const searchables = [
                ...Array.from(this.itemNodes).map(id => this.nodes.get(id)),
                ...Array.from(this.emptyNodes).map(id => this.nodes.get(id)),
            ] as ISearchNode<Q, I>[];

            // Schedule an update for all current nodes
            this.updateQueue = searchables;
            if (!this.nodes.get(this.rootSearchable.id))
                this.updateQueue.unshift({
                    searchable: this.rootSearchable,
                    children: [],
                });

            // Start the search
            return this.search();
        });
    }

    /**
     * Retrieves the current query
     * @param hook The hook to subscribe to changes
     * @returns The current query
     */
    public getQuery(hook: IDataHook = null): Q | null {
        return this.query.get(hook);
    }

    /**
     * Retrieves the results of the current query
     * @param hook The hook to subscribe to changes, and check if data is still loading
     * @returns The current results
     */
    public getResults(hook: IDataHook = null): I[] {
        if (isDataLoadRequest(hook) && this.searching.get(hook)) hook.markIsLoading?.();
        return this.results.get(hook);
    }

    /**
     * Retrieves whether a search is currently in progress
     * @param hook The hook to subscribe to changes
     * @returns Whether any search is in progress
     */
    public isSearching(hook: IDataHook = null): boolean {
        return this.searching.get(hook);
    }

    /**
     * Retrieves any patterns that the search may have matched in items
     * @param hook The hook to subscribe to changes
     * @returns The found patterns
     */
    public getPatternMatches(hook: IDataHook = null): IPatternMatch[] {
        if (isDataLoadRequest(hook) && this.searching.get(hook)) hook.markIsLoading?.();
        return this.foundPatternMatches.get(hook);
    }

    // Search implementation
    /**
     * Starts the search process handling the items in the update and removal queue
     */
    protected async search(): Promise<void> {
        return (this.searchPromise = (async () => {
            // TODO: increase parallelization
            const query = this.query.get(null);
            this.searching.set(true);

            // If there is a query, perform both node updates and removals
            if (query != null) {
                while (
                    !this.interruptSearch &&
                    (this.removalQueue.length > 0 || this.updateQueue.length > 0)
                ) {
                    if (this.removalQueue.length > 0) {
                        const first = this.removalQueue.shift() as IUUID;
                        await this.nodeRemoval(first);
                    } else {
                        const first = this.updateQueue.shift() as ISearchNode<Q, I>;
                        await this.nodeUpdate(query, first);
                    }
                }
            }
            // If there is no query, only perform removals
            else {
                while (!this.interruptSearch && this.removalQueue.length > 0) {
                    const first = this.removalQueue.shift() as IUUID;
                    await this.nodeRemoval(first);
                }
            }
            this.searching.set(false);
        })());
    }

    /**
     * Schedules and starts the removal of nodes with the given ids
     * @param ids The ids of the nodes to be removed
     */
    protected scheduleRemovals(ids: IUUID[]): void {
        this.removalQueue.push(...ids);
        this.updateQueue = this.updateQueue.filter(
            ({searchable: {id}}) => !ids.includes(id)
        );
        if (!this.searching.get(null)) this.search();
    }

    /**
     * Schedules and starts the updates of the given nodes
     * @param nodes The nodes to be scheduled
     * @param highPriority Whether to prioritize this item
     */
    protected scheduleUpdates(
        nodes: ISearchNode<Q, I>[],
        highPriority: boolean = false
    ): void {
        if (highPriority) this.updateQueue.unshift(...nodes);
        else this.updateQueue.push(...nodes);
        if (!this.searching.get(null)) this.search();
    }

    /**
     * Removes the node with the given id
     * @param id The ID of the node to remove
     */
    protected async nodeRemoval(id: IUUID): Promise<void> {
        const prevResult = this.nodes.get(id);
        if (prevResult) {
            if (prevResult.item) this.removeItem(prevResult.item);
            if (prevResult.children) this.scheduleRemovals(prevResult.children);
            if (prevResult.patternMatch)
                this.removePatternMatch(id, prevResult.patternMatch);

            this.nodes.delete(id);
            this.itemNodes.delete(id);
            this.emptyNodes.delete(id);
        }
    }

    /**
     * Updates the given node
     * @param query The query to apply
     * @param node The node to be updated
     */
    protected async nodeUpdate(query: Q, node: ISearchNode<Q, I>): Promise<void> {
        const id = node.searchable.id;
        node = this.nodes.get(id) || node; // Prefer a newer version of the node if it exists

        // Create a hook to schedule an update if the node is changed
        node.destroyHook?.();
        const [hook, destroyHook] = createCallbackHook(() => {
            this.scheduleUpdates([node], true);
        });

        // Invoke the search to obtain its new results
        const result = await node.searchable.search(query, hook, this);
        const newChildren = result.children?.map(({id}) => id) || [];
        const patternMatch =
            result.patternMatch &&
            this.getPatternMatch(result.patternMatch, this.foundPatternMatches.get(null));

        // Obtain the added and removed IDs
        const oldChildren = node.children.filter(id => this.nodes.get(id)); // Don't consider the ones that weren't processed yet
        const additions = (result.children ?? []).filter(
            ({id}) => !oldChildren.includes(id)
        );
        const removals = oldChildren.filter(id => !newChildren.includes(id));

        // Schedule the updates
        this.scheduleRemovals(removals);
        this.scheduleUpdates(
            additions.map(searchable => ({
                searchable,
                children: [],
                parent: id,
            }))
        );

        // Update the item
        const matchesPattern =
            result.patternMatch || this.foundPatternMatches.get(null).length == 0;
        if (node.item !== undefined) this.removeItem(node.item);
        if (result.item && matchesPattern) this.addItem(result.item);

        if (result.item) {
            this.itemNodes.add(id);
            this.emptyNodes.delete(id);
        } else {
            this.emptyNodes.add(id);
            this.itemNodes.delete(id);
        }

        // Store the created node
        const newNode: ISearchNode<Q, I> = {
            ...node,
            item: result.item,
            patternMatch,
            children: newChildren,
            destroyHook,
        };
        this.nodes.set(id, newNode);

        // Update pattern matches
        if (patternMatch) this.addPatternMatch(id, patternMatch);
        else if (node.patternMatch) this.removePatternMatch(id, node.patternMatch);
    }

    /**
     * Specifies that the given node no longer matches a pattern
     * @param id The id of the node that matched a pattern
     * @param prevMatch The match that was removed
     */
    protected removePatternMatch(id: IUUID, prevMatch: IPatternMatch): void {
        this.matchingPatternNodes.delete(id);

        const existsOtherNodeWithPattern = Object.values(this.matchingPatternNodes).find(
            nId => this.nodes.get(nId)?.patternMatch == prevMatch
        );
        if (!existsOtherNodeWithPattern) {
            const newMatches = this.foundPatternMatches
                .get(null)
                .filter(m => m != prevMatch);
            this.foundPatternMatches.set(newMatches);

            // If this was the last pattern match, add back unmatched items
            if (newMatches.length == 0) {
                this.itemNodes.forEach(id => {
                    if (!this.matchingPatternNodes.has(id)) {
                        const item = this.nodes.get(id)?.item;
                        if (item) this.addItem(item);
                    }
                });
            }
        }
    }

    /**
     * Specifies that the given node now matches a pattern
     * @param id The id of the node that matches a pattern
     * @param match The pattern match that was found
     */
    protected addPatternMatch(id: IUUID, match: IPatternMatch): void {
        const currentMatches = this.foundPatternMatches.get(null);
        this.matchingPatternNodes.add(id);

        if (!currentMatches.find(m => m == match))
            this.foundPatternMatches.set([...currentMatches, match]);

        // If this was the first pattern match, remove any unmatched items
        if (currentMatches.length == 0) {
            this.itemNodes.forEach(id => {
                if (!this.matchingPatternNodes.has(id)) {
                    const item = this.nodes.get(id)?.item;
                    if (item) this.removeItem(item);
                }
            });
        }
    }

    /**
     * Removes the given item
     * @param item The item to be removed
     */
    protected removeItem(item: I): void {
        this.onRemove?.(item);
        // TODO: improve performance by batching
        this.results.set(this.results.get(item).filter(t => t != item));
    }

    /**
     * Adds the given item
     * @param item The item to be added
     */
    protected addItem(item: I): void {
        this.onAdd?.(item);
        // TODO: improve performance by batching
        this.results.set([...this.results.get(item), item]);
    }
}
