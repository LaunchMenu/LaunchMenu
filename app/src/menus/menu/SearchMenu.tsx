import React from "react";
import {PrioritizedMenu} from "./PrioritizedMenu";
import {IMenuItem} from "../items/_types/IMenuItem";
import {Field, IDataHook} from "model-react";
import {searchAction} from "../actions/types/search/searchAction";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";
import {IQuery} from "./_types/IQuery";
import {MenuView} from "../../components/menu/MenuView";
import {IIOContext} from "../../context/_types/IIOContext";
import {IPrioritizedMenuCategoryConfig} from "./_types/IAsyncMenuCategoryConfig";
import {InstantOpenTransition} from "../../components/stacks/transitions/open/InstantOpenTransition";
import {InstantCloseTransition} from "../../components/stacks/transitions/close/InstantCloseTransition";
import {SearchExecuter} from "../../utils/searchExecuter/SearchExecuter";
import {IUUID} from "../../_types/IUUID";
import {IPatternMatch} from "../../utils/searchExecuter/_types/IPatternMatch";

/**
 * A menu that can be used to perform a search on a collection of items
 */
export class SearchMenu extends PrioritizedMenu {
    protected searchItems = new Field([] as IMenuItem[]);
    protected showAllOnEmptySearch?: boolean;
    protected executer = new SearchExecuter({
        searchable: {
            id: "root",
            search: async (query: IQuery, hook: IDataHook) => ({
                children: searchAction.get(this.searchItems.get(hook)),
            }),
        },
        onAdd: (item: IPrioritizedMenuItem) => this.addItem(item),
        onRemove: (item: IPrioritizedMenuItem & {id: IUUID}) => this.removeItem(item),
    });

    /**
     * Creates a new search menu
     * @param context The context to be used by menu items
     * @param config The config of the category and other options
     */
    public constructor(
        context: IIOContext,
        config?: IPrioritizedMenuCategoryConfig & {
            /** Whether to show all items when the set search is empty (defaults to false) */
            showAllOnEmptySearch?: boolean;
        }
    ) {
        super(context, {
            ...config,
            // Forward the loading state from the search executer
            isLoading: {
                get: hook => {
                    const isSearching = this.executer.isSearching(hook);
                    const isLoading = config?.isLoading?.get(hook) ?? false;
                    return isSearching || isLoading;
                },
            },
        });
        this.showAllOnEmptySearch = config?.showAllOnEmptySearch;
    }

    /**
     * A default view for a search menu, with instant open and close transitions
     */
    public view = {
        view: <MenuView menu={this} />,
        transitions: {
            Open: InstantOpenTransition,
            Close: InstantCloseTransition,
        },
    };

    // Search management
    /**
     * Sets the search query
     * @param search The text to search with
     * @returns A promise that resolves once the new search has finished
     */
    public async setSearch(search: string): Promise<void> {
        // Update the default items (for empty searches)
        const oldQuery = this.executer.getQuery();
        if (this.showAllOnEmptySearch && (oldQuery?.search ?? "") != search) {
            const prioritizedItems = this.searchItems
                .get(null)
                .map(item => ({priority: 1, item}));

            if (search == "") this.addItems(prioritizedItems);
            else this.removeItems(prioritizedItems);
        }

        // Perform the search
        const query = {search};

        // Make a snappy first result
        setTimeout(() => this.flushBatch(), 10);
        return this.executer.setQuery(query);
    }

    /**
     * Sets the items to be searched in
     * @param items The items
     */
    public setSearchItems(items: IMenuItem[]): void {
        if (this.showAllOnEmptySearch && (this.executer.getQuery()?.search ?? "") == "") {
            this.removeItems(
                this.searchItems.get(null).map(item => ({item, priority: 1}))
            );
            this.addItems(items.map(item => ({item, priority: 1})));
        }
        this.searchItems.set(items);
    }

    /**
     * Adds an item to be searched in
     * @param item The item to add
     */
    public addSearchItem(item: IMenuItem): void {
        this.searchItems.set([...this.searchItems.get(null), item]);
        if (this.showAllOnEmptySearch && (this.executer.getQuery()?.search ?? "") == "")
            this.addItem({item, priority: 1});
    }

    /**
     * Removes an item and its search results
     * @param item The item to remove
     */
    public removeSearchItem(item: IMenuItem): void {
        this.searchItems.set(this.searchItems.get(null).filter(i => i != item));
        if (this.showAllOnEmptySearch && (this.executer.getQuery()?.search ?? "") == "")
            this.removeItem({item, priority: 1});
    }

    // Data retrieval
    /**
     * Retrieves the search text
     * @param hook The hook to subscribe to changes
     * @returns The search text
     */
    public getSearch(hook: IDataHook = null): string | null {
        return this.executer.getQuery(hook)?.search || null;
    }

    /**
     * Retrieves the highlight data to use for highlighting within menu items
     * @param hook The hook to subscribe to changes
     * @returns The highlight data
     */
    public getHighlight(hook: IDataHook = null): IQuery | null {
        return this.executer.getQuery(hook) || null;
    }

    /**
     * Retrieves the pattern matches from searches
     * @param hook The hook to subscribe to changes
     * @returns The patterns in searches
     */
    public getPatternMatches(hook: IDataHook = null): IPatternMatch[] {
        return this.executer.getPatternMatches(hook);
    }
}
