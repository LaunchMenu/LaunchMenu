import {PrioritizedMenu} from "./PrioritizedMenu";
import {IPrioritizedMenuCategoryConfig} from "./_types/IAsyncMenuCategoryConfig";
import {IMenuItem} from "../items/_types/IMenuItem";
import {Field, IDataHook} from "model-react";
import {searchAction} from "../actions/types/search/searchAction";
import {GeneratorStreamExtractor} from "../../utils/generator/GeneratorStreamExtractor";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";
import {IQuery} from "./_types/IQuery";

/**
 * A menu that can be used to perform a search on a collection of items
 */
export class SearchMenu extends PrioritizedMenu<IQuery> {
    // The search data
    protected search = new Field(null as {search: string} | null);
    protected searchGenerators: {
        item: IMenuItem;
        generator: GeneratorStreamExtractor<IPrioritizedMenuItem<IQuery>> | undefined;
    }[] = [];

    /**
     * Creates a new search menu
     * @param categoryConfig The config of the category
     */
    public constructor(categoryConfig?: IPrioritizedMenuCategoryConfig<IQuery>) {
        super(categoryConfig);
    }

    /**
     * Sets the search query
     * @param search The text to search with
     * @returns A promise that resolves once the new search has been started
     */
    public async setSearch(search: string): Promise<void> {
        const query = {search};

        // Dispose of the old generators
        this.searchGenerators.forEach(data => {
            // Find and remove the generator
            const generatorIndex = data.generator
                ? this.generators.indexOf(data.generator)
                : -1;
            if (generatorIndex) this.generators.splice(generatorIndex, 1);

            // Stop the generator
            data.generator?.stop();
            data.generator = undefined;
        });

        // Filter items that no longer match
        await this.updateContents(query);

        // Update the search text
        this.search.set(query);

        // Start the new searches
        this.searchGenerators.forEach(data => {
            data.generator = this.performSearch(data.item, query);
        });
    }

    /**
     * Sets the items to be searched in
     * @param items The items
     */
    public setSearchItems(items: IMenuItem[]): void {
        // Detect what items were added and removed
        const addedItems = items.filter(
            it => !this.searchGenerators.find(({item}) => item == it)
        );
        const removedItems = this.searchGenerators.filter(
            ({item}) => !items.includes(item)
        );

        // Add the new items and remove the old
        removedItems.forEach(({item}) => this.removeSearchItem(item));
        addedItems.forEach(item => this.addSearchItem(item));
    }

    /**
     * Adds an item to be searched in
     * @param item The item to add
     */
    public addSearchItem(item: IMenuItem): void {
        const search = this.search.get(null);
        if (search != null) {
            const generator = this.performSearch(item, search);
            this.searchGenerators.push({
                item,
                generator,
            });
        } else {
            this.searchGenerators.push({
                item,
                generator: undefined,
            });
        }
    }

    /**
     * Performs an item search in a single item
     * @param item The item to search in
     * @param query The search text
     * @returns The generator that performs the search
     */
    protected performSearch(
        item: IMenuItem,
        query: {search: string}
    ): GeneratorStreamExtractor<IPrioritizedMenuItem<IQuery>> {
        return this.addItems(cb =>
            searchAction
                .get([item])
                .search(query, searchItem =>
                    cb({...searchItem, source: item} as IPrioritizedMenuItem<IQuery>)
                )
        );
    }

    /**
     * Removes an item and its search results
     * @param item The item to remove
     */
    public removeSearchItem(item: IMenuItem): void {
        const index = this.searchGenerators.findIndex(({item: fItem}) => fItem == item);
        if (index != -1) {
            const data = this.searchGenerators[index];
            this.searchGenerators.splice(index, 1);

            // Stop data retrieval
            data.generator?.stop();

            // Remove all the items from this item
            this.categoriesRaw.forEach(({items}) => {
                (items.get() as (IPrioritizedMenuItem<IQuery> & {
                    source?: IMenuItem;
                })[]).forEach(data => {
                    if (data?.source == item) this.removeItem(data);
                });
            });
        }
    }

    // Data retrieval
    /**
     * Retrieves the search text
     * @param hook The hook to subscribe to changes
     * @returns The search text
     */
    public getSearch(hook: IDataHook = null): string | null {
        return this.search.get(hook)?.search || null;
    }

    /**
     * Retrieves the highlight data to use for highlighting within menu items
     * @param hook The hook to subscribe to changes
     * @returns The highlight data
     */
    public getHighlight(hook: IDataHook = null): IQuery | null {
        return this.search.get(hook);
    }
}
