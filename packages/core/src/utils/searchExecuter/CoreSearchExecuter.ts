import {Field, IDataHook} from "model-react";
import {IUUID} from "../../_types/IUUID";
import {createCallbackHook} from "../createCallbackHook";
import {PromiseAll} from "../PromiseAll";
import {Queue} from "../Queue";
import {ISearchable} from "./_types/ISearchable";
import {ICoreSearchNode} from "./_types/ICoreSearchNode";
import {
    ICoreSearchExecuterConfig,
    ICoreSearchResult,
} from "./_types/ICoreSearchExecuterConfig";
import {SearchExecuter} from "./SearchExecuter";

/**
 * The core of the search executer that will obtain all the results
 */
export class CoreSearchExecuter<Q, I> {
    protected rootSearchable: ISearchable<Q, I>;
    protected onUpdate: (
        ID: IUUID,
        result: ICoreSearchResult<I>,
        oldResult: ICoreSearchResult<I>
    ) => void;
    protected onRemove: (ID: IUUID, oldResult: ICoreSearchResult<I>) => void;
    protected executer?: SearchExecuter<Q, I>;

    protected query = new Field(null as Q | null);

    protected nodes: Record<IUUID, ICoreSearchNode<Q, I>> = {};

    /** The update queues, in order of priority, empties searchUpdate before removal, etc */
    protected queues = {
        searchUpdate: new Queue<IUUID>(),
        removal: new Queue<IUUID>(),
        update: new Queue<IUUID>(),
        addition: new Queue<IUUID>(),
    };

    protected searching = new Field(false);
    protected searchPromise = Promise.resolve();
    protected continue: null | ((finished?: boolean) => void) = null;
    protected destroyed = new Field(false);

    /**
     * Creates a new search executor
     * @param config The search configuration
     */
    public constructor({
        searchable,
        onUpdate,
        onRemove,
        executer,
    }: ICoreSearchExecuterConfig<Q, I>) {
        this.rootSearchable = searchable;
        this.onUpdate = onUpdate;
        this.onRemove = onRemove;
        this.executer = executer;

        // Add the root searchable, with itself as its own parent
        this.scheduleAddition(searchable, searchable.ID, true);
    }

    /**
     * Sets the query to look for
     * @param query The new query
     * @returns A promise that resolves when the search fully finished
     */
    public async setQuery(query: Q | null): Promise<void> {
        if (this.destroyed.get()) return;

        this.query.set(query);
        // this.results.forEach(ID => this.queues.searchUpdate.push(ID));
        Object.entries(this.nodes).forEach(([ID, node]) => {
            if (node.result) this.queues.searchUpdate.push(ID);
            else if (!node.update.scheduled) this.queues.update.push(ID);
            node.update = {
                scheduled: true,
                required: true,
            };
        });
        this.initSearch();
        return this.searchPromise;
    }

    /**
     * Retrieves the current query
     * @param hook The hook to subscribe to changes
     * @returns The current query
     */
    public getQuery(hook?: IDataHook): Q | null {
        return this.query.get(hook);
    }

    /**
     * Retrieves whether a search is currently in progress
     * @param hook The hook to subscribe to changes
     * @returns Whether any search is in progress
     */
    public isSearching(hook?: IDataHook): boolean {
        return this.searching.get(hook);
    }

    /**
     * Destroys the search executer
     * @param keepResults Whether to preserve the items (instead of calling onRemove for all)
     */
    public destroy(keepResults?: boolean): void {
        this.destroyed.set(true);
        Object.values(this.nodes).forEach(node => {
            node.destroyHook?.();
            if (!keepResults && node.result?.item)
                this.onRemove(node.searchable.ID, node.result);
        });
    }

    /**
     * Starts or continues the search, if it wasn't already going
     */
    protected initSearch(): void {
        this.continue?.();
        if (!this.searching.get()) this.search();
    }

    /**
     * Starts the search process
     * @returns A promise that resolves once the search finishes
     */
    protected search(): Promise<void> {
        this.searchPromise = (async () => {
            const queues = this.queues;
            let runningPromise = new PromiseAll();

            this.searching.set(true);
            let running = true;

            while (running && !this.destroyed.get()) {
                const query = this.query.get();
                let ID: IUUID | undefined;

                if (query != null && (ID = queues.searchUpdate.pop())) {
                    runningPromise.add(this.updateNode(query, ID));
                } else if ((ID = queues.removal.pop())) {
                    this.removeNode(ID);
                } else if (query != null && (ID = queues.update.pop())) {
                    runningPromise.add(this.updateNode(query, ID));
                } else if (query != null && (ID = queues.addition.pop())) {
                    runningPromise.add(this.updateNode(query, ID));
                } else {
                    // Create a promise that can be used to listen for any activity requests
                    let finish: (() => void) | null = null;
                    const continuePromise = new Promise(res => {
                        this.continue = () => {
                            finish = null;
                            res();
                        };
                        finish = res;
                    });

                    // If all running promises finish before the search got continued (finish is still present),
                    // Finish the search by invoking continue, and setting running to false
                    runningPromise.promise.then(() => {
                        if (finish) {
                            running = false;
                            this.searching.set(false);
                            finish();
                        }
                    });

                    // Wait for more items to come along
                    await continuePromise;
                    this.continue = null;
                }
            }
        })();

        return this.searchPromise;
    }

