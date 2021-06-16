import React from "react";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../../_types/IActionBinding";
import {DataCacher, Field, IDataHook, proxyHook, useDataHook} from "model-react";
import {IMenuSearchable} from "../../_types/IMenuSearchable";
import {getHooked} from "../../../../../utils/subscribables/getHooked";
import {IAction} from "../../../../_types/IAction";
import {createAction, createStandardBinding} from "../../../../createAction";
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
import {IBindingCreatorConfig} from "../../../../_types/IBindingCreator";
import {adjustBindingInput} from "../../../../utils/adjustBindingInput";

/** The search handlers that are available */
const searchHandlers = new Field([] as ISimpleSearchMethod[]);

/**
 * A search handler that performs simple searches based off a match of a number of fields.
 * If multiple items are bound to 1 simple search data object, only the first item will be used.
 */
export const simpleSearchHandler = createAction({
    name: "simple search",
    parents: [tracedRecursiveSearchHandler],
    core: (data: ISimpleSearchData[]) => {
        let search: DataCacher<ISimpleSearchExecutor> | undefined;
        return {
            children: data.map(searchData => {
                const {ID, itemID, children, showChild} = searchData;
                return tracedRecursiveSearchHandler.createBinding({
                    ID,
                    itemID,
                    children,
                    showChild,
                    search: (query, getItem, hook) => {
                        if (!search)
                            search = new DataCacher(h =>
                                getSimpleSearchExecutor(
                                    query.context,
                                    proxyHook(h, {
                                        onCall: () => {
                                            // Reset the cached search
                                            search = undefined;
                                        },
                                    })
                                )
                            );

                        return search.get(hook)(searchData, getItem, query, hook);
                    },
                });
            }),
        };
    },

    /**
     * Creates a new binding for this action
     * @param config The binding config
     * @returns The created binding
     */
    createBinding: function (
        config:
            | Omit<ISimpleSearchData, "ID">
            | IBindingCreatorConfig<Omit<ISimpleSearchData, "ID">>
    ): IActionBinding<
        IAction<ISimpleSearchData, IMenuSearchable[], typeof tracedRecursiveSearchHandler>
    > {
        return createStandardBinding.call(
            this,
            adjustBindingInput(config, data => {
                return {ID: uuid(), ...data};
            })
        );
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
 * Retrieves the search executor for the currently configured search method
 * @param context The context to extract the search method from
 * @param raterHook The data hook to listen for query rater changes
 * @returns The function to retrieve a searchable for a given item
 */
function getSimpleSearchExecutor(
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
        {ID, name, description, content, tags, patternMatcher},
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
                Priority.isPositive(priority) && item ? {priority, ID, item} : undefined,
            patternMatch,
        };
    };
    return executor;
}
