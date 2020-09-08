import {Field, IDataHook, isDataLoadRequest} from "model-react";
import {IUUID} from "../../_types/IUUID";
import {createCallbackHook} from "../modelReact/createCallbackHook";
import {ISearchable} from "./_types/ISearchable";
import {ISearchNode} from "./_types/ISearchNode";

/**
 * A class that can be used to perform a search.
 * The order in which items are retrieved is meaningless, sorting should be applied in one form or another afterwards.
 */
export class SearchExecuter<Q, I> {
    protected rootSearchable: ISearchable<Q, I>;
    protected onAdd?: (item: I) => void;
    protected onRemove?: (item: I) => void;

    protected query = new Field(null as Q | null);
    protected results = new Field([] as I[]);

    protected searching = new Field(false);
    protected searchPromise = Promise.resolve();
    protected nodes = {} as {
        [key: string]: ISearchNode<Q, I>;
        [key: number]: ISearchNode<Q, I>;
    };
    protected removalQueue = [] as IUUID[];
    protected updateQueue = [] as ISearchable<Q, I>[];

    /**
     * Creates a new search executor
     * @param config The search configuration
     */
    public constructor({
        searchable,
        onAdd,
        onRemove,
    }: {
        searchable: ISearchable<Q, I>;
        onAdd?: (item: I) => void;
        onRemove?: (item: I) => void;
    }) {
        this.rootSearchable = searchable;
        this.onAdd = onAdd;
        this.onRemove = onRemove;
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
        this.searching.set(false);
        return this.searchPromise.then(() => {
            // Cancel the planned removals
            this.removalQueue = [];

            // Retrieve all the nodes that returned data
            const nodes = Object.values(this.nodes);
            const itemNodes = nodes.filter(({item}) => item);
            const emptyNodes = nodes.filter(({item}) => !item);
            const searchables = [...itemNodes, ...emptyNodes].map(
                ({searchable}) => searchable
            );

            // Schedule an update for all current nodes
            this.updateQueue = searchables;
            if (!this.nodes[this.rootSearchable.id])
                this.updateQueue.unshift(this.rootSearchable);

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
                    this.searching.get(null) &&
                    (this.removalQueue.length > 0 || this.updateQueue.length > 0)
                ) {
                    if (this.removalQueue.length > 0) {
                        const first = this.removalQueue.shift() as IUUID;
                        await this.nodeRemoval(first);
                    } else {
                        const first = this.updateQueue.shift() as ISearchable<Q, I>;
                        await this.nodeUpdate(query, first);
                    }
                }
            }
            // If there is no query, only perform removals
            else {
                while (this.searching.get(null) && this.removalQueue.length > 0) {
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
        this.updateQueue = this.updateQueue.filter(({id}) => !ids.includes(id));
        if (!this.searching.get(null)) this.search();
    }

    /**
     * Schedules and starts the updates of nodes of the given searchables
     * @param searchables The searchable data of nodes to add
     * @param highPriority Whether to prioritize this item
     */
    protected scheduleUpdates(
        searchables: ISearchable<Q, I>[],
        highPriority: boolean = false
    ): void {
        if (highPriority) this.updateQueue.unshift(...searchables);
        else this.updateQueue.push(...searchables);
        if (!this.searching.get(null)) this.search();
    }

    /**
     * Removes the node with the given id
     * @param id The ID of the node to remove
     */
    protected async nodeRemoval(id: IUUID): Promise<void> {
        const prevResult = this.nodes[id];
        if (prevResult.item) this.removeItem(prevResult.item);
        if (prevResult.children) this.scheduleRemovals(prevResult.children);
        delete this.nodes[id];
    }

    /**
     * Updates the given node
     * @param query The query to apply
     * @param searchable The node to be updated
     */
    protected async nodeUpdate(query: Q, searchable: ISearchable<Q, I>): Promise<void> {
        // Create a hook to schedule an update if the node is changed
        const hook = createCallbackHook(() => {
            this.scheduleUpdates([searchable], true);
        });

        // Invoke the search to obtain its new results
        const result = await searchable.search(query, hook);
        const newChildren = result.children?.map(({id}) => id) || [];

        const prevResult = this.nodes[searchable.id];
        if (prevResult) {
            // Remove the old item
            if (prevResult.item !== undefined) this.removeItem(prevResult.item);

            // Obtain the added and removed IDs
            const oldChildren = prevResult.children.filter(id => this.nodes[id]); // Don't consider the ones that weren't processed yet
            const additions = (result.children ?? []).filter(
                ({id}) => !oldChildren.includes(id)
            );
            const removals = oldChildren.filter(id => !newChildren.includes(id));

            // Schedule the updates
            this.scheduleRemovals(removals);
            this.scheduleUpdates(additions);
        } else {
            // Schedule all returned items as updates
            const additions = result.children ?? [];
            this.scheduleUpdates(additions);
        }

        // Add the new item
        if (result.item) this.addItem(result.item);

        // Store the create node
        this.nodes[searchable.id] = {
            searchable,
            item: result.item,
            children: newChildren,
        };
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
