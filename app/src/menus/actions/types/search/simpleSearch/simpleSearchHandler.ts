import {searchAction} from "../searchAction";
import {ISimpleSearchData} from "./_types/ISimpleSearchData";
import {IQuery} from "../../../../menu/_types/IQuery";
import {ISimpleSearchQuery} from "./_types/ISimpleSearchQuery";
import {getSimpleSearchMatcher} from "../simpleSearch/SimpleSearchMatcher";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../../_types/IActionBinding";
import {IDataHook} from "model-react";
import {IMenuSearchable} from "../_types/IMenuSearchable";
import {getHooked} from "../../../../../utils/subscribables/getHooked";

/**
 * The weights for how importing matching name vs description vs tags is (higher = more important)
 */
export const simpleSearchWeights = {
    name: 1,
    description: 0.5,
    tags: 0.5,
};

/**
 * Retrieves the priority for the given item data
 * @param query The query to search for
 * @param data The data to search in
 * @returns The priority
 */
export function getSimplePriority(
    query: IQuery & Partial<ISimpleSearchQuery>,
    {
        name,
        description,
        tags,
    }: {
        name?: string | ((hook?: IDataHook) => string);
        description?: string | ((hook?: IDataHook) => string);
        tags?: string[] | ((hook?: IDataHook) => string[]);
    },
    hook?: IDataHook
): number {
    const matcher = getSimpleSearchMatcher(query);
    let priority = 0;

    if (name) priority += matcher.match(getHooked(name, hook)) * simpleSearchWeights.name;

    if (description)
        priority +=
            matcher.match(getHooked(description, hook)) * simpleSearchWeights.description;

    if (tags)
        getHooked(tags, hook).forEach(
            tag => (priority += matcher.match(tag) * simpleSearchWeights.tags)
        );
    return priority;
}

/**
 * A search handler that performs simple searches based off a regex match of a number of fields
 */
export const simpleSearchHandler = searchAction.createHandler(
    (data: ISimpleSearchData[], dataItems) => {
        // Map all the search data
        return data.flatMap((data, i): IMenuSearchable | IMenuSearchable[] => {
            const items = dataItems[i];

            // IF we have multiple items, make independent searchables for items and children
            if (items.length !== 1) {
                const itemMatchers = items.map((item, i) => ({
                    id: data.ids[i],
                    search: async (
                        query: IQuery & Partial<ISimpleSearchQuery>,
                        hook: IDataHook
                    ) => {
                        const priority = getSimplePriority(query, data, hook);
                        if (priority > 0)
                            return {item: {priority, id: data.ids[i], item}};
                        return {};
                    },
                }));

                const children = data.children;
                if (children)
                    return [
                        ...itemMatchers,
                        {
                            id: data.ids[i] + "-children",
                            search: async () => ({children: searchAction.get(children)}),
                        },
                    ];
                else return itemMatchers;
            } else {
                return {
                    id: data.ids[0],
                    search: async (
                        query: IQuery & Partial<ISimpleSearchQuery>,
                        hook: IDataHook
                    ) => {
                        const priority = getSimplePriority(query, data, hook);
                        const children = data.children
                            ? searchAction.get(data.children)
                            : undefined;
                        if (priority > 0)
                            return {
                                item: {priority, id: data.ids[0], item: items[0]},
                                children,
                            };
                        return {children};
                    },
                };
            }
        });
    }
);

/**
 * Creates a search binding including a newly generated id for an item
 * @param data The binding data
 * @returns The created binding
 */
export function createSimpleSearchBinding(
    data: Omit<ISimpleSearchData, "ids">
): IActionBinding<ISimpleSearchData> {
    return simpleSearchHandler.createBinding({ids: [uuid()], ...data});
}
