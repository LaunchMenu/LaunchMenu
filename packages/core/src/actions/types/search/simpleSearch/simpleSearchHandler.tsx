import React from "react";
import {getSearchIdentity, searchAction} from "../searchAction";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {ISimpleSearchQuery} from "./_types/ISimpleSearchQuery";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../_types/IActionBinding";
import {Field, IDataHook, Loader} from "model-react";
import {IMenuSearchable} from "../_types/IMenuSearchable";
import {IQuery} from "../../../../menus/menu/_types/IQuery";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {IAction} from "../../../_types/IAction";
import {createAction} from "../../../createAction";
import {ISimpleSearchMethod} from "./_types/ISimpleSearchMethod";
import {IIOContext} from "../../../../context/_types/IIOContext";
import {ISimpleSearchExecutor} from "./_types/ISimpleSearchExecutor";
import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {SearchHighlighter} from "../SearchHighlighter";
import {useIOContext} from "../../../../context/react/useIOContext";
import {useDataHook} from "../../../../utils/modelReact/useDataHook";
import {LFC} from "../../../../_types/LFC";
import {ISearchHighlighterProps} from "../_types/ISearchHighlighterProps";

/** The search handlers that are available */
const searchHandlers = new Field([] as ISimpleSearchMethod[]);

/**
 * A search handler that performs simple searches based off a regex match of a number of fields.
 * If multiple items are bound to 1 simple search data object, only the first item will be used.
 */
export const simpleSearchHandler = createAction({
    name: "simple search",
    parents: [searchAction],
    core: (data: ISimpleSearchData[], _1, _2, targets) => {
        let search: ISimpleSearchExecutor;

        // Map all the search data
        const searchables = data.map(
            (data): IMenuSearchable => ({
                ID: data.id,
                search: async (
                    query: IQuery & Partial<ISimpleSearchQuery>,
                    hook: IDataHook
                ) => {
                    if (!search) search = getSimpleSearchMethod(query.context);
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
            children: searchables.map(searchable =>
                searchAction.createBinding(searchable)
            ),
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
            const handlers = searchHandlers.get(null);
            if (!handlers.includes(method)) searchHandlers.set([...handlers, method]);
        },
        /**
         * Removes a simple search method
         * @param method The method to be added
         */
        removeSearchMethod(method: ISimpleSearchMethod): void {
            const handlers = searchHandlers.get(null);
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
        getSearchMethods(hook: IDataHook = null): ISimpleSearchMethod[] {
            return [
                ...searchHandlers.get(hook),
                // Always include fuzzy search, dynamic import to prevent dependency cycle
                require("./fuzzySearchMethod/fuzzySearchMethod").fuzzySearchMethod,
            ];
        },

        /**
         * The search highlight component
         */
        Highlighter: (({query, children: text}) => {
            const [h] = useDataHook();
            const highlighter = query?.context.settings
                .get(baseSettings)
                .search.simpleSearchMethod.get(h).highlight;
            if (!query || !highlighter) return <>{getHooked(text, h)}</>;
            return (
                <SearchHighlighter
                    query={query}
                    text={text}
                    searchHighlighter={highlighter}
                />
            );
        }) as LFC<ISearchHighlighterProps>,
    },
});

/**
 * Retrieves the currently configured search method
 * @param context The context to extract the search method from
 * @returns The function to retrieve a searchable for a given item
 */
function getSimpleSearchMethod(context: IIOContext): ISimpleSearchExecutor {
    const method: ISimpleSearchMethod = context.settings
        .get(baseSettings)
        .search.simpleSearchMethod.get();

    // If the method has a searchable retriever, just return it
    if (method.getSearchable) return method.getSearchable;

    // If the method only has a grade function, create a searchable retriever
    const executor: ISimpleSearchExecutor = async (
        {
            children: childItemsGetter,
            id,
            name,
            description,
            content,
            tags,
            patternMatcher,
        },
        getItem,
        query,
        hook
    ) => {
        const priority =
            method.grade?.(
                {
                    name: name && getHooked(name, hook),
                    description: description && getHooked(description, hook),
                    content: content && getHooked(content, hook),
                    tags: tags && getHooked(tags, hook),
                },
                query,
                hook
            ) || 0;
        const childItems = getHooked(childItemsGetter, hook);
        const children = childItems && searchAction.get(childItems);
        const patternMatch = patternMatcher?.(query, hook);

        const item = getItem();
        return {
            item: priority > 0 && item ? {priority, ID: id, item} : undefined,
            children,
            patternMatch,
        };
    };
    return executor;
}
