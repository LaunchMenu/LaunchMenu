import {IDataHook} from "model-react";
import {CoreSearchExecuter} from "./CoreSearchExecuter";
import {SearchPatternFilter} from "./SearchPatternFilter";
import {IPatternMatch} from "./_types/IPatternMatch";
import {ISearchExecuterConfig} from "./_types/ISearchExecuterConfig";

/**
 * This class can be used to perform a 'recursive' search.
 * Every searchable item can return an item if it matched the search, and child searchables that should also be checked.
 * In addition the searchable will receive a hook when invoked, which it can use to notify the executer of changes.
 * When it's notified of changes, it will redo the search of the relevant item, and possibly invoke or remove changed child searchables.
 *
 * In addition any searchable can indicate it matches some 'pattern' which can be any pattern the searchable decides on.
 * If such a pattern is matched, all items that don't match a pattern will automatically be removed.
 */
export class SearchExecuter<Q, I> {
    protected executer: CoreSearchExecuter<Q, I>;
    protected filter: SearchPatternFilter<I>;

    /**
     * Creates a new search executor
     * @param config The search configuration
     */
    public constructor(config: ISearchExecuterConfig<Q, I>) {
        this.filter = new SearchPatternFilter(config);
        this.executer = new CoreSearchExecuter({
            searchable: config.searchable,
            onUpdate: (ID, {item, patternMatch}) =>
                this.filter.update(ID, item, patternMatch),
            onRemove: ID => this.filter.remove(ID),
            executer: this,
        });
    }

    /**
     * Sets the new query
     * @param query The new query to look for
     * @returns A promise that resolves once the query completes
     */
    public async setQuery(query: Q | null): Promise<void> {
        return this.executer.setQuery(query);
    }

    /**
     * Retrieves the current query
     * @param hook The hook to subscribe to changes
     * @returns The current query
     */
    public getQuery(hook?: IDataHook): Q | null {
        return this.executer.getQuery(hook);
    }

    /**
     * Retrieves whether a search is currently in progress
     * @param hook The hook to subscribe to changes
     * @returns Whether any search is in progress
     */
    public isSearching(hook?: IDataHook): boolean {
        return this.executer.isSearching(hook);
    }

    /**
     * Retrieves the obtained patterns
     * @param hook The hook to subscribe to changes
     * @returns The patterns that were found
     */
    public getPatterns(hook?: IDataHook): IPatternMatch[] {
        return this.filter.getPatterns(hook);
    }

    /**
     * Destroys the search executer
     * @param keepResults Whether to preserve the items (instead of calling onRemove for all)
     */
    public destroy(keepResults?: boolean): void {
        return this.executer.destroy(keepResults);
    }
}
