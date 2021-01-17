import React from "react";
import {getSearchIdentity} from "../../searchAction";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../../_types/IActionBinding";
import {Field, IDataHook, useDataHook} from "model-react";
import {IMenuSearchable} from "../../_types/IMenuSearchable";
import {IQuery} from "../../../../../menus/menu/_types/IQuery";
import {getHooked} from "../../../../../utils/subscribables/getHooked";
import {IAction} from "../../../../_types/IAction";
import {createAction} from "../../../../createAction";
import {ISimpleSearchMethod} from "./_types/ISimpleSearchMethod";
import {IIOContext} from "../../../../../context/_types/IIOContext";
import {ISimpleSearchExecutor} from "./_types/ISimpleSearchExecutor";
import {baseSettings} from "../../../../../application/settings/baseSettings/baseSettings";
import {SearchHighlighter} from "../../SearchHighlighter";
import {LFC} from "../../../../../_types/LFC";
import {ISearchHighlighterProps} from "../../_types/ISearchHighlighterProps";
import {Priority} from "../../../../../menus/menu/priority/Priority";
import {tracedRecursiveSearchHandler} from "../tracedRecursiveSearchHandler";
import {IPriority} from "../../../../../menus/menu/priority/_types/IPriority";

/** The search handlers that are available */
const searchHandlers = new Field([] as ISimpleSearchMethod[]);

/**
 * A search handler that performs simple searches based off a regex match of a number of fields.
 * If multiple items are bound to 1 simple search data object, only the first item will be used.
 */
export const simpleSearchHandler = createAction({
    name: "simple search",
    parents: [tracedRecursiveSearchHandler],
    core: (data: ISimpleSearchData[], _1, globalHook, targets) => {
        let search: ISimpleSearchExecutor;

        // Map all the search data
        const searchables = data.map(
            (data): IMenuSearchable => ({
                ID: data.id,
                search: async (query: IQuery, hook: IDataHook) => {
                    if (!search)
                        search = getSimpleSearchMethod(query.context, globalHook);
                    return search(
                        data,
                        () => getSearchIdentity(data.itemID, query, targets, hook),
                        query,
                        hook
                    );
                },
            })
        );
        return {
            children: searchables.map((searchable, i) => {
                const item = data[i];
                return tracedRecursiveSearchHandler.createBinding({
                    searchable,
                    itemID: item.itemID,
                    children: item.children,
                    showChild: item.showChild,
                });
            }),
            result: searchables,
        };
    },

    /**
     * Creates a new binding for this action
     * @param data The binding data
     * @param index The index of the binding
     * @returns The created binding
     */
    createBinding: function (
        data: Omit<ISimpleSearchData, "id">,
        index?: number
    ): IActionBinding<IAction<ISimpleSearchData, IMenuSearchable[]>> {
        return {
            action: this,
            index,
            ...(data instanceof Function
                ? {subscribableData: (h: IDataHook) => ({id: uuid(), ...data(h)})}
                : {
                      data: {id: uuid(), ...data},
                  }),
        } as any;
    },

    extras: {
        /**
         * Adds a simple search method
         * @param method The method to be added
         */
        addSearchMethod(method: ISimpleSearchMethod): void {
            const handlers = searchHandlers.get();
            if (!handlers.includes(method)) searchHandlers.set([...handlers, method]);
        },

        /**
         * Removes a simple search method
         * @param method The method to be added
         */
        removeSearchMethod(method: ISimpleSearchMethod): void {
            const handlers = searchHandlers.get();
            const index = handlers.indexOf(method);
            if (index != -1)
                searchHandlers.set([
                    ...handlers.slice(0, index),
                    ...handlers.slice(index + 1),
                ]);
        },

        /**
         * Retrieves the simple search methods
         * @param hook A hook to subscribe to changes
         * @returns The search methods
         */
        getSearchMethods(hook?: IDataHook): ISimpleSearchMethod[] {
            return [
                ...searchHandlers.get(hook),
                // Always include fuzzy search, dynamic import to prevent dependency cycle
                require("./fuzzySearchMethod/fuzzySearchMethod").fuzzySearchMethod,
            ];
        },

        /**
         * The search highlight component
         */
        Highlighter: (({query, pattern, children: text}) => {
            const [h] = useDataHook();
            const highlighter = query?.context.settings
                .get(baseSettings)
                .search.simpleSearchMethod.get(h).highlight;
            if (!query || !highlighter) return <>{getHooked(text, h)}</>;
            const searchText = pattern?.(query, h)?.searchText ?? query.search;
            return (
                <SearchHighlighter
                    query={query}
                    text={text}
                    searchText={searchText}
                    searchHighlighter={highlighter}
                />
            );
        }) as LFC<ISearchHighlighterProps>,
    },
});

/**
 * Retrieves the currently configured search method
 * @param context The context to extract the search method from
 * @param raterHook The data hook to listen for query rater changes
 * @returns The function to retrieve a searchable for a given item
 */
function getSimpleSearchMethod(
    context: IIOContext,
    raterHook?: IDataHook
): ISimpleSearchExecutor {
    const method: ISimpleSearchMethod = context.settings
        .get(baseSettings)
        .search.simpleSearchMethod.get(raterHook);

    // If the method has a searchable retriever, just return it
    if (method.getSearchable) return method.getSearchable;

    // If the method only has a grade function, create a searchable retriever
    const executor: ISimpleSearchExecutor = async (
        {id, name, description, content, tags, patternMatcher},
        getItem,
        query,
        hook
    ) => {
        const patternMatch = patternMatcher?.(query, hook);

        let priority: IPriority;

        // Handle the special case of an empty search, which is allowed if a pattern is matched and the item contains an empty tag
        if (patternMatch && patternMatch.searchText == "") {
            priority = getHooked(tags ?? [], hook)?.includes("") ? [Priority.MEDIUM] : 0;
        }
        //Handle the normal search rating
        else {
            priority =
                method.rate?.(
                    {
                        name: name && getHooked(name, hook),
                        description: description && getHooked(description, hook),
                        content: content && getHooked(content, hook),
                        tags: tags && getHooked(tags, hook),
                    },
                    patternMatch?.searchText ?? query.search,
                    query,
                    hook
                ) || 0;
        }

        const item = getItem();
        return {
            item:
                Priority.isPositive(priority) && item
                    ? {priority, ID: id, item}
                    : undefined,
            patternMatch,
        };
    };
    return executor;
}