    /* Schedule node changes */
    /**
     * Schedules the addition of a new searchable
     * May also be used to 'add' nodes that are already in the system, under a new parent
     * @param searchable The searchable node to be scheduled
     * @param parent The parent of the searchable node to add
     * @param dontStartSearch Whether to prevent a search from starting based on this addition
     */
    protected scheduleAddition(
        searchable: ISearchable<Q, I>,
        parent: IUUID,
        dontStartSearch?: boolean
    ): void {
        const ID = searchable.ID;
        const node = this.nodes[ID];
        if (node) {
            node.parents.add(parent);
            node.removal.required = false;
            if (node.update.required && !node.update.scheduled) this.scheduleUpdate(ID);
        } else {
            this.nodes[ID] = {
                removal: {
                    scheduled: false,
                    required: false,
                },
                update: {
                    scheduled: true,
                    required: true,
                },
                parents: new Set([parent]),
                executeVersion: 0,
                searchable,
            };
            this.queues.addition.push(ID);
        }
        if (!dontStartSearch) this.initSearch();
    }

    /**
     * Schedules an update for the node with the given ID
     * @param ID The ID of the node to schedule an update for
     */
    protected scheduleUpdate(ID: IUUID): void {
        const node = this.nodes[ID];
        if (node) {
            if (!node.update.scheduled) this.queues.update.push(ID);
            node.update = {
                required: true,
                scheduled: true,
            };
        }
        this.initSearch();
    }

    /**
     * Schedules the removal of the node with the given ID.
     * Only schedules the removal if this node has no more parents
     * @param ID The ID of the node to schedule the removal for
     * @param parent The parent from which this node was removed
     */
    protected scheduleRemoval(ID: IUUID, parent: IUUID): void {
        const node = this.nodes[ID];
        if (node) {
            const parents = node.parents;
            parents.delete(parent);

            if (parents.size == 0) {
                if (!node.removal.scheduled) this.queues.removal.push(ID);
                node.removal = {
                    required: true,
                    scheduled: true,
                };
            }
        }
        this.initSearch();
    }

    /* Manage nodes */
    /**
     * Updates the given node, using the new query
     * @param query The query to use for the update
     * @param ID The ID of the node to be updated
     * @returns A promise that resolves once the node is updated
     */
    protected async updateNode(query: Q, ID: IUUID): Promise<void> {
        const node = this.nodes[ID];
        if (!node) return;
        node.update.scheduled = false;

        // If the node is about to be deleted, skip updating
        if (node.removal.required) return;

        // If update is no longer required, skip it
        if (!node.update.required) return;
        node.update.required = false;

        // Execute the search
        const version = node.executeVersion++;
        node.destroyHook?.();

        const [hook, destroyHook] = createCallbackHook(() => this.scheduleUpdate(ID));
        const {children, item, patternMatch} = await node.searchable.search(
            query,
            hook,
            this.executer
        );

        node.destroyHook = destroyHook;
        if (node.deleted || node.executeVersion == version) return;

        // Store the data
        const oldResult = node.result ?? {children: new Set()};
        const newChildren = new Set((children ?? []).map(({ID}) => ID));
        node.result = {
            item,
            patternMatch,
            children: newChildren,
        };

        // Schedule the child additions and removals
        const parentID = ID;
        const added = children?.filter(({ID}) => !oldResult.children.has(ID));
        const removed = [...oldResult.children].filter(ID => !newChildren.has(ID));
        added?.forEach(n => this.scheduleAddition(n, parentID));
        removed.forEach(ID => this.scheduleRemoval(ID, parentID));

        // Update the results
        this.onUpdate(ID, node.result, oldResult);
    }

    /**
     * Removes a node with the given ID from the system
     * @param ID The ID of the node to be removed
     */
    protected removeNode(ID: IUUID): void {
        const node = this.nodes[ID];
        if (!node) return;
        node.removal.scheduled = false;

        // If the update is no longer required, skip it
        if (!node.removal.required) return;
        node.removal.required = false;

        // Delete the node
        node.deleted = true;
        delete this.nodes[ID];
        node.destroyHook?.();

        const result = node.result;
        if (result) {
            // Schedule the children to be removed
            const parentID = ID;
            result.children.forEach(ID => this.scheduleRemoval(ID, parentID));

            // Remove any result data
            this.onRemove(ID, result);
        }
    }
}
